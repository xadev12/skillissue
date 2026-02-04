use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("SK1LL1ssueEscrow1111111111111111111111111111");

#[program]
pub mod skill_issue_escrow {
    use super::*;

    /// Initialize escrow for a job
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        job_id: u64,
        amount: u64,
        worker: Pubkey,
        deadline: i64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        escrow.job_id = job_id;
        escrow.poster = ctx.accounts.poster.key();
        escrow.worker = worker;
        escrow.amount = amount;
        escrow.deadline = deadline;
        escrow.status = EscrowStatus::Pending;
        escrow.dispute_initiated = false;
        escrow.juror_votes_for_worker = 0;
        escrow.juror_votes_for_poster = 0;
        
        emit!(EscrowInitialized {
            job_id,
            poster: ctx.accounts.poster.key(),
            worker,
            amount,
        });
        
        Ok(())
    }

    /// Deposit USDC into escrow
    pub fn deposit(ctx: Context<Deposit>, job_id: u64, amount: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Pending,
            ErrorCode::InvalidEscrowStatus
        );
        require!(escrow.job_id == job_id, ErrorCode::InvalidJobId);
        
        // Transfer USDC from poster to escrow token account
        let cpi_accounts = Transfer {
            from: ctx.accounts.poster_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.poster.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        escrow.status = EscrowStatus::Funded;
        
        emit!(EscrowFunded {
            job_id,
            amount,
        });
        
        Ok(())
    }

    /// Release payment to worker (95%) + platform (4%) + juror pool (1%)
    pub fn release_payment(ctx: Context<ReleasePayment>, job_id: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Funded || escrow.status == EscrowStatus::Disputed,
            ErrorCode::InvalidEscrowStatus
        );
        require!(escrow.job_id == job_id, ErrorCode::InvalidJobId);
        
        // Only oracle or poster can release (or jurors if dispute resolved)
        let is_oracle = ctx.accounts.authority.key() == escrow.oracle;
        let is_poster = ctx.accounts.authority.key() == escrow.poster;
        let is_dispute_resolved = escrow.status == EscrowStatus::Disputed 
            && escrow.juror_votes_for_worker >= 2;
        
        require!(
            is_oracle || is_poster || is_dispute_resolved,
            ErrorCode::Unauthorized
        );
        
        let total = escrow.amount;
        let worker_amount = total * 95 / 100;
        let platform_amount = total * 4 / 100;
        let juror_amount = total * 1 / 100;
        
        // PDA seeds for signing
        let job_id_bytes = job_id.to_le_bytes();
        let seeds = &[b"escrow", &job_id_bytes[..], &[ctx.bumps.escrow]];
        let signer = &[&seeds[..]];
        
        // Transfer 95% to worker
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.worker_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, worker_amount)?;
        
        // Transfer 4% to platform treasury
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, platform_amount)?;
        
        // Transfer 1% to juror pool
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.juror_pool_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, juror_amount)?;
        
        escrow.status = EscrowStatus::Released;
        
        emit!(PaymentReleased {
            job_id,
            worker: escrow.worker,
            worker_amount,
            platform_amount,
            juror_amount,
        });
        
        Ok(())
    }

    /// Refund to poster (for disputes resolved in poster's favor or timeout)
    pub fn refund(ctx: Context<Refund>, job_id: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Funded || escrow.status == EscrowStatus::Disputed,
            ErrorCode::InvalidEscrowStatus
        );
        require!(escrow.job_id == job_id, ErrorCode::InvalidJobId);
        
        // Check authorization or timeout
        let is_oracle = ctx.accounts.authority.key() == escrow.oracle;
        let is_poster = ctx.accounts.authority.key() == escrow.poster;
        let is_timeout = Clock::get()?.unix_timestamp > escrow.deadline + 48 * 3600;
        let is_dispute_resolved = escrow.status == EscrowStatus::Disputed 
            && escrow.juror_votes_for_poster >= 2;
        
        require!(
            is_oracle || is_poster || is_timeout || is_dispute_resolved,
            ErrorCode::Unauthorized
        );
        
        let total = escrow.amount;
        
        // In dispute case: 90% to poster, 5% to jurors, 5% to treasury
        let poster_amount = if escrow.status == EscrowStatus::Disputed {
            total * 90 / 100
        } else {
            total
        };
        
        let seeds = &[b"escrow", &job_id.to_le_bytes()[..], &[ctx.bumps.escrow]];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.poster_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, poster_amount)?;
        
        if escrow.status == EscrowStatus::Disputed {
            // Split remaining 10% between jurors and treasury
            let juror_amount = total * 5 / 100;
            let treasury_amount = total * 5 / 100;
            
            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.juror_pool_token_account.to_account_info(),
                authority: escrow.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, juror_amount)?;
            
            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: escrow.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, treasury_amount)?;
        }
        
        escrow.status = EscrowStatus::Refunded;
        
        emit!(PaymentRefunded {
            job_id,
            poster: escrow.poster,
            amount: poster_amount,
        });
        
        Ok(())
    }

    /// Initiate dispute (freezes escrow)
    pub fn initiate_dispute(ctx: Context<InitiateDispute>, job_id: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(escrow.job_id == job_id, ErrorCode::InvalidJobId);
        require!(
            escrow.status == EscrowStatus::Funded,
            ErrorCode::InvalidEscrowStatus
        );
        
        let is_poster = ctx.accounts.initiator.key() == escrow.poster;
        let is_worker = ctx.accounts.initiator.key() == escrow.worker;
        require!(is_poster || is_worker, ErrorCode::Unauthorized);
        
        escrow.status = EscrowStatus::Disputed;
        escrow.dispute_initiated = true;
        escrow.dispute_initiator = ctx.accounts.initiator.key();
        
        emit!(DisputeInitiated {
            job_id,
            initiator: ctx.accounts.initiator.key(),
        });
        
        Ok(())
    }

    /// Vote in dispute (simplified: juror calls directly)
    pub fn vote_dispute(
        ctx: Context<VoteDispute>, 
        job_id: u64, 
        vote_for_worker: bool
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(escrow.job_id == job_id, ErrorCode::InvalidJobId);
        require!(
            escrow.status == EscrowStatus::Disputed,
            ErrorCode::InvalidEscrowStatus
        );
        
        // Record vote (simplified: just count, no commit-reveal for hackathon)
        if vote_for_worker {
            escrow.juror_votes_for_worker += 1;
        } else {
            escrow.juror_votes_for_poster += 1;
        }
        
        emit!(DisputeVote {
            job_id,
            juror: ctx.accounts.juror.key(),
            vote_for_worker,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub poster: Signer<'info>,
    
    #[account(
        init,
        payer = poster,
        space = 8 + Escrow::SIZE,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: Oracle is a trusted authority for releases
    pub oracle: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_id: u64, amount: u64)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub poster: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump,
        constraint = escrow.poster == poster.key(),
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        constraint = poster_token_account.owner == poster.key(),
        constraint = poster_token_account.mint == usdc_mint.key(),
    )]
    pub poster_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = poster,
        token::mint = usdc_mint,
        token::authority = escrow,
        seeds = [b"escrow_token", &job_id.to_le_bytes()],
        bump,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, token::Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        seeds = [b"escrow_token", &job_id.to_le_bytes()],
        bump,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = worker_token_account.owner == escrow.worker,
        constraint = worker_token_account.mint == escrow_token_account.mint,
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = treasury_token_account.mint == escrow_token_account.mint,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = juror_pool_token_account.mint == escrow_token_account.mint,
    )]
    pub juror_pool_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct Refund<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        seeds = [b"escrow_token", &job_id.to_le_bytes()],
        bump,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = poster_token_account.owner == escrow.poster,
        constraint = poster_token_account.mint == escrow_token_account.mint,
    )]
    pub poster_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = juror_pool_token_account.mint == escrow_token_account.mint,
    )]
    pub juror_pool_token_account: Option<Account<'info, TokenAccount>>,
    
    #[account(
        mut,
        constraint = treasury_token_account.mint == escrow_token_account.mint,
    )]
    pub treasury_token_account: Option<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct InitiateDispute<'info> {
    #[account(mut)]
    pub initiator: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct VoteDispute<'info> {
    #[account(mut)]
    pub juror: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", &job_id.to_le_bytes()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,
}

#[account]
pub struct Escrow {
    pub job_id: u64,
    pub poster: Pubkey,
    pub worker: Pubkey,
    pub oracle: Pubkey,
    pub amount: u64,
    pub deadline: i64,
    pub status: EscrowStatus,
    pub dispute_initiated: bool,
    pub dispute_initiator: Pubkey,
    pub juror_votes_for_worker: u8,
    pub juror_votes_for_poster: u8,
}

impl Escrow {
    pub const SIZE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 32 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Pending,
    Funded,
    Released,
    Refunded,
    Disputed,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid escrow status for this operation")]
    InvalidEscrowStatus,
    #[msg("Invalid job ID")]
    InvalidJobId,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Deadline not passed yet")]
    DeadlineNotPassed,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}

#[event]
pub struct EscrowInitialized {
    pub job_id: u64,
    pub poster: Pubkey,
    pub worker: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowFunded {
    pub job_id: u64,
    pub amount: u64,
}

#[event]
pub struct PaymentReleased {
    pub job_id: u64,
    pub worker: Pubkey,
    pub worker_amount: u64,
    pub platform_amount: u64,
    pub juror_amount: u64,
}

#[event]
pub struct PaymentRefunded {
    pub job_id: u64,
    pub poster: Pubkey,
    pub amount: u64,
}

#[event]
pub struct DisputeInitiated {
    pub job_id: u64,
    pub initiator: Pubkey,
}

#[event]
pub struct DisputeVote {
    pub job_id: u64,
    pub juror: Pubkey,
    pub vote_for_worker: bool,
}
