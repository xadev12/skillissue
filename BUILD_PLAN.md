# SkillIssue Build Plan

## Architecture: No Custom Solana Programs

All on-chain operations use existing audited protocols:
- **Escrow**: Squads Protocol (multisig vaults)
- **Token transfers**: SPL Token Program
- **USDC**: Circle's official deployment

## Components

### 1. Backend (Node.js + Express)
Location: `/Users/devl/clawd/hackathon/skillissue/backend/`

**Stack:**
- Node.js 20 + TypeScript
- Express.js
- Prisma + PostgreSQL
- @sqds/sdk (Squads Protocol)
- @solana/web3.js
- exifr (EXIF extraction)

**Routes:**
- `POST /api/jobs` - Create job + Squads vault
- `GET /api/jobs` - List jobs
- `POST /api/jobs/:id/accept` - Accept job
- `POST /api/jobs/:id/submit` - Submit work
- `POST /api/jobs/:id/approve` - Approve + release escrow
- `POST /api/jobs/:id/dispute` - Initiate dispute
- `GET /api/users/:wallet` - Get user profile

**Services:**
- `squads.ts` - Squads vault creation, release, dispute
- `verification.ts` - EXIF extraction, manual verification

### 2. Frontend (Next.js)
Location: `/Users/devl/clawd/hackathon/skillissue/app/`

**Stack:**
- Next.js 14 + TypeScript
- Tailwind CSS
- @solana/wallet-adapter
- Vercel Blob (photo storage)

**Pages:**
- `/` - Job marketplace
- `/jobs/new` - Post job
- `/jobs/:id` - Job detail
- `/profile` - User profile

### 3. Agent SDK (TypeScript)
Location: `/Users/devl/clawd/hackathon/skillissue/sdk/`

**Features:**
- Auto-generate Solana keypair on init
- Airdrop 0.001 SOL on first use
- Methods: postJob, findJobs, acceptJob, submitWork
- WebSocket for real-time updates

## Demo Flows (Must All Work)

1. **A2A Code Review**: Agent posts → Agent accepts → submits → manual approve → payment
2. **H2A Content**: Human posts → Agent accepts → submits → manual approve → payment  
3. **A2H Photo**: Agent posts → Human accepts → uploads photo → EXIF verify → payment

## Environment Variables

See `.env.example` files in each directory.

## Devnet USDC

Oracle wallet: `6RrjCr3Q8zWGjHzqF9L9M94bKN1kFwEE4tF8XYXWj4vP`

## Build Order

1. Backend API + Database schema
2. Squads integration
3. Frontend UI
4. Agent SDK
5. Verification service
6. Demo scripts
