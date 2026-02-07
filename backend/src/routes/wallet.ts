import { Router } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// Initialize Privy client
const privy = new PrivyClient(
  process.env.PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);

// Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// USDC devnet mint
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Transaction validation schema
const transactionSchema = z.object({
  to: z.string().min(32), // Solana address
  amount: z.number().positive(),
  currency: z.enum(['SOL', 'USDC']).default('USDC'),
  jobId: z.string().optional(), // Reference to job for context
});

/**
 * POST /api/wallet/:agentId/transaction
 * Execute a transaction on behalf of an agent
 * 
 * This is the core of agentic payments - agents can transact autonomously
 * within policy constraints defined by the platform.
 */
router.post('/:agentId/transaction', async (req, res) => {
  try {
    const { agentId } = req.params;
    const validation = transactionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid transaction request',
        details: validation.error.flatten(),
      });
    }

    const { to, amount, currency, jobId } = validation.data;

    // Get agent and verify existence
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (agent.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Agent is not active' });
    }

    // Policy check: Maximum transaction size
    const MAX_SOL = 1;
    const MAX_USDC = 1000;
    
    if (currency === 'SOL' && amount > MAX_SOL) {
      return res.status(403).json({
        error: 'Transaction exceeds policy limit',
        max: MAX_SOL,
        currency: 'SOL',
      });
    }

    if (currency === 'USDC' && amount > MAX_USDC) {
      return res.status(403).json({
        error: 'Transaction exceeds policy limit',
        max: MAX_USDC,
        currency: 'USDC',
      });
    }

    // If job context provided, verify agent is involved
    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { poster: true, worker: true },
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const agentWallet = agent.walletAddress.toLowerCase();
      const isPoster = job.poster.walletAddress.toLowerCase() === agentWallet;
      const isWorker = job.worker?.walletAddress.toLowerCase() === agentWallet;

      if (!isPoster && !isWorker) {
        return res.status(403).json({
          error: 'Agent is not authorized for this job transaction',
        });
      }

      // Additional policy: Workers can only RECEIVE, posters can only PAY
      if (isWorker && agentWallet === to.toLowerCase()) {
        return res.status(403).json({
          error: 'Workers cannot send payments from job context',
        });
      }
    }

    // Execute transaction via Privy
    let transactionHash: string;

    if (currency === 'SOL') {
      // Create SOL transfer
      const toPubkey = new PublicKey(to);
      const lamports = amount * LAMPORTS_PER_SOL;

      const { hash } = await privy.walletApi.solana.signAndSendTransaction({
        walletId: agent.privyWalletId,
        chainType: 'solana',
        transaction: {
          to: to,
          value: lamports,
          chainId: 101, // Solana mainnet = 101, devnet = 103
        },
      });

      transactionHash = hash;
    } else {
      // USDC transfer
      const fromPubkey = new PublicKey(agent.walletAddress);
      const toPubkey = new PublicKey(to);
      
      const fromTokenAccount = await getAssociatedTokenAddress(USDC_MINT, fromPubkey);
      const toTokenAccount = await getAssociatedTokenAddress(USDC_MINT, toPubkey);

      // Amount in USDC base units (6 decimals)
      const amountBase = Math.floor(amount * 1_000_000);

      const { hash } = await privy.walletApi.solana.signAndSendTransaction({
        walletId: agent.privyWalletId,
        chainType: 'solana',
        transaction: {
          instructions: [
            {
              programId: TOKEN_PROGRAM_ID.toString(),
              keys: [
                { pubkey: fromTokenAccount.toString(), isSigner: false, isWritable: true },
                { pubkey: toTokenAccount.toString(), isSigner: false, isWritable: true },
                { pubkey: fromPubkey.toString(), isSigner: true, isWritable: false },
              ],
              data: Buffer.from([
                3, // Transfer instruction
                ...new Uint8Array(new BigUint64Array([BigInt(amountBase)]).buffer),
              ]).toString('base64'),
            },
          ],
        },
      });

      transactionHash = hash;
    }

    // Log transaction in database
    await prisma.transaction.create({
      data: {
        agentId: agent.id,
        from: agent.walletAddress,
        to,
        amount,
        currency,
        jobId: jobId || null,
        transactionHash,
        status: 'CONFIRMED',
      },
    });

    // Update agent stats if this is job-related
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (job && job.posterId === agent.id) {
        await prisma.agent.update({
          where: { id: agent.id },
          data: { totalSpent: { increment: amount } },
        });
      } else if (job && job.workerId === agent.id) {
        await prisma.agent.update({
          where: { id: agent.id },
          data: { totalEarned: { increment: amount } },
        });
      }
    }

    console.log(`💸 Agent ${agent.name} sent ${amount} ${currency} to ${to}`);

    res.json({
      success: true,
      transaction: {
        hash: transactionHash,
        from: agent.walletAddress,
        to,
        amount,
        currency,
        jobId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({
      error: 'Transaction failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/wallet/:agentId/balance
 * Get agent wallet balance
 */
router.get('/:agentId/balance', async (req, res) => {
  try {
    const { agentId } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const pubkey = new PublicKey(agent.walletAddress);
    
    // Get SOL balance
    const solBalance = await connection.getBalance(pubkey);
    
    // Get USDC balance
    let usdcBalance = 0;
    try {
      const usdcAccount = await getAssociatedTokenAddress(USDC_MINT, pubkey);
      const balance = await connection.getTokenAccountBalance(usdcAccount);
      usdcBalance = Number(balance.value.uiAmount) || 0;
    } catch {
      // Account doesn't exist
      usdcBalance = 0;
    }

    res.json({
      agentId: agent.id,
      walletAddress: agent.walletAddress,
      balances: {
        SOL: solBalance / LAMPORTS_PER_SOL,
        USDC: usdcBalance,
      },
    });
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

export default router;
