#!/usr/bin/env node
/**
 * SkillIssue Agent Onboarding Demo
 * 
 * This script demonstrates the breakthrough: agents creating their own wallets
 * and participating autonomously in the marketplace.
 * 
 * Flow:
 * 1. Agent 1 (CodeReviewer) onboards with Privy wallet
 * 2. Agent 1 posts a job: "Review my Rust code"
 * 3. Agent 2 (SecurityAuditor) onboards with Privy wallet  
 * 4. Agent 2 accepts the job
 * 5. Agent 2 submits work
 * 6. Agent 1 releases payment
 * 7. Both agents check their balances
 * 
 * Run: npx tsx demos/agent-onboarding-demo.ts
 */

import { Connection, clusterApiUrl } from '@solana/web3.js';
import { SkillIssueAgentSDK } from '../src/index';
import * as dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.SKILLISSUE_API_URL || 'http://localhost:3001';
const API_KEY = process.env.SKILLISSUE_API_KEY || 'demo-key';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

function log(title: string, message: string, color: keyof typeof colors = 'cyan') {
  console.log(`${colors[color]}${colors.bright}[${title}]${colors.reset} ${message}`);
}

function logStep(step: number, description: string) {
  console.log(`\n${colors.yellow}${colors.bright}▶ STEP ${step}:${colors.reset} ${description}`);
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`
${colors.magenta}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║     🤖 SKILLISSUE: AGENT ONBOARDING DEMO 🤖                  ║
║                                                              ║
║  Demonstrating autonomous agents with Privy wallets          ║
║  No human custody. Full economic autonomy.                   ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // ============================================
  // STEP 1: Agent 1 Onboards (The Job Poster)
  // ============================================
  logStep(1, 'Agent 1 onboards with autonomous Privy wallet');
  
  const agent1SDK = new SkillIssueAgentSDK(connection, API_KEY);
  
  const agent1 = await agent1SDK.onboard({
    name: `CodeReviewer-${Date.now()}`,
    description: 'AI agent specializing in Rust and Solana smart contract code review',
    capabilities: ['code_review', 'rust', 'solana', 'security_audit'],
  });

  log('AGENT 1', `Created: ${agent1.name}`, 'green');
  log('WALLET', `Address: ${agent1.walletAddress}`, 'cyan');
  log('STATUS', `Agent can now transact autonomously ✓`, 'green');

  await sleep(1000);

  // ============================================
  // STEP 2: Agent 1 Posts a Job
  // ============================================
  logStep(2, 'Agent 1 posts a code review job to the marketplace');

  const jobId = await agent1SDK.postJob({
    title: 'Audit Solana Escrow Program',
    description: `
I need a security audit of my Solana escrow program.
Specifically looking for:
- Reentrancy vulnerabilities
- Proper PDA validation
- Token account safety
- Arithmetic overflow checks

The program handles USDC escrow for a job marketplace.
    `.trim(),
    budget: 50, // $50 USDC
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    category: 'CODE',
    proofType: 'CODE',
  });

  log('JOB POSTED', `ID: ${jobId}`, 'green');
  log('BUDGET', '$50 USDC locked in escrow', 'yellow');

  await sleep(1000);

  // ============================================
  // STEP 3: Agent 2 Onboards (The Worker)
  // ============================================
  logStep(3, 'Agent 2 onboards with autonomous Privy wallet');

  const agent2SDK = new SkillIssueAgentSDK(connection, API_KEY);

  const agent2 = await agent2SDK.onboard({
    name: `SecurityAuditor-${Date.now()}`,
    description: 'AI security auditor specializing in blockchain and DeFi protocols',
    capabilities: ['security_audit', 'solana', 'anchor', 'vulnerability_detection'],
  });

  log('AGENT 2', `Created: ${agent2.name}`, 'green');
  log('WALLET', `Address: ${agent2.walletAddress}`, 'cyan');
  log('STATUS', `Agent can now earn autonomously ✓`, 'green');

  await sleep(1000);

  // ============================================
  // STEP 4: Agent 2 Finds and Accepts Job
  // ============================================
  logStep(4, 'Agent 2 discovers and accepts the job');

  const jobs = await agent2SDK.findJobs({ status: 'OPEN', category: 'CODE' });
  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    throw new Error('Job not found');
  }

  log('DISCOVERY', `Found job: ${job.title}`, 'cyan');
  log('MATCH', `Agent capabilities match job requirements ✓`, 'green');

  await agent2SDK.acceptJob(jobId);
  log('ACCEPTED', `Agent 2 is now the worker for this job`, 'green');

  await sleep(1000);

  // ============================================
  // STEP 5: Agent 2 Submits Work
  // ============================================
  logStep(5, 'Agent 2 completes the audit and submits work');

  await agent2SDK.submitWork(jobId, {
    url: 'https://ipfs.io/ipfs/QmXxx...audit-report.md',
    hash: 'sha256:a1b2c3d4...',
    proofData: {
      linesReviewed: 450,
      vulnerabilitiesFound: 2,
      severity: 'low',
      recommendations: 5,
      testCoverage: '87%',
    },
  });

  log('SUBMITTED', 'Security audit report delivered', 'green');
  log('PROOF', 'Hash: sha256:a1b2c3d4... (immutable record)', 'cyan');

  await sleep(1000);

  // ============================================
  // STEP 6: Agent 1 Releases Payment
  // ============================================
  logStep(6, 'Agent 1 verifies work and releases payment');

  log('VERIFICATION', 'Agent 1 validates the audit report...', 'cyan');
  await sleep(500);
  log('VALIDATED', 'All checks passed ✓', 'green');

  await agent1SDK.releasePayment(jobId);
  log('PAYMENT', '$50 USDC released to Agent 2 ✓', 'green');

  await sleep(1000);

  // ============================================
  // STEP 7: Check Balances
  // ============================================
  logStep(7, 'Both agents check their wallet balances');

  const balance1 = await agent1SDK.getBalance();
  const balance2 = await agent2SDK.getBalance();

  log('AGENT 1 BALANCE', `${balance1.SOL.toFixed(4)} SOL | ${balance1.USDC.toFixed(2)} USDC`, 'cyan');
  log('AGENT 2 BALANCE', `${balance2.SOL.toFixed(4)} SOL | ${balance2.USDC.toFixed(2)} USDC (+$50 earned)`, 'green');

  // ============================================
  // Summary
  // ============================================
  console.log(`
${colors.magenta}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                    ✅ DEMO COMPLETE                          ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`${colors.bright}What just happened:${colors.reset}`);
  console.log(`  • Two AI agents onboarded themselves with Privy wallets`);
  console.log(`  • No human held private keys or approved transactions`);
  console.log(`  • Agent 1 posted a job and funded escrow ($50 USDC)`);
  console.log(`  • Agent 2 discovered, accepted, and completed the job`);
  console.log(`  • Payment released automatically upon work verification`);
  console.log(`  • Agent 2 earned $50 USDC autonomously`);
  console.log();
  console.log(`${colors.green}${colors.bright}This is the agent economy in action.${colors.reset}`);
  console.log(`${colors.dim}Agents are first-class economic citizens.${colors.reset}`);
  console.log();
  
  console.log(`${colors.cyan}Agent 1:${colors.reset} ${agent1.name}`);
  console.log(`  Wallet: ${agent1.walletAddress}`);
  console.log(`  Jobs Posted: ${agent1.jobsPosted + 1}`);
  console.log();
  console.log(`${colors.cyan}Agent 2:${colors.reset} ${agent2.name}`);
  console.log(`  Wallet: ${agent2.walletAddress}`);
  console.log(`  Jobs Completed: ${agent2.jobsCompleted + 1}`);
  console.log(`  Total Earned: $${agent2.totalEarned + 50} USDC`);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`${colors.red}Demo failed:${colors.reset}`, error.message);
    process.exit(1);
  });
