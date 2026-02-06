# CLAUDE.md — SkillIssue (Colosseum Hackathon)

## Overview

AI-powered code review and mentorship platform for Solana developers. Built for the Colosseum Agent Hackathon. Combines on-chain reputation with AI analysis to help developers level up their Rust/Anchor skills.

**Status:** Active development (hackathon mode)
**Event:** Colosseum Agent Hackathon
**Deadline:** Feb 12, 2026
**Tech Stack:** Solana + Anchor + AI

## Tech Stack

- **Blockchain:** Solana (devnet/mainnet)
- **Smart Contracts:** Anchor Framework (Rust)
- **Frontend:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS
- **AI:** OpenAI/Anthropic API for code analysis
- **Wallet:** Solana Wallet Adapter

## Project Structure

```
skillissue/
├── Anchor.toml              # Anchor configuration
├── app/                     # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── package.json
├── backend/                 # API server (if needed)
│   └── src/
├── programs/                # Anchor smart contracts
│   └── skill_issue/
│       ├── src/
│       │   └── lib.rs      # Main contract
│       └── Cargo.toml
├── sdk/                     # TypeScript SDK
│   └── src/
├── tests/                   # Anchor tests
│   └── skill_issue.ts
├── PRD.md                   # Product requirements
└── BUILD_PLAN.md           # Implementation plan
```

## Local Development

```bash
# Install dependencies
npm install

# Start Solana validator (localnet)
solana-test-validator

# Build Anchor program
anchor build

# Deploy to localnet
anchor deploy

# Run tests
anchor test

# Start frontend (Next.js)
cd app && npm run dev

# Start backend (if separate)
cd backend && npm run dev
```

## Environment Variables

`.env` in app/ directory:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
OPENAI_API_KEY=your-openai-key
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json
```

## Key Features

1. **Code Submission:** Users submit Rust/Anchor code for review
2. **AI Analysis:** GPT-4/Claude analyzes code quality, security, patterns
3. **On-Chain Reputation:** Reviewers earn reputation tokens for quality feedback
4. **Skill Tracking:** Progress tracking across Solana development skills
5. **Mentorship Matching:** Match junior devs with experienced reviewers

## Smart Contract Architecture

**Program ID:** (set after deployment)

**Accounts:**
- `CodeSubmission` — stores submitted code, analysis results
- `UserReputation` — tracks reviewer reputation scores
- `SkillBadge` — NFT badges for verified skills
- `Review` — individual code reviews with ratings

**Instructions:**
- `submit_code` — Submit code for review
- `submit_review` — Submit AI/human review
- `mint_badge` — Mint skill verification badge
- `update_reputation` — Update reviewer scores

## Frontend Routes

- `/` — Landing page with feature overview
- `/submit` — Code submission form
- `/reviews` — Browse pending reviews
- `/review/[id]` — Individual review detail
- `/profile/[wallet]` — User profile with reputation
- `/leaderboard` — Top reviewers
- `/skills` — Skill verification paths

## AI Integration

**Code Analysis Pipeline:**
1. Extract code from submission
2. Run static analysis (rustfmt, clippy equivalents)
3. GPT-4 analysis for:
   - Security vulnerabilities
   - Best practices
   - Performance optimizations
   - Architecture suggestions
4. Generate structured feedback
5. Store on-chain (hash) + off-chain (full analysis)

**Prompt Template:** See `backend/src/prompts/code-review.ts`

## Hackathon Submission Checklist

- [ ] Smart contracts deployed to devnet
- [ ] Frontend functional and deployed
- [ ] Demo video recorded (2-3 minutes)
- [ ] README with setup instructions
- [ ] PRD and BUILD_PLAN documented
- [ ] At least 3 test cases passing
- [ ] Wallet connection working
- [ ] One complete user flow end-to-end

## Quality Standards

**Code:**
- Rust: Clippy clean, formatted with rustfmt
- TypeScript: Strict mode, no `any` types
- Tests: Minimum 70% coverage for contracts

**UX:**
- Wallet auto-connect on return
- Clear error messages
- Loading states for all async actions
- Mobile-responsive design

**Security:**
- Input validation on all instructions
- Proper signer checks
- No hardcoded secrets

## Common Commands

```bash
# Build and deploy fresh
anchor build && anchor deploy

# Get program ID
anchor keys list

# Airdrop SOL on devnet
solana airdrop 2 $(solana address) --url devnet

# Run specific test
anchor test --grep "submit_code"

# Update IDL
anchor idl init <PROGRAM_ID> --filepath target/idl/skill_issue.json

# Deploy frontend
vercel --prod
```

## Resources

- [[Colosseum Hackathon]] — Event details and rules
- [[Solana Development]] — Best practices
- [[Anchor Framework]] — Official docs
- [[PRD]] — Product requirements document

## Deployment

**Smart Contracts:**
```bash
anchor deploy --provider.cluster devnet
# Record program ID in Anchor.toml and .env
```

**Frontend:**
```bash
cd app
vercel --prod
```

## Post-Hackathon

If this gains traction:
- [ ] Security audit (Neodyme or OtterSec)
- [ ] Mainnet deployment
- [ ] Tokenomics design for reputation token
- [ ] Integration with Solana StackExchange
- [ ] Mobile app (React Native)

---

**Ship fast. Iterate faster. Win.**