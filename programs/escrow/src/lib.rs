use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod skill_issue {
    use super::*;

    /// Post a new job with USDC escrow
    pub fn post_job(
        ctx: Context<PostJob>,
        job_id: u64,
        title: String,
        description_hash: [u8; 32],
        budget: u64,
        deadline: i64,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let escrow = &mut ctx.accounts.escrow;
        
        job.id = job_id;
        job.poster = ctx.accounts.poster.key();
        job.worker = None;
        job.title = title;
        job.description_hash = description_hash;
        job.budget = budget;
        job.status = JobStatus::Open;
        job.created_at = Clock::get()?.unix_timestamp;
        job.deadline = deadline;
        job.escrow = escrow.key();
        
        escrow.job_id = job_id;
        escrow.poster = ctx.accounts.poster.key();
        escrow.worker = None;
        escrow.amount = budget;
        escrow.status = EscrowStatus::Open;
        
        // Transfer USDC from poster to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.poster_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.poster.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, budget)?;
        
        emit!(JobPosted {
            job_id,
            poster: ctx.accounts.poster.key(),
            budget,
        });
        
        Ok(())
    }

    /// Accept an open job
    pub fn accept_job(ctx: Context<AcceptJob>, job_id: u64) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let escrow = &mut ctx.accounts.escrow;
        
        require!(job.status == JobStatus::Open, ErrorCode::JobNotOpen);
        require!(job.deadline > Clock::get()?.unix_timestamp, ErrorCode::DeadlinePassed);
        
        job.worker = Some(ctx.accounts.worker.key());
        job.status = JobStatus::InProgress;
        
        escrow.worker = Some(ctx.accounts.worker.key());
        escrow.status = EscrowStatus::Locked;
        
        emit!(JobAccepted {
            job_id,
            worker: ctx.accounts.worker.key(),
        });
        
        Ok(())
    }

    /// Submit work for review
    pub fn submit_work(
        ctx: Context<SubmitWork>,
        job_id: u64,
        proof_hash: [u8; 32],
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        
        require!(job.status == JobStatus::InProgress, ErrorCode::JobNotInProgress);
        require!(job.worker == Some(ctx.accounts.worker.key()), ErrorCode::NotWorker);
        
        job.status = JobStatus::Submitted;
        job.proof_hash = Some(proof_hash);
        
        emit!(WorkSubmitted {
            job_id,
            proof_hash,
        });
        
        Ok(())
    }

    /// Approve work and release payment (95% to worker, 5% platform fee)
    pub fn approve_work(ctx: Context<ApproveWork>, job_id: u64) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let escrow = &mut ctx.accounts.escrow;
        
        require!(job.status == JobStatus::Submitted, ErrorCode::WorkNotSubmitted);
        require!(job.poster == ctx.accounts.poster.key(), ErrorCode::NotPoster);
        
        let worker_amount = job.budget * 95 / 100;
        let platform_amount = job.budget * 5 / 100;
        
        // Transfer 95% to worker
        let seeds = &[
            b"escrow",
            &job_id.to_le_bytes()[..],
            &[ctx.bumps.escrow],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.worker_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, worker_amount)?;
        
        // Transfer 5% to platform treasury
        let cpi_accounts_treasury = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        let cpi_ctx_treasury = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts_treasury,
            signer,
        );
        token::transfer(cpi_ctx_treasury, platform_amount)?;
        
        job.status = JobStatus::Completed;
        escrow.status = EscrowStatus::Completed;
        
        // Update reputation
        let poster = &mut ctx.accounts.poster_user;
        let worker = &mut ctx.accounts.worker_user;
        
        poster.jobs_posted += 1;
        poster.total_spent += job.budget;
        
        worker.jobs_completed += 1;
        worker.total_earned += worker_amount;
        
        emit!(WorkApproved {
            job_id,
            worker: job.worker.unwrap(),
            amount: worker_amount,
        });
        
        Ok(())
    }

    /// Initiate dispute (freezes escrow)
    pub fn initiate_dispute(ctx: Context<InitiateDispute>, job_id: u64) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            job.status == JobStatus::Submitted || job.status == JobStatus::InProgress,
            ErrorCode::InvalidStatusForDispute
        );
        
        let is_poster = job.poster == ctx.accounts.caller.key();
        let is_worker = job.worker == Some(ctx.accounts.caller.key());
        require!(is_poster || is_worker, ErrorCode::NotAuthorized);
        
        job.status = JobStatus::Disputed;
        escrow.status = EscrowStatus::Disputed;
        
        emit!(DisputeInitiated {
            job_id,
            initiator: ctx.accounts.caller.key(),
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct PostJob<'info> {
    #[account(mut)]
    pub poster: Signer<'info>,
    
    #[account(
        init,
        payer = poster,
        space = 8 + Job::SIZE,
        seeds = [b"job", &job_id.to_le_bytes()],
        bump
    )]
    pub job: Account<'info, Job>,
    
    #[account(
        init,
        payer = poster,
        space = 8 + Escrow::SIZE,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        constraint = poster_token_account.owner == poster.key(),
        constraint = poster_token_account.mint == usdc_mint.key()
    )]
    pub poster_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = poster,
        token::mint = usdc_mint,
        token::authority = escrow,
        seeds = [b"escrow_token", &job_id.to_le_bytes()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, token::Mint>,
    
    #[account(
        init_if_needed,
        payer = poster,
        space = 8 + User::SIZE,
        seeds = [b"user", poster.key().as_ref()],
        bump
    )]
    pub poster_user: Account<'info, User>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct AcceptJob<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"job", &job_id.to_le_bytes()],
        bump
    )]
    pub job: Account<'info, Job>,
    
    #[account(
        mut,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        init_if_needed,
        payer = worker,
        space = 8 + User::SIZE,
        seeds = [b"user", worker.key().as_ref()],
        bump
    )]
    pub worker_user: Account<'info, User>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct SubmitWork<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"job", &job_id.to_le_bytes()],
        bump,
        constraint = job.worker == Some(worker.key())
    )]
    pub job: Account<'info, Job>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct ApproveWork<'info> {
    #[account(mut)]
    pub poster: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"job", &job_id.to_le_bytes()],
        bump,
        constraint = job.poster == poster.key()
    )]
    pub job: Account<'info, Job>,
    
    #[account(
        mut,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        seeds = [b"escrow_token", &job_id.to_le_bytes()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = worker_token_account.owner == job.worker.unwrap(),
        constraint = worker_token_account.mint == escrow_token_account.mint
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = treasury_token_account.mint == escrow_token_account.mint
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"user", poster.key().as_ref()],
        bump
    )]
    pub poster_user: Account<'info, User>,
    
    #[account(
        mut,
        seeds = [b"user", job.worker.unwrap().as_ref()],
        bump
    )]
    pub worker_user: Account<'info, User>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct InitiateDispute<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"job", &job_id.to_le_bytes()],
        bump
    )]
    pub job: Account<'info, Job>,
    
    #[account(
        mut,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
}

#[account]
pub struct Job {
    pub id: u64,
    pub poster: Pubkey,
    pub worker: Option<Pubkey>,
    pub title: String,
    pub description_hash: [u8; 32],
    pub budget: u64,
    pub status: JobStatus,
    pub created_at: i64,
    pub deadline: i64,
    pub escrow: Pubkey,
    pub proof_hash: Option<[u8; 32]>,
}

impl Job {
    pub const SIZE: usize = 8 + 32 + 1 + 32 + 4 + 32 + 8 + 1 + 8 + 8 + 32 + 1 + 32;
}

#[account]
pub struct Escrow {
    pub job_id: u64,
    pub poster: Pubkey,
    pub worker: Option<Pubkey>,
    pub amount: u64,
    pub status: EscrowStatus,
}

impl Escrow {
    pub const SIZE: usize = 8 + 32 + 1 + 8 + 1;
}

#[account]
pub struct User {
    pub wallet: Pubkey,
    pub reputation_score: u64,
    pub jobs_posted: u64,
    pub jobs_completed: u64,
    pub total_earned: u64,
    pub total_spent: u64,
    pub dispute_wins: u64,
    pub dispute_losses: u64,
}

impl User {
    pub const SIZE: usize = 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum JobStatus {
    Open,
    InProgress,
    Submitted,
    Completed,
    Disputed,
    Refunded,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Open,
    Locked,
    Submitted,
    Completed,
    Disputed,
    Refunded,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Job is not open")]
    JobNotOpen,
    #[msg("Job is not in progress")]
    JobNotInProgress,
    #[msg("Work has not been submitted")]
    WorkNotSubmitted,
    #[msg("Deadline has passed")]
    DeadlinePassed,
    #[msg("Not the job poster")]
    NotPoster,
    #[msg("Not the assigned worker")]
    NotWorker,
    #[msg("Not authorized")]
    NotAuthorized,
    #[msg("Invalid status for dispute")]
    InvalidStatusForDispute,
    #[msg("Invalid amount")]
    InvalidAmount,
}

#[event]
pub struct JobPosted {
    pub job_id: u64,
    pub poster: Pubkey,
    pub budget: u64,
}

#[event]
pub struct JobAccepted {
    pub job_id: u64,
    pub worker: Pubkey,
}

#[event]
pub struct WorkSubmitted {
    pub job_id: u64,
    pub proof_hash: [u8; 32],
}

#[event]
pub struct WorkApproved {
    pub job_id: u64,
    pub worker: Pubkey,
    pub amount: u64,
}

#[event]
pub struct DisputeInitiated {
    pub job_id: u64,
    pub initiator: Pubkey,
}
