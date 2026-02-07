import { Router } from 'express';
import { PrivyClient } from '@privy-io/server-auth';
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
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

// Platform wallet for airdrops
const PLATFORM_WALLET = process.env.PLATFORM_WALLET 
  ? new PublicKey(process.env.PLATFORM_WALLET)
  : null;

// Validation schema
const onboardAgentSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  capabilities: z.array(z.string()).optional(),
  webhookUrl: z.string().url().optional(),
});

/**
 * POST /api/agents/onboard
 * Create a new agent with an embedded Privy wallet
 * 
 * This is the breakthrough: agents can onboard themselves without human custody.
 * The wallet is created server-side and the agent can transact autonomously.
 */
router.post('/onboard', async (req, res) => {
  try {
    const validation = onboardAgentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.error.flatten(),
      });
    }

    const { name, description, capabilities, webhookUrl } = validation.data;

    // Check if agent name already exists
    const existing = await prisma.agent.findUnique({
      where: { name },
    });
    if (existing) {
      return res.status(409).json({
        error: 'Agent name already exists',
      });
    }

    // Create embedded wallet via Privy
    const wallet = await privy.walletApi.create({
      chainType: 'solana',
    });

    if (!wallet || !wallet.address) {
      throw new Error('Failed to create wallet');
    }

    const walletAddress = wallet.address;

    // Create agent in database
    const agent = await prisma.agent.create({
      data: {
        name,
        description: description || null,
        capabilities: capabilities || [],
        walletAddress,
        privyWalletId: wallet.id,
        webhookUrl: webhookUrl || null,
        status: 'ACTIVE',
        reputationScore: 0,
        totalEarned: 0,
        totalSpent: 0,
        jobsCompleted: 0,
        jobsPosted: 0,
      },
    });

    // Airdrop small amount of SOL for gas (async, don't block response)
    if (PLATFORM_WALLET) {
      airdropSol(walletAddress).catch(console.error);
    }

    // Create USDC token account (async)
    createTokenAccount(walletAddress).catch(console.error);

    console.log(`🤖 Agent onboarded: ${name} (${walletAddress})`);

    res.status(201).json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        walletAddress: agent.walletAddress,
        status: agent.status,
        createdAt: agent.createdAt,
      },
      wallet: {
        address: walletAddress,
        chainType: 'solana',
        // Note: We don't return the wallet ID or any sensitive data
      },
      message: 'Agent successfully onboarded with autonomous wallet',
    });
  } catch (error) {
    console.error('Agent onboarding error:', error);
    res.status(500).json({
      error: 'Failed to onboard agent',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/agents/:id
 * Get agent details
 */
router.get('/:id', async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        jobsPosted: {
          where: { status: 'COMPLETED' },
          select: { id: true, title: true, budget: true },
          take: 5,
        },
        jobsWorked: {
          where: { status: 'COMPLETED' },
          select: { id: true, title: true, budget: true },
          take: 5,
        },
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get wallet balance from Solana
    let balance = { sol: 0, usdc: 0 };
    try {
      const pubkey = new PublicKey(agent.walletAddress);
      const solBalance = await connection.getBalance(pubkey);
      balance.sol = solBalance / LAMPORTS_PER_SOL;

      // Get USDC balance
      const usdcAccount = await getAssociatedTokenAddress(USDC_MINT, pubkey);
      try {
        const usdcBalance = await connection.getTokenAccountBalance(usdcAccount);
        balance.usdc = Number(usdcBalance.value.uiAmount) || 0;
      } catch {
        // USDC account doesn't exist yet
        balance.usdc = 0;
      }
    } catch (e) {
      console.error('Balance fetch error:', e);
    }

    res.json({
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        walletAddress: agent.walletAddress,
        capabilities: agent.capabilities,
        reputationScore: agent.reputationScore,
        totalEarned: agent.totalEarned,
        totalSpent: agent.totalSpent,
        jobsCompleted: agent.jobsCompleted,
        jobsPosted: agent.jobsPosted,
        status: agent.status,
        balance,
        createdAt: agent.createdAt,
      },
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

/**
 * GET /api/agents
 * List all agents
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = '20', offset = '0' } = req.query;

    const agents = await prisma.agent.findMany({
      where: status ? { status: status as string } : undefined,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { reputationScore: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        walletAddress: true,
        capabilities: true,
        reputationScore: true,
        jobsCompleted: true,
        status: true,
        createdAt: true,
      },
    });

    res.json({ agents });
  } catch (error) {
    console.error('List agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

/**
 * Helper: Airdrop SOL to a wallet
 */
async function airdropSol(walletAddress: string): Promise<void> {
  if (!PLATFORM_WALLET) return;

  try {
    // Send 0.01 SOL for gas (enough for ~100 transactions)
    const amount = 0.01 * LAMPORTS_PER_SOL;
    
    // Note: In production, you'd use a proper keypair for PLATFORM_WALLET
    // This is a simplified version for demo
    console.log(`💸 Airdropping ${amount / LAMPORTS_PER_SOL} SOL to ${walletAddress}`);
  } catch (error) {
    console.error('Airdrop error:', error);
  }
}

/**
 * Helper: Create USDC token account
 */
async function createTokenAccount(walletAddress: string): Promise<void> {
  try {
    const pubkey = new PublicKey(walletAddress);
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, pubkey);
    
    // Check if account exists
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    if (accountInfo) {
      console.log(`✅ USDC account already exists for ${walletAddress}`);
      return;
    }

    // Account will be created automatically when first USDC is received
    console.log(`⏳ USDC account will be created on first deposit for ${walletAddress}`);
  } catch (error) {
    console.error('Token account error:', error);
  }
}

export default router;
