import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

// Program ID from Anchor.toml
const PROGRAM_ID = new PublicKey('SK1LL1ssueEscrow1111111111111111111111111111');
// USDC devnet mint
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Backend API URL
const API_URL = process.env.SKILLISSUE_API_URL || 'http://localhost:3001';

// Get oracle keypairs from environment (comma-separated base64 private keys)
function getOracleKeypairs(): Keypair[] {
  const keysEnv = process.env.ORACLE_WALLET_PRIVATE_KEYS;
  if (!keysEnv) {
    // Fallback to single key for backward compatibility
    const singleKey = process.env.ORACLE_WALLET_PRIVATE_KEY;
    if (!singleKey) {
      throw new Error('ORACLE_WALLET_PRIVATE_KEY(S) not set');
    }
    return [Keypair.fromSecretKey(Buffer.from(singleKey, 'base64'))];
  }
  
  return keysEnv.split(',').map(key => Keypair.fromSecretKey(Buffer.from(key.trim(), 'base64')));
}

// Get primary oracle (first one)
function getPrimaryOracle(): Keypair {
  const oracles = getOracleKeypairs();
  return oracles[0];
}

// Minimal IDL for the escrow program (multisig version)
const IDL: Idl = {
  version: "0.1.0",
  name: "skill_issue_escrow",
  instructions: [
    {
      name: "initializeEscrow",
      accounts: [
        { name: "poster", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "jobId", type: "u64" },
        { name: "amount", type: "u64" },
        { name: "worker", type: "publicKey" },
        { name: "deadline", type: "i64" },
        { name: "oracles", type: { vec: "publicKey" } },
        { name: "threshold", type: "u8" },
      ],
    },
    {
      name: "deposit",
      accounts: [
        { name: "poster", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "posterTokenAccount", isMut: true, isSigner: false },
        { name: "escrowTokenAccount", isMut: true, isSigner: false },
        { name: "usdcMint", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [
        { name: "jobId", type: "u64" },
        { name: "amount", type: "u64" },
      ],
    },
    {
      name: "approveRelease",
      accounts: [
        { name: "oracle", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
      ],
      args: [{ name: "jobId", type: "u64" }],
    },
    {
      name: "approveRefund",
      accounts: [
        { name: "oracle", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
      ],
      args: [{ name: "jobId", type: "u64" }],
    },
    {
      name: "executeRelease",
      accounts: [
        { name: "executor", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "escrowTokenAccount", isMut: true, isSigner: false },
        { name: "workerTokenAccount", isMut: true, isSigner: false },
        { name: "treasuryTokenAccount", isMut: true, isSigner: false },
        { name: "jurorPoolTokenAccount", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "jobId", type: "u64" }],
    },
    {
      name: "executeRefund",
      accounts: [
        { name: "executor", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "escrowTokenAccount", isMut: true, isSigner: false },
        { name: "posterTokenAccount", isMut: true, isSigner: false },
        { name: "jurorPoolTokenAccount", isMut: true, isSigner: false },
        { name: "treasuryTokenAccount", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "jobId", type: "u64" }],
    },
    {
      name: "initiateDispute",
      accounts: [
        { name: "initiator", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
      ],
      args: [{ name: "jobId", type: "u64" }],
    },
    {
      name: "voteDispute",
      accounts: [
        { name: "juror", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
      ],
      args: [
        { name: "jobId", type: "u64" },
        { name: "voteForWorker", type: "bool" },
      ],
    },
  ],
  accounts: [
    {
      name: "Escrow",
      type: {
        kind: "struct",
        fields: [
          { name: "jobId", type: "u64" },
          { name: "poster", type: "publicKey" },
          { name: "worker", type: "publicKey" },
          { name: "amount", type: "u64" },
          { name: "deadline", type: "i64" },
          { name: "status", type: { defined: "EscrowStatus" } },
          { name: "disputeInitiated", type: "bool" },
          { name: "disputeInitiator", type: "publicKey" },
          { name: "jurorVotesForWorker", type: "u8" },
          { name: "jurorVotesForPoster", type: "u8" },
          { name: "oracles", type: { vec: "publicKey" } },
          { name: "threshold", type: "u8" },
          { name: "releaseApprovals", type: { vec: "publicKey" } },
          { name: "refundApprovals", type: { vec: "publicKey" } },
        ],
      },
    },
  ],
  types: [
    {
      name: "EscrowStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "Pending" },
          { name: "Funded" },
          { name: "Released" },
          { name: "Refunded" },
          { name: "Disputed" },
        ],
      },
    },
  ],
};

interface CreateEscrowParams {
  jobId: string;
  posterWallet: string;
  budget: number;
  worker?: string;
  deadline?: Date;
  oracles?: string[];  // Optional: defaults to env oracles
  threshold?: number;  // Optional: defaults to 1
}

interface ReleaseEscrowParams {
  vaultAddress: string;
  workerWallet: string;
  amount: number;
  jobId: string;
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

// Create provider with given keypair
function createProvider(connection: Connection, wallet: Keypair): { provider: any, program: any } {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: async (tx: any) => {
        tx.partialSign(wallet);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        txs.forEach(tx => tx.partialSign(wallet));
        return txs;
      },
    } as any,
    { commitment: 'confirmed' }
  );
  
  const program = new Program(IDL as any, PROGRAM_ID, provider);
  return { provider, program };
}

export async function createJobEscrow(params: CreateEscrowParams): Promise<string> {
  const { jobId, posterWallet, budget, worker, deadline, oracles, threshold } = params;
  
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypairs = getOracleKeypairs();
    const primaryOracle = oracleKeypairs[0];
    
    const { program } = createProvider(connection, primaryOracle);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    
    // Use provided oracles or default to env oracles
    const oraclePubkeys = oracles 
      ? oracles.map(o => new PublicKey(o))
      : oracleKeypairs.map(k => k.publicKey);
    
    const requiredThreshold = threshold || Math.min(1, oraclePubkeys.length);
    
    await program.methods
      .initializeEscrow(
        new BN(jobId),
        new BN(budget * 1_000_000), // USDC has 6 decimals
        worker ? new PublicKey(worker) : primaryOracle.publicKey,
        new BN(deadline ? Math.floor(deadline.getTime() / 1000) : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60),
        oraclePubkeys,
        requiredThreshold
      )
      .accounts({
        escrow: escrowPDA,
        poster: new PublicKey(posterWallet),
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    
    console.log(`Created escrow for job ${jobId}:`, escrowPDA.toString());
    console.log(`  Oracles: ${oraclePubkeys.length}, Threshold: ${requiredThreshold}`);
    return escrowPDA.toString();
  } catch (error) {
    console.error('Failed to create escrow:', error);
    throw error;
  }
}

export async function depositToEscrow(jobId: string, amount: number, posterWallet: string): Promise<string> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypairs = getOracleKeypairs();
    const primaryOracle = oracleKeypairs[0];
    
    const { program } = createProvider(connection, primaryOracle);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    const [escrowTokenPDA] = getEscrowTokenPDA(jobId);
    
    const posterTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      new PublicKey(posterWallet)
    );
    
    const tx = await program.methods
      .deposit(new BN(jobId), new BN(amount * 1_000_000))
      .accounts({
        escrow: escrowPDA,
        poster: new PublicKey(posterWallet),
        posterTokenAccount,
        escrowTokenAccount: escrowTokenPDA,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();
    
    console.log(`Deposited ${amount} USDC to escrow ${escrowPDA.toString()}:`, tx);
    return tx;
  } catch (error) {
    console.error('Failed to deposit:', error);
    throw error;
  }
}

export async function approveRelease(jobId: string, oracleIndex?: number): Promise<string> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypairs = getOracleKeypairs();
    const oracle = oracleIndex !== undefined ? oracleKeypairs[oracleIndex] : oracleKeypairs[0];
    
    const { program } = createProvider(connection, oracle);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    
    const tx = await program.methods
      .approveRelease(new BN(jobId))
      .accounts({
        oracle: oracle.publicKey,
        escrow: escrowPDA,
      } as any)
      .rpc();
    
    console.log(`Oracle ${oracle.publicKey.toString().slice(0, 8)} approved release for job ${jobId}:`, tx);
    return tx;
  } catch (error) {
    console.error('Failed to approve release:', error);
    throw error;
  }
}

export async function approveRefund(jobId: string, oracleIndex?: number): Promise<string> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypairs = getOracleKeypairs();
    const oracle = oracleIndex !== undefined ? oracleKeypairs[oracleIndex] : oracleKeypairs[0];
    
    const { program } = createProvider(connection, oracle);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    
    const tx = await program.methods
      .approveRefund(new BN(jobId))
      .accounts({
        oracle: oracle.publicKey,
        escrow: escrowPDA,
      } as any)
      .rpc();
    
    console.log(`Oracle ${oracle.publicKey.toString().slice(0, 8)} approved refund for job ${jobId}:`, tx);
    return tx;
  } catch (error) {
    console.error('Failed to approve refund:', error);
    throw error;
  }
}

export async function executeRelease(jobId: string): Promise<string> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypairs = getOracleKeypairs();
    const primaryOracle = oracleKeypairs[0];
    
    const { program } = createProvider(connection, primaryOracle);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    const [escrowTokenPDA] = getEscrowTokenPDA(jobId);
    
    // Fetch escrow to get worker address
    const escrowAccount = await program.account.escrow.fetch(escrowPDA);
    const worker = escrowAccount.worker;
    
    const workerTokenAccount = await getAssociatedTokenAddress(USDC_MINT, worker);
    
    // Platform and juror accounts
    const platformWallet = new PublicKey(process.env.PLATFORM_WALLET || primaryOracle.publicKey);
    const jurorPoolWallet = new PublicKey(process.env.JUROR_POOL_WALLET || primaryOracle.publicKey);
    
    const treasuryTokenAccount = await getAssociatedTokenAddress(USDC_MINT, platformWallet);
    const jurorPoolTokenAccount = await getAssociatedTokenAddress(USDC_MINT, jurorPoolWallet);
    
    const tx = await program.methods
      .executeRelease(new BN(jobId))
      .accounts({
        executor: primaryOracle.publicKey,
        escrow: escrowPDA,
        escrowTokenAccount: escrowTokenPDA,
        workerTokenAccount,
        treasuryTokenAccount,
        jurorPoolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
    
    console.log(`Executed release for job ${jobId}:`, tx);
    return tx;
  } catch (error) {
    console.error('Failed to execute release:', error);
    throw error;
  }
}

export async function releaseEscrow(params: ReleaseEscrowParams): Promise<string> {
  // For backward compatibility - auto-collect oracle approvals then execute
  const { jobId } = params;
  
  try {
    // Get oracle keypairs
    const oracleKeypairs = getOracleKeypairs();
    const threshold = parseInt(process.env.ORACLE_THRESHOLD || '1');
    
    // Collect approvals from oracles until threshold reached
    for (let i = 0; i < Math.min(threshold, oracleKeypairs.length); i++) {
      try {
        await approveRelease(jobId, i);
      } catch (e) {
        // May already be approved
        console.log(`Oracle ${i} approval skipped (may already be approved)`);
      }
    }
    
    // Execute the release
    return await executeRelease(jobId);
  } catch (error) {
    console.error('Failed to release escrow:', error);
    throw error;
  }
}

export async function initiateDispute(vaultAddress: string, jobId: string, initiatorKeypair?: Keypair): Promise<string> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypairs = getOracleKeypairs();
    const initiator = initiatorKeypair || oracleKeypairs[0];
    
    const { program } = createProvider(connection, initiator);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    
    const tx = await program.methods
      .initiateDispute(new BN(jobId))
      .accounts({
        initiator: initiator.publicKey,
        escrow: escrowPDA,
      } as any)
      .rpc();
    
    console.log('Initiated dispute:', tx);
    return tx;
  } catch (error) {
    console.error('Failed to initiate dispute:', error);
    throw error;
  }
}

export async function voteDispute(jobId: string, voteForWorker: boolean, jurorKeypair: Keypair): Promise<string> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    
    const { program } = createProvider(connection, jurorKeypair);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    
    const tx = await program.methods
      .voteDispute(new BN(jobId), voteForWorker)
      .accounts({
        juror: jurorKeypair.publicKey,
        escrow: escrowPDA,
      } as any)
      .rpc();
    
    console.log(`Juror voted ${voteForWorker ? 'for worker' : 'for poster'}:`, tx);
    return tx;
  } catch (error) {
    console.error('Failed to vote on dispute:', error);
    throw error;
  }
}

// Export types for compatibility
export interface CreateEscrowParams {
  jobId: string;
  posterWallet: string;
  budget: number;
  worker?: string;
  deadline?: Date;
}

export interface ReleaseEscrowParams {
  vaultAddress: string;
  workerWallet: string;
  amount: number;
  jobId: string;
}

// Re-export legacy function for compatibility
export { createJobEscrow as createJobEscrowLegacy } from './squads';
