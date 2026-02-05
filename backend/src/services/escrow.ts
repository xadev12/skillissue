import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Program ID from Anchor.toml
const PROGRAM_ID = new PublicKey('SK1LL1ssueEscrow1111111111111111111111111111');
// USDC devnet mint
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Minimal IDL based on the Rust program
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
    {
      name: "initiateDispute",
      accounts: [
        { name: "escrow", isMut: true, isSigner: false },
        { name: "poster", isMut: false, isSigner: true },
        { name: "oracle", isMut: false, isSigner: false },
      ],
      args: [
        { name: "jobId", type: "u64" },
        { name: "jurors", type: { vec: "publicKey" } },
      ],
    },
    {
      name: "voteOnDispute",
      accounts: [
        { name: "escrow", isMut: true, isSigner: false },
        { name: "juror", isMut: false, isSigner: true },
        { name: "oracle", isMut: false, isSigner: false },
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
          { name: "jurorVotesForWorker", type: "u8" },
          { name: "jurorVotesForPoster", type: "u8" },
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
          { name: "Completed" },
          { name: "Disputed" },
          { name: "Resolved" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "InvalidEscrowStatus", msg: "Invalid escrow status" },
    { code: 6001, name: "InvalidJobId", msg: "Invalid job ID" },
    { code: 6002, name: "Unauthorized", msg: "Unauthorized" },
    { code: 6003, name: "DeadlinePassed", msg: "Deadline passed" },
  ],
};

interface CreateEscrowParams {
  jobId: string;
  posterWallet: string;
  budget: number;
  worker?: string;
  deadline?: Date;
}

interface ReleaseEscrowParams {
  vaultAddress: string;
  workerWallet: string;
  amount: number;
  jobId: string;
}

// Get oracle keypair from environment
function getOracleKeypair(): Keypair {
  const privateKeyBase64 = process.env.ORACLE_WALLET_PRIVATE_KEY;
  if (!privateKeyBase64) {
    throw new Error('ORACLE_WALLET_PRIVATE_KEY not set');
  }
  return Keypair.fromSecretKey(Buffer.from(privateKeyBase64, 'base64'));
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

export async function createJobEscrow(params: CreateEscrowParams): Promise<string> {
  const { jobId, posterWallet, budget, worker, deadline } = params;
  
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypair = getOracleKeypair();
    
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: oracleKeypair.publicKey,
        signTransaction: async (tx) => {
          tx.partialSign(oracleKeypair);
          return tx;
        },
        signAllTransactions: async (txs) => {
          txs.forEach(tx => tx.partialSign(oracleKeypair));
          return txs;
        },
      } as any,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(IDL as any, provider);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    
    await program.methods
      .initializeEscrow(
        new BN(jobId),
        new BN(budget * 1_000_000), // USDC has 6 decimals
        worker ? new PublicKey(worker) : oracleKeypair.publicKey,
        new BN(deadline ? deadline.getTime() / 1000 : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60)
      )
      .accounts({
        escrow: escrowPDA,
        poster: new PublicKey(posterWallet),
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    
    console.log(`Created escrow for job ${jobId}:`, escrowPDA.toString());
    return escrowPDA.toString();
  } catch (error) {
    console.error('Failed to create escrow:', error);
    throw error;
  }
}

export async function depositToEscrow(jobId: string, amount: number, posterWallet: string): Promise<string> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypair = getOracleKeypair();
    
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: oracleKeypair.publicKey,
        signTransaction: async (tx) => {
          tx.partialSign(oracleKeypair);
          return tx;
        },
        signAllTransactions: async (txs) => {
          txs.forEach(tx => tx.partialSign(oracleKeypair));
          return txs;
        },
      } as any,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(IDL as any, provider);
    
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
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
    
    console.log(`Deposited ${amount} USDC to escrow ${escrowPDA.toString()}:`, tx);
    return tx;
  } catch (error) {
    console.error('Failed to deposit:', error);
    throw error;
  }
}

export async function releaseEscrow(params: ReleaseEscrowParams): Promise<string> {
  const { vaultAddress, workerWallet, amount, jobId } = params;
  
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypair = getOracleKeypair();
    
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: oracleKeypair.publicKey,
        signTransaction: async (tx) => {
          tx.partialSign(oracleKeypair);
          return tx;
        },
        signAllTransactions: async (txs) => {
          txs.forEach(tx => tx.partialSign(oracleKeypair));
          return txs;
        },
      } as any,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(IDL as any, provider);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    const [escrowTokenPDA] = getEscrowTokenPDA(jobId);
    
    const workerTokenAccount = await getAssociatedTokenAddress(USDC_MINT, new PublicKey(workerWallet));
    
    // Platform and juror pool accounts (should be configured in env)
    const platformWallet = new PublicKey(process.env.PLATFORM_WALLET || oracleKeypair.publicKey);
    const jurorPoolWallet = new PublicKey(process.env.JUROR_POOL_WALLET || oracleKeypair.publicKey);
    
    const platformTokenAccount = await getAssociatedTokenAddress(USDC_MINT, platformWallet);
    const jurorPoolTokenAccount = await getAssociatedTokenAddress(USDC_MINT, jurorPoolWallet);
    
    const workerAmount = amount * 0.95;
    const platformAmount = amount * 0.04;
    const jurorAmount = amount * 0.01;
    
    const tx = await program.methods
      .releasePayment(new BN(jobId))
      .accounts({
        escrow: escrowPDA,
        oracle: oracleKeypair.publicKey,
        worker: new PublicKey(workerWallet),
        escrowTokenAccount: escrowTokenPDA,
        workerTokenAccount,
        platformTokenAccount,
        jurorPoolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
    
    console.log(`Released escrow payment:`, tx);
    console.log(`  Worker (95%): ${workerAmount} USDC`);
    console.log(`  Platform (4%): ${platformAmount} USDC`);
    console.log(`  Juror pool (1%): ${jurorAmount} USDC`);
    
    return tx;
  } catch (error) {
    console.error('Failed to release escrow:', error);
    throw error;
  }
}

export async function initiateDispute(vaultAddress: string, jurorWallets: string[], jobId: string): Promise<string> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const oracleKeypair = getOracleKeypair();
    
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: oracleKeypair.publicKey,
        signTransaction: async (tx) => {
          tx.partialSign(oracleKeypair);
          return tx;
        },
        signAllTransactions: async (txs) => {
          txs.forEach(tx => tx.partialSign(oracleKeypair));
          return txs;
        },
      } as any,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(IDL as any, provider);
    
    const [escrowPDA] = getEscrowPDA(jobId);
    const jurors = jurorWallets.map(w => new PublicKey(w));
    
    const tx = await program.methods
      .initiateDispute(new BN(jobId), jurors)
      .accounts({
        escrow: escrowPDA,
        poster: oracleKeypair.publicKey, // Should be actual poster
        oracle: oracleKeypair.publicKey,
      } as any)
      .rpc();
    
    console.log('Initiated dispute:', tx);
    return tx;
  } catch (error) {
    console.error('Failed to initiate dispute:', error);
    throw error;
  }
}

// Re-export for compatibility with existing routes
export { createJobEscrow as createJobEscrowLegacy } from './squads';
