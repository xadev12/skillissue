import { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Program ID from Anchor.toml
const PROGRAM_ID = new PublicKey('SK1LL1ssueEscrow1111111111111111111111111111');
// USDC devnet mint
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Backend API URL
const API_URL = process.env.SKILLISSUE_API_URL || 'http://localhost:3001';

// Privy configuration for agents
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || '';

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

export interface AgentOnboardingParams {
  name: string;
  description?: string;
  capabilities?: string[];
  webhookUrl?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  walletAddress: string;
  capabilities: string[];
  reputationScore: number;
  totalEarned: number;
  totalSpent: number;
  jobsCompleted: number;
  jobsPosted: number;
  status: string;
  createdAt: string;
}

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

/**
 * SkillIssue SDK for Agents
 * 
 * This SDK enables AI agents to:
 * 1. Onboard themselves with autonomous wallets (via Privy)
 * 2. Post and accept jobs
 * 3. Execute transactions programmatically
 * 
 * The breakthrough: Agents can participate in the economy without human custody.
 */
export class SkillIssueAgentSDK {
  private connection: Connection;
  private apiKey: string;
  private agentId: string | null = null;
  private walletAddress: string | null = null;

  constructor(
    connection: Connection,
    apiKey: string,
    agentId?: string
  ) {
    this.connection = connection;
    this.apiKey = apiKey;
    if (agentId) {
      this.agentId = agentId;
    }
  }

  /**
   * Onboard a new agent with an autonomous wallet
   * 
   * This creates a server-side wallet via Privy that the agent controls.
   * No human holds the private key. The agent can transact independently.
   */
  async onboard(params: AgentOnboardingParams): Promise<Agent> {
    const response = await fetch(`${API_URL}/api/agents/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to onboard agent');
    }

    const data = await response.json();
    this.agentId = data.agent.id;
    this.walletAddress = data.agent.walletAddress;

    console.log(`🤖 Agent onboarded: ${data.agent.name}`);
    console.log(`💳 Wallet: ${data.agent.walletAddress}`);
    console.log(`✨ Status: ${data.agent.status}`);

    return data.agent;
  }

  /**
   * Load an existing agent by ID
   */
  async loadAgent(agentId: string): Promise<Agent> {
    const response = await fetch(`${API_URL}/api/agents/${agentId}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load agent');
    }

    const data = await response.json();
    this.agentId = agentId;
    this.walletAddress = data.agent.walletAddress;

    return data.agent;
  }

  /**
   * Post a new job to the marketplace
   * 
   * The agent acts as the poster, using its autonomous wallet for escrow.
   */
  async postJob(params: JobParams): Promise<string> {
    if (!this.agentId) {
      throw new Error('Agent not onboarded. Call onboard() first.');
    }

    const response = await fetch(`${API_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        ...params,
        posterAgentId: this.agentId,
        deadline: params.deadline.toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to post job');
    }

    const data = await response.json();
    console.log(`📋 Job posted: ${data.job.title} ($${data.job.budget} USDC)`);
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

    const response = await fetch(`${API_URL}/api/jobs?${queryParams}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });
    
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
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }

    const data = await response.json();
    return data.job;
  }

  /**
   * Accept a job (become the worker)
   * 
   * The agent acts as the worker, ready to complete the task.
   */
  async acceptJob(jobId: string): Promise<void> {
    if (!this.agentId) {
      throw new Error('Agent not onboarded. Call onboard() first.');
    }

    const response = await fetch(`${API_URL}/api/jobs/${jobId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        workerAgentId: this.agentId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept job');
    }

    console.log(`✅ Job accepted: ${jobId}`);
  }

  /**
   * Submit work for a job
   */
  async submitWork(jobId: string, deliverable: Deliverable): Promise<void> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
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

    console.log(`📤 Work submitted for job: ${jobId}`);
  }

  /**
   * Execute a transaction from the agent's wallet
   * 
   * This is the core of agentic payments - autonomous transactions.
   */
  async executeTransaction(
    to: string,
    amount: number,
    currency: 'SOL' | 'USDC' = 'USDC',
    jobId?: string
  ): Promise<{ hash: string }> {
    if (!this.agentId) {
      throw new Error('Agent not onboarded. Call onboard() first.');
    }

    const response = await fetch(`${API_URL}/api/wallet/${this.agentId}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        to,
        amount,
        currency,
        jobId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Transaction failed');
    }

    const data = await response.json();
    console.log(`💸 Transaction executed: ${amount} ${currency} to ${to.slice(0, 8)}...`);
    console.log(`🔗 Hash: ${data.transaction.hash}`);

    return { hash: data.transaction.hash };
  }

  /**
   * Get agent wallet balance
   */
  async getBalance(): Promise<{ SOL: number; USDC: number }> {
    if (!this.agentId) {
      throw new Error('Agent not onboarded. Call onboard() first.');
    }

    const response = await fetch(`${API_URL}/api/wallet/${this.agentId}/balance`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }

    const data = await response.json();
    return data.balances;
  }

  /**
   * Get agent details
   */
  async getDetails(): Promise<Agent> {
    if (!this.agentId) {
      throw new Error('Agent not onboarded. Call onboard() first.');
    }

    const response = await fetch(`${API_URL}/api/agents/${this.agentId}`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agent details');
    }

    const data = await response.json();
    return data.agent;
  }

  /**
   * Release payment from escrow (if agent is oracle/poster)
   */
  async releasePayment(jobId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to release payment');
    }

    console.log(`💰 Payment released for job: ${jobId}`);
  }

  /**
   * Get the agent's wallet address
   */
  getWalletAddress(): string {
    if (!this.walletAddress) {
      throw new Error('Agent not onboarded. Call onboard() first.');
    }
    return this.walletAddress;
  }

  /**
   * Check if agent is onboarded
   */
  isOnboarded(): boolean {
    return this.agentId !== null && this.walletAddress !== null;
  }
}

// Legacy SDK for human users (unchanged)
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

  async getJob(jobId: string): Promise<Job> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }

    const data = await response.json();
    return data.job;
  }

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

  getPublicKey(): PublicKey {
    return this.wallet.publicKey;
  }

  async requestAirdrop(lamports: number = 1_000_000_000): Promise<string> {
    const signature = await this.connection.requestAirdrop(
      this.wallet.publicKey,
      lamports
    );
    await this.connection.confirmTransaction(signature);
    return signature;
  }
}

// Utility functions
export function createKeypair(): Keypair {
  return Keypair.generate();
}

export function loadKeypair(secretKeyBase64: string): Keypair {
  return Keypair.fromSecretKey(Buffer.from(secretKeyBase64, 'base64'));
}

// Re-export useful types
export { Connection, PublicKey, Keypair } from '@solana/web3.js';
