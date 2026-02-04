import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export interface JobConfig {
  title: string;
  description: string;
  budget: number; // USDC
  deadline: number; // Unix timestamp
}

export interface Job {
  id: BN;
  poster: PublicKey;
  worker: PublicKey | null;
  title: string;
  descriptionHash: Buffer;
  budget: BN;
  status: string;
  createdAt: BN;
  deadline: BN;
}

export class SkillIssueClient {
  private program: Program<any>;
  private wallet: Keypair;

  constructor(
    connection: Connection,
    wallet: Keypair,
    programId: PublicKey = PROGRAM_ID
  ) {
    this.wallet = wallet;
    const provider = new AnchorProvider(connection, {
      publicKey: wallet.publicKey,
      signTransaction: async (tx) => {
        tx.partialSign(wallet);
        return tx;
      },
      signAllTransactions: async (txs) => {
        txs.forEach(tx => tx.partialSign(wallet));
        return txs;
      },
    } as any, {});
    
    this.program = new Program(IDL as any, programId, provider);
  }

  async postJob(config: JobConfig): Promise<string> {
    const jobId = new BN(Date.now());
    const descriptionHash = Buffer.from(web3.sha256(config.description).slice(0, 32));
    const budgetLamports = new BN(config.budget * 1_000_000);
    const deadlineTimestamp = new BN(config.deadline);

    const [jobPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('job'), jobId.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), jobId.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    );

    const [escrowTokenPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow_token'), jobId.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    );

    const posterTokenAccount = await getAssociatedTokenAddress(USDC_MINT, this.wallet.publicKey);
    const [posterUserPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), this.wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const tx = await this.program.methods
      .postJob(jobId, config.title, Array.from(descriptionHash), budgetLamports, deadlineTimestamp)
      .accounts({
        poster: this.wallet.publicKey,
        job: jobPda,
        escrow: escrowPda,
        posterTokenAccount,
        escrowTokenAccount: escrowTokenPda,
        usdcMint: USDC_MINT,
        posterUser: posterUserPda,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  }

  async findJobs(): Promise<Job[]> {
    const accounts = await this.program.account.job.all();
    return accounts.map(acc => ({
      id: acc.account.id,
      poster: acc.account.poster,
      worker: acc.account.worker,
      title: acc.account.title,
      descriptionHash: Buffer.from(acc.account.descriptionHash),
      budget: acc.account.budget,
      status: Object.keys(acc.account.status)[0],
      createdAt: acc.account.createdAt,
      deadline: acc.account.deadline,
    }));
  }

  async acceptJob(jobId: BN): Promise<string> {
    const [jobPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('job'), jobId.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), jobId.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    );

    const [workerUserPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), this.wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

    const tx = await this.program.methods
      .acceptJob(jobId)
      .accounts({
        worker: this.wallet.publicKey,
        job: jobPda,
        escrow: escrowPda,
        workerUser: workerUserPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async submitWork(jobId: BN, proofHash: string): Promise<string> {
    const [jobPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('job'), jobId.toArrayLike(Buffer, 'le', 8)],
      PROGRAM_ID
    );

    const proofHashBytes = Buffer.from(proofHash.slice(0, 32));

    const tx = await this.program.methods
      .submitWork(jobId, Array.from(proofHashBytes))
      .accounts({
        worker: this.wallet.publicKey,
        job: jobPda,
      })
      .rpc();

    return tx;
  }
}

const IDL = {
  "version": "0.1.0",
  "name": "skill_issue",
  "instructions": [],
  "accounts": [],
  "types": [],
  "events": [],
  "errors": []
};

export default SkillIssueClient;
