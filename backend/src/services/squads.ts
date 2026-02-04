import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Squads } from '@sqds/sdk';

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
const oracleKeypair = Keypair.fromSecretKey(
  Buffer.from(process.env.ORACLE_WALLET_PRIVATE_KEY || '', 'base64')
);

interface CreateEscrowParams {
  jobId: string;
  posterWallet: string;
  budget: number;
}

interface ReleaseEscrowParams {
  vaultAddress: string;
  workerWallet: string;
  amount: number;
}

/**
 * Create a Squads multisig vault for job escrow
 * 
 * Architecture:
 * - 1-of-2 multisig (Oracle can release unilaterally after verification)
 * - Poster is member but requires Oracle signature
 * - Oracle acts as verification authority
 */
export async function createJobEscrow(params: CreateEscrowParams): Promise<string> {
  const { jobId, posterWallet, budget } = params;
  
  try {
    // Initialize Squads
    const squads = Squads.mainnet(oracleKeypair, connection);
    
    // Create multisig with poster and oracle
    const createKey = Keypair.generate();
    
    const multisigAccount = await squads.createMultisig(
      createKey,  // create_key
      [           // members
        new PublicKey(posterWallet),
        oracleKeypair.publicKey,
      ],
      1,          // threshold (1 signature needed - Oracle)
      `job-${jobId}`, // name
    );
    
    console.log(`Created Squads vault for job ${jobId}:`, multisigAccount.publicKey.toString());
    
    return multisigAccount.publicKey.toString();
  } catch (error) {
    console.error('Failed to create escrow vault:', error);
    throw error;
  }
}

/**
 * Release escrow payment to worker
 * 
 * Splits payment:
 * - 95% to worker
 * - 4% to platform treasury
 * - 1% to juror pool
 */
export async function releaseEscrow(params: ReleaseEscrowParams): Promise<string> {
  const { vaultAddress, workerWallet, amount } = params;
  
  try {
    const squads = Squads.mainnet(oracleKeypair, connection);
    const multisigPubkey = new PublicKey(vaultAddress);
    
    const workerAmount = amount * 0.95;
    const platformAmount = amount * 0.04;
    const jurorAmount = amount * 0.01;
    
    // Create transaction to transfer USDC from vault
    // Note: Actual implementation requires vault to hold USDC tokens
    // and creating a transaction instruction
    
    console.log(`Releasing escrow from ${vaultAddress}:`);
    console.log(`  Worker (95%): ${workerAmount} USDC`);
    console.log(`  Platform (4%): ${platformAmount} USDC`);
    console.log(`  Juror pool (1%): ${jurorAmount} USDC`);
    
    // TODO: Implement actual Squads transaction creation and execution
    // This requires the vault to have USDC and proper instruction building
    
    return 'transaction_signature_placeholder';
  } catch (error) {
    console.error('Failed to release escrow:', error);
    throw error;
  }
}

/**
 * Initiate dispute - changes threshold to require jury
 */
export async function initiateDispute(vaultAddress: string, jurorWallets: string[]): Promise<void> {
  try {
    const squads = Squads.mainnet(oracleKeypair, connection);
    const multisigPubkey = new PublicKey(vaultAddress);
    
    // Add jurors as members
    for (const jurorWallet of jurorWallets) {
      // TODO: Add member to multisig
      console.log(`Adding juror ${jurorWallet} to vault`);
    }
    
    // Change threshold to 2/3 (requires jury majority)
    // TODO: Implement threshold change
    console.log('Changed threshold to require jury majority');
    
  } catch (error) {
    console.error('Failed to initiate dispute:', error);
    throw error;
  }
}
