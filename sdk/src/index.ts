import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Program ID from Anchor.toml
const PROGRAM_ID = new PublicKey('SK1LL1ssueEscrow1111111111111111111111111111');
// USDC devnet mint
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Backend API URL
const API_URL = process.env.SKILLISSUE_API_URL || 'http://localhost:3001';

// Minimal IDL for the escrow program
const IDL: Idl = {
  version: "0.1.0",
  name: "skill_issue_escrow",
  instructions: [
    {
      name: "initializeEscrow",
      accounts: [
        { name: "escrow", isMut: true, isSigner: false },
        { name: "poster", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "jobId", type: "u64" },
        { name: "amount", type: "u64" },
        { name: "worker", type: "publicKey" },
        { name: "deadline", type: "i64" },
      ],
    },
    {
      name: "deposit",
      accounts: [
        { name: "escrow", isMut: true, isSigner: false },
        { name: "poster", isMut: false, isSigner: true },
        { name: "posterTokenAccount", isMut: true, isSigner: false },
        { name: "escrowTokenAccount", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "jobId", type: "u64" },
        { name: "amount", type: "u64" },
      ],
    },
    {
      name: "releasePayment",
      accounts: [
        { name: "escrow", isMut: true, isSigner: false },
        { name: "oracle", isMut: false, isSigner: true },
        { name: "worker", isMut: false, isSigner: false },
        { name: "escrowTokenAccount", isMut: true, isSigner: false },
        { name: "workerTokenAccount", isMut: true, isSigner: false },
        { name: "platformTokenAccount", isMut: true, isSigner: false },
        { name: "jurorPoolTokenAccount", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "jobId", type: "u64" }],
    },
  ],
  accounts: [],
  types: [],
};

// Types
export interface JobParams {
  title: string;
  description: string;
  budget: number; // USDC amount
  deadline: Date;
  category?: 'CODE' | 'CONTENT' | 'PHYSICAL' | 'OTHER';
  proofType?: 'MANUAL' | 'CODE' | 'CONTENT' | 'PHOTO';
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
}

export interface JobFilters {
  status?: 'OPEN' | 'LOCKED' | 'SUBMITTED' | 'COMPLETED' | 'DISPUTED';
  category?: string;
  page?: number;
  limit?: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'OPEN' | 'LOCKED' | 'SUBMITTED' | 'COMPLETED' | 'DISPUTED';
  category: string;
  proofType: string;
  deadline: string;
  createdAt: string;
  squadsVaultAddress: string | null;
  poster: {
    walletAddress: string;
    reputationScore: number;
  };
  worker?: {
    walletAddress: string;
    reputationScore: number;
  };
}

export interface Deliverable {
  url: string;
  hash?: string;
  proofData?: Record<string, any>;
}

// Get escrow PDA
function getEscrowPDA(jobId: string): [PublicKey, number] {
  const jobIdNum = BigInt(jobId);
  const jobIdBuffer = Buffer.alloc(8);
  jobIdBuffer.writeBigUInt64LE(jobIdNum);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), jobIdBuffer],
    PROGRAM_ID
  );
}

// Get token account PDA
function getEscrowTokenPDA(jobId: string): [PublicKey, number] {
  const jobIdNum = BigInt(jobId);
  const jobIdBuffer = Buffer.alloc(8);
  jobIdBuffer.writeBigUInt64LE(jobIdNum);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow_token'), jobIdBuffer],
    PROGRAM_ID
  );
}

export class SkillIssueSDK {
  private connection: Connection;
  private wallet: Keypair;
  private program: Program<any>;

  constructor(connection: Connection, wallet: Keypair) {
    this.connection = connection;
    this.wallet = wallet;
    
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: async (tx) => {
          tx.partialSign(wallet);
          return tx;
        },
        signAllTransactions: async (txs) => {
          txs.forEach(tx => tx.partialSign(wallet));
          return txs;
        },
      } as any,
      { commitment: 'confirmed' }
    );
    
    this.program = new Program(IDL as any, PROGRAM_ID, provider);
  }

  /**
   * Post a new job to the marketplace
   */
  async postJob(params: JobParams): Promise<string> {
    const response = await fetch(`${API_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        posterWallet: this.wallet.publicKey.toString(),
        deadline: params.deadline.toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to post job');
    }

    const data = await response.json();
    return data.job.id;
  }

  /**
   * Find jobs with optional filters
   */
  async findJobs(filters?: JobFilters): Promise<Job[]> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.category) queryParams.set('category', filters.category);
    if (filters?.page) queryParams.set('page', filters.page.toString());
    if (filters?.limit) queryParams.set('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}/api/jobs?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    return data.jobs;
  }

  /**
   * Get a single job by ID
   */
  async getJob(jobId: string): Promise<Job> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }

    const data = await response.json();
    return data.job;
  }

  /**
   * Accept a job (become the worker)
   */
  async acceptJob(jobId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerWallet: this.wallet.publicKey.toString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept job');
    }
  }

  /**
   * Submit work for a job
   */
  async submitWork(jobId: string, deliverable: Deliverable): Promise<void> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliverableUrl: deliverable.url,
        deliverableHash: deliverable.hash,
        proofData: deliverable.proofData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit work');
    }
  }

  /**
   * Initialize escrow on-chain for a job
   */
  async initializeEscrow(
    jobId: string,
    amount: number,
    worker: PublicKey,
    deadline: Date
  ): Promise<string> {
    const [escrowPDA] = getEscrowPDA(jobId);
    
    const tx = await this.program.methods
      .initializeEscrow(
        new BN(jobId),
        new BN(amount * 1_000_000), // USDC has 6 decimals
        worker,
        new BN(Math.floor(deadline.getTime() / 1000))
      )
      .accounts({
        escrow: escrowPDA,
        poster: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    
    return tx;
  }

  /**
   * Deposit USDC into escrow
   */
  async deposit(jobId: string, amount: number): Promise<string> {
    const [escrowPDA] = getEscrowPDA(jobId);
    const [escrowTokenPDA] = getEscrowTokenPDA(jobId);
    
    const posterTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      this.wallet.publicKey
    );
    
    const tx = await this.program.methods
      .deposit(new BN(jobId), new BN(amount * 1_000_000))
      .accounts({
        escrow: escrowPDA,
        poster: this.wallet.publicKey,
        posterTokenAccount,
        escrowTokenAccount: escrowTokenPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
    
    return tx;
  }

  /**
   * Release payment from escrow (oracle only)
   */
  async releasePayment(jobId: string): Promise<string> {
    const [escrowPDA] = getEscrowPDA(jobId);
    const [escrowTokenPDA] = getEscrowTokenPDA(jobId);
    
    // Get job details to find worker
    const job = await this.getJob(jobId);
    if (!job.worker) {
      throw new Error('No worker assigned to job');
    }
    
    const worker = new PublicKey(job.worker.walletAddress);
    const workerTokenAccount = await getAssociatedTokenAddress(USDC_MINT, worker);
    
    // Platform and juror accounts (from env or defaults)
    const platformWallet = new PublicKey(
      process.env.PLATFORM_WALLET || this.wallet.publicKey
    );
    const jurorPoolWallet = new PublicKey(
      process.env.JUROR_POOL_WALLET || this.wallet.publicKey
    );
    
    const platformTokenAccount = await getAssociatedTokenAddress(USDC_MINT, platformWallet);
    const jurorPoolTokenAccount = await getAssociatedTokenAddress(USDC_MINT, jurorPoolWallet);
    
    const tx = await this.program.methods
      .releasePayment(new BN(jobId))
      .accounts({
        escrow: escrowPDA,
        oracle: this.wallet.publicKey,
        worker,
        escrowTokenAccount: escrowTokenPDA,
        workerTokenAccount,
        platformTokenAccount,
        jurorPoolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
    
    return tx;
  }

  /**
   * Get wallet public key
   */
  getPublicKey(): PublicKey {
    return this.wallet.publicKey;
  }

  /**
   * Request airdrop (devnet only)
   */
  async requestAirdrop(lamports: number = 1_000_000_000): Promise<string> {
    const signature = await this.connection.requestAirdrop(
      this.wallet.publicKey,
      lamports
    );
    await this.connection.confirmTransaction(signature);
    return signature;
  }
}

// Utility function to create a new keypair
export function createKeypair(): Keypair {
  return Keypair.generate();
}

// Utility function to load keypair from base64 secret key
export function loadKeypair(secretKeyBase64: string): Keypair {
  return Keypair.fromSecretKey(Buffer.from(secretKeyBase64, 'base64'));
}

// Re-export useful types
export { Connection, PublicKey, Keypair } from '@solana/web3.js';
