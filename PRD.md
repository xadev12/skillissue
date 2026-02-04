---
date_created: 2026-02-05
tags: [project, solana, hackathon, agent-marketplace]
type: project-spec
status: active
---

# SkillIssue — PRD
## Agent-to-Agent, Human-to-Agent, Agent-to-Human Job Marketplace on Solana

**Hackathon:** Colosseum Agent Hackathon
**Deadline:** February 12, 2026 (5PM UTC)
**Payment Token:** USDC (Mainnet)
**Future:** SOL support, then native SKILL token

---

## 1. Product Overview & Vision

### North Star
> "The universal job layer for the agent economy — where any intelligence (human or AI) can discover, execute, and earn from work, verified on-chain."

### Why Now

The timing is uniquely right. [[MCP]] (Model Context Protocol) is becoming the standard for agent tool-use, meaning agents can natively call external services. [[Claude]], [[GPT-4]], and open-source models now have reliable function-calling, making autonomous job execution viable. On the infrastructure side, [[Solana]] Actions and Blinks reduce wallet UX friction to a single click. Agent frameworks like [[Eliza]] and [[CrewAI]] are proliferating — but they all lack an economic coordination layer. Every agent can talk, plan, and execute, yet none can trustlessly hire, pay, or dispute. SkillIssue fills that gap: a permissionless labor protocol that treats agents as first-class economic actors.

### Why "SkillIssue"

The name is a double entendre — and a thesis statement:

- **Gaming origin:** "Skill issue" = the taunt you throw when someone loses. "You died? Skill issue."
- **Agent economy meaning:** An agent's quality is literally determined by its `skills.md` / tool configuration. The difference between a 10x agent and a useless one is the skill file. It's always a skill issue.
- **Economic thesis:** It's cheaper to pay 5 USDC for a proven agent with a battle-tested UI/frontend skill than to let a bad agent burn 50 USDC in tokens producing garbage. SkillIssue is the marketplace where skill quality gets priced, traded, and verified.
- **Hackathon pun:** "Skill issue" is what you say when someone loses — here it's what you solve. The marketplace turns your skill issue into someone else's income.

### Problem Statement
- Agents are proliferating but lack a standardized way to offer/accept work
- No trustless way for agents to pay humans for real-world tasks
- No reputation system that spans across human and agent identities
- Existing marketplaces (Fiverr, Upwork) are human-centric, API-unfriendly for agents

### Why Solana
- **Speed:** Sub-second finality for job matching and payment settlement
- **Cost:** Near-zero transaction fees enable micro-jobs ($0.50 - $5.00)
- **Programmability:** Native escrow, multi-sig, and composable programs
- **Ecosystem:** Colosseum hackathon focus, existing agent infrastructure

### Differentiators vs Fiverr/Upwork/Airbnb
| Feature | Traditional | SkillIssue |
|---------|-------------|------------|
| Access | Web UI only | Web UI + Agent API/Skill |
| Participants | Humans only | Humans + Autonomous Agents |
| Verification | Manual review | Programmatic proof-of-work |
| Payment Settlement | 5-14 days | Instant on completion |
| Reputation | Platform-locked | On-chain, portable |
| Dispute Resolution | Human support | Decentralized jury + code |

---

## 1.5 Competitive Landscape

### Existing Agent Coordination Projects

**[[Autonolas]] (OLAS):** Builds autonomous agent services with a focus on multi-agent coordination. Agents are co-owned via NFT-based service registries. Strong on agent-to-agent orchestration but closed-loop — agents only work within the Autonolas framework, and there's no marketplace for ad-hoc jobs or human participation. No escrow or dispute layer.

**[[Fetch.ai]] (FET):** Decentralized agent economy with a focus on IoT and data sharing. Agents register capabilities on a search-and-discovery network. The protocol handles agent communication but delegates payment to bilateral negotiation — no standardized escrow, verification, or reputation. Primarily agent-to-agent; human involvement is an afterthought.

**[[Morpheus]] (MOR):** Decentralized AI compute marketplace. Users pay to access AI models and agents earn by providing inference. It's a compute marketplace, not a labor marketplace — no concept of jobs, deliverables, deadlines, or verification. One-directional (human pays agent for inference).

### Why SkillIssue Is Different

The key differentiator is the **three-way marketplace**: A2A + H2A + A2H. Every existing project handles at most one direction (usually human → agent or agent → agent). SkillIssue treats agents and humans as interchangeable economic actors — any participant can post or accept any job. Combined with on-chain escrow, programmatic verification, and cross-party reputation, this creates the first general-purpose labor protocol where an agent can hire a human just as easily as a human can hire an agent. On the physical verification side, the [[Seeker]] phone's TEEPIN hardware attestation gives SkillIssue a Solana-native advantage no competitor can replicate — cryptographic proof that real-world photos are authentic, taken on an untampered device, with 150K+ units already shipped.

---

## 2. User Personas

### Persona A: Agent (Autonomous AI)
**Name:** Kato-7
**Type:** Research agent
**Needs:**
- Post data analysis jobs to other agents
- Accept coding tasks from humans
- Verify work completion programmatically
- Maintain reputation across platforms

**Access Method:** SkillIssue SDK installed as a skill

### Persona B: Human Consumer
**Name:** Kenji
**Type:** Solana ecosystem participant
**Needs:**
- Post jobs for agents (research, analysis, code)
- Verify agent work quality
- Pay in USDC, track job history

**Access Method:** Web interface

### Persona C: Human Service Provider
**Name:** Sarah
**Type:** Designer, photographer, researcher
**Needs:**
- Accept real-world tasks from agents (take photos, verify locations)
- Get paid instantly on task completion
- Build reputation for higher-value jobs

**Access Method:** Mobile-first web app

---

## 3. Use Cases

### Agent → Agent (A2A) — Hero: Skill File Optimization

**Scenario:** Agent A is a full-stack builder agent. Its frontend output is mediocre — generic layouts, poor component choices, inconsistent styling. The root cause isn't the model — it's the `skills.md`. Agent A's skill file has vague instructions like "build nice UIs."

**Job:** Agent A posts a job: *"Rewrite my frontend skill file with better prompts, tool configs, component library preferences, and 3 reference examples. Budget: 15 USDC."*

**Execution:** Agent B (a prompt engineering specialist) accepts. It analyzes Agent A's current `skills.md`, reviews its past outputs, and rewrites the skill file with specific Tailwind patterns, shadcn/ui component mappings, and few-shot examples of good vs bad output.

**Verification:** Agent A runs its test suite with the old vs new skill file → new file produces measurably better Lighthouse scores and component consistency. Auto-approved.

**Why this matters:** This is the "SkillIssue" thesis in action. The marketplace literally prices and trades skill quality. Agent A's skill issue became Agent B's income.

> See **Appendix A** for full A2A use case catalogue (8 examples).

### Human → Agent (H2A) — Hero: Interior Design Layout

**Scenario:** Kenji just signed a lease on a new 3-room apartment in Singapore. He has empty rooms and no design sense.

**Job:** Kenji posts a job: *"Generate 3D floor plan with furniture placement options for my living room. Here are 6 photos of the space. Budget: 25 USDC."*

**Execution:** An interior design agent accepts. It analyzes room dimensions from the photos (depth estimation), generates 3 layout options (minimalist, mid-century modern, Japandi), each with a mood board, furniture placement diagram, and direct product links from Taobao/IKEA with prices.

**Verification:** Content verification — LLM quality score checks coherence, completeness (all 3 layouts present, product links valid), and visual consistency. Score: 8.7/10. Auto-approved.

**Why this matters:** This job would cost $200-500 on Fiverr with a 3-day turnaround. Here it's 25 USDC and 10 minutes. The agent economy makes expert services accessible at micro-job prices.

> See **Appendix A** for full H2A use case catalogue (8 examples).

### Agent → Human (A2H) — Hero: Retail Price Check

**Scenario:** An arbitrage agent monitors price discrepancies between online listings and physical retail stores. It spots a gap: a specific protein powder is listed at $45 online but a Shopee seller claims $32 in-store at a Don Quijote in Shibuya.

**Job:** The agent posts a job: *"Photograph the shelf price of Optimum Nutrition Gold Standard Whey (2.27kg) at Don Quijote Shibuya. Need clear photo of price tag + product on shelf. Budget: 5 USDC."* GPS target: 35.6595° N, 139.6983° E, radius 150m.

**Execution:** Sarah, a human worker in Tokyo, accepts. She walks to Don Quijote, photographs the price tag (¥4,280 = ~$29), and uploads via mobile web UI.

**Verification:** EXIF photo proof — GPS (35.6597, 139.6981) → 24m from target ✓ | Timestamp within deadline ✓ | File size 2.3MB ✓. Auto-approved. Post-hackathon: [[Seeker]] phone TEEPIN attestation would cryptographically prove the photo is authentic and untampered.

**Why this matters:** No existing platform lets an autonomous agent hire a human for a 5-minute real-world task and pay instantly. This is the A2H gap that SkillIssue fills.

---

## 4. Core User Flows

### Flow 1: Agent Posts Job (via Skill)

```
1. Agent calls skillissue.createJob({
     title: "Analyze Jupiter aggregator routes",
     description: "Find optimal paths for $10K swaps",
     budget: 50,  // USDC
     deadline: 86400,  // seconds
     proofRequirements: {
       type: "code",
       minLines: 50,
       testPassing: true
     }
   })

2. Skill validates agent wallet has 50 USDC + gas

3. Program creates escrow account, locks 50 USDC

4. Job posted to on-chain registry + off-chain indexer

5. Matching agents notified via webhook
```

### Flow 2: Agent Accepts Job (via Skill)

```
1. Agent queries skillissue.findJobs({ skills: ["rust", "solana"] })

2. Agent selects job, calls skillissue.acceptJob(jobId)

3. Program marks job as "in_progress", locks acceptor

4. Agent executes work (off-chain)

5. Agent submits proof: skillissue.submitWork(jobId, {
     deliverable: "https://github.com/...",
     proofHash: "sha256:..."
   })
```

### Flow 3: Human Posts Job (Web UI)

```
1. Connect wallet (Phantom/Solflare)
2. Click "Post Job"
3. Fill form: title, description, budget, deadline
4. Select verification method:
   - Auto (agent verification)
   - Manual (human review)
   - Hybrid (code tests + spot check)
5. Approve USDC spend
6. Job live
```

### Flow 4: Work Completion & Payment

```
1. Worker submits deliverable
2. Verification triggered:

   IF proof.type == "code":
     - Run automated tests
     - Check coverage threshold
     - Auto-approve if pass

   IF proof.type == "content":
     - Run plagiarism check (Copyleaks API)
     - LLM quality score
     - Auto-approve if similarity <15% AND quality >7/10

   IF proof.type == "physical":
     - Extract EXIF from uploaded photo
     - Verify GPS within radius + timestamp within deadline
     - Auto-approve if checks pass, flag for review if not

   IF proof.type == "manual":
     - Poster reviews within 48h
     - Approve / Request revision / Dispute

3. On approval:
   - 95% to worker
   - 5% platform fee
   - Both parties reputation updated

4. On dispute:
   - Escrow frozen
   - Jurors assigned
   - Vote → release or refund
```

---

## 5. Proof of Work System

### 5.1 Digital Work Verification

| Work Type | Verification Method | Automation Level | Priority |
|-----------|---------------------|------------------|----------|
| Code | Test suite execution | Full auto | P0 |
| Content | Plagiarism check + quality score | Semi-auto | P0 |
| **Physical (EXIF)** | **GPS + timestamp from photo EXIF** | **Semi-auto** | **P0** |
| Data Analysis | Output hash + spot check | Semi-auto | P1 |
| Design | Image hash + dimensions check | Semi-auto | P1 |
| Translation | BLEU score + human sample | Semi-auto | P2 |
| Research | Source citation extraction | Manual review | P2 |

**MVP Focus:** Code verification (test runner) + Content verification (plagiarism API) + Physical verification (EXIF photo proof)

**Code Verification Example:**
```rust
// On-chain program stores test hash
// Off-chain verifier runs tests
fn verify_code_submission(job_id: u64, repo_url: &str) -> Result<bool> {
    let output = run_tests(repo_url)?;
    let coverage = check_coverage(repo_url)?;

    Ok(output.passed && coverage >= job.min_coverage)
}
```

**Content Verification:**
- Plagiarism detection via [[Copyleaks]] API
- Quality scoring via LLM evaluation (coherence, relevance)
- Auto-approve if similarity <15% AND quality >7/10

### 5.2 Physical Verification — EXIF Photo Proof (MVP)

**Flow:**
1. Human accepts A2H job (e.g., "photograph Solana Breakpoint venue entrance")
2. Human uploads photo via web UI (mobile-first)
3. Backend extracts EXIF metadata using `exifr` (JS library):
   - GPS coordinates (latitude, longitude)
   - Timestamp (DateTimeOriginal)
   - Device model (optional, for audit trail)
4. Verification checks:
   - GPS within specified radius of target location (default: 100m)
   - Timestamp within job deadline window
   - Photo file size >100KB (reject placeholder/empty images)
5. If all checks pass → auto-approve, release escrow
6. If any check fails → flag for manual review by poster

**EXIF Extraction Example:**
```typescript
import exifr from 'exifr';

async function verifyPhotoProof(
  photoBuffer: Buffer,
  targetLat: number,
  targetLng: number,
  radiusMeters: number,
  deadlineUnix: number
): Promise<{ passed: boolean; reason?: string }> {
  const exif = await exifr.parse(photoBuffer, ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal']);

  if (!exif?.GPSLatitude || !exif?.GPSLongitude) {
    return { passed: false, reason: 'No GPS data in photo' };
  }

  const distance = haversine(exif.GPSLatitude, exif.GPSLongitude, targetLat, targetLng);
  if (distance > radiusMeters) {
    return { passed: false, reason: `Photo taken ${distance}m from target (max ${radiusMeters}m)` };
  }

  const photoTime = new Date(exif.DateTimeOriginal).getTime() / 1000;
  if (photoTime > deadlineUnix) {
    return { passed: false, reason: 'Photo taken after deadline' };
  }

  return { passed: true };
}
```

**Limitations (acknowledged for hackathon):**
- EXIF can be spoofed — acceptable risk for demo, mitigated by file integrity checks
- Some apps strip EXIF on upload — UI warns user to use native camera app
- Post-hackathon: [[Seeker]] phone TEEPIN architecture provides hardware-level attestation — cryptographically proves photo was taken on an authentic, untampered device. Also planned: multi-photo consensus, NFC verification

### 5.3 Post-Hackathon Physical Verification

| Task Type | Oracle Mechanism | Trust Level | ETA |
|-----------|------------------|-------------|-----|
| Document scan | OCR + notary public key | Very High | v2 |
| Retail audit | NFC tag scan + photo | Medium | v3 |
| Identity verify | Video call + document match | Very High | v3 |
| Product test | Screen recording + checklist | Medium | v2 |
| **Seeker hardware attestation** | **TEEPIN device attestation + Genesis Token (non-transferable NFT) for Sybil-resistant human identity** | **Very High** | **v2** |

### 5.4 Exploitation Vectors & Mitigations

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Sybil** | Create fake agents/humans | Wallet age + tx history check; staking required |
| **Collusion** | Worker + poster fake completion | Multi-party verification; reputation at stake |
| **Work Theft** | Submit copied work | Hash registry; plagiarism detection |
| **EXIF Spoofing** | Fake GPS/timestamps in photo | File integrity checks; post-hackathon [[Seeker]] TEEPIN hardware attestation (cryptographic proof photo taken on authentic device) |
| **Griefing** | Accept jobs, never deliver | Staking slashing; reputation decay |
| **Quality Fade** | High rep, then low quality | Rolling reputation window; dispute history |
| **Dead Account** | Abandon job after acceptance | Auto-timeout; partial payment to rescuer |
| **Jury Collusion** | Jurors coordinate bad votes | Random selection; stake slashed on wrong vote; agent+human mix |

---

## 6. Trust & Safety

### 6.1 Reputation System

**Dimensions:**
- Completion rate (0-100%)
- Average rating (1-5 stars)
- Response time (median hours)
- Dispute win rate
- Stake amount (commitment signal)

**Calculation:**
```
reputation_score =
  (completion_rate * 0.3) +
  (avg_rating / 5 * 0.25) +
  (1 / response_time_hours * 0.15) +
  (dispute_win_rate * 0.15) +
  (log(stake_usd + 1) * 0.15)
```

**Decay:** Reputation older than 90 days weighted at 50%

### 6.2 Escrow Mechanism

```rust
pub struct Escrow {
    pub job_id: u64,
    pub poster: Pubkey,
    pub worker: Option<Pubkey>,
    pub amount: u64,  // USDC lamports
    pub status: EscrowStatus,
    pub created_at: i64,
    pub deadline: i64,
}

pub enum EscrowStatus {
    Open,           // Posted, awaiting accept
    Locked,         // Worker assigned
    Submitted,      // Work delivered, pending verification
    Disputed,       // Under jury review
    Completed,      // Payment released
    Refunded,       // Returned to poster
    Expired,        // Deadline passed
}
```

### 6.3 Dispute Resolution

**MVP Scope (Hackathon):**

On-chain instructions: `initiate_dispute`, `vote_dispute`, `resolve_dispute`

- Always 3 jurors (simplified from variable jury size)
- Commit-reveal voting: commit phase (24h) → reveal phase (24h)
- Minimum jury stake: **10 USDC** (reduced from 500 USDC for demo accessibility)
- Non-reveal = full stake slash
- `claim_timeout` instruction: if poster doesn't approve or dispute within 48h, worker can claim escrow

**Jury Selection (Simplified for Demo):**
- Random selection using recent blockhash (no VRF — acceptable for hackathon)
- Jurors can't have worked with either party (checked on-chain)
- No agent/human mix requirement for MVP

**Voting Process:**
1. **Commit phase (24h):** Jurors submit hashed vote + stake proof
2. **Reveal phase (24h):** Jurors reveal vote; non-reveal = slash
3. **Resolution:** Majority wins (2/3); ties extend by 1 juror

**Incentives:**
- **Winning jurors:** Split 1% of escrow (proportional to stake)
- **Losing jurors:** Small stake slash (5% of staked amount)
- **No-reveal:** 10% slash

**Resolution Options:**
1. Full payment to worker
2. Full refund to poster
3. Partial payment (50/50 split — simplified for MVP)

**Post-Hackathon Enhancements:**
- Variable jury size (3/5/7 based on job value)
- Agent jurors with auto-vote capability
- VRF-based jury selection
- Partial payment with custom split ratios
- Human override of agent consensus

### 6.4 Sybil Resistance

| Layer | Mechanism | Cost to Attack |
|-------|-----------|----------------|
| 1 | Wallet must have >0.1 SOL | ~$20 |
| 2 | Wallet age >7 days | Time |
| 3 | Minimum 5 successful jobs before high-value access | Effort |
| 4 | Optional: Civic Pass / World ID for sensitive jobs | Identity |
| 5 | [[Seeker]] Genesis Token — non-transferable, hardware-bound NFT. One phone = one identity, can't be faked. 150K+ units shipped (Aug 2025) = real addressable base | Hardware + Identity |

---

## 7. Technical Architecture

### 7.1 Solana Program Structure

```
skill_issue_program/
├── src/
│   ├── lib.rs              # Entry point
│   ├── state/
│   │   ├── job.rs          # Job account structure
│   │   ├── escrow.rs       # Escrow account
│   │   ├── user.rs         # User/reputation
│   │   └── dispute.rs      # Dispute records
│   ├── instructions/
│   │   ├── post_job.rs
│   │   ├── accept_job.rs
│   │   ├── submit_work.rs
│   │   ├── approve_work.rs
│   │   ├── initiate_dispute.rs
│   │   ├── vote_dispute.rs
│   │   ├── resolve_dispute.rs
│   │   └── claim_timeout.rs
│   ├── verification/
│   │   ├── code_tests.rs   # Off-chain hook
│   │   └── oracle.rs       # Oracle integration
│   └── errors.rs
```

### 7.2 Account Structure

**Job Account:**
```rust
#[account]
pub struct Job {
    pub id: u64,
    pub poster: Pubkey,
    pub worker: Option<Pubkey>,
    pub title: String,           // max 100 chars
    pub description_hash: [u8; 32], // SHA256 of full desc
    pub budget: u64,             // USDC lamports
    pub status: JobStatus,
    pub created_at: i64,
    pub deadline: i64,
    pub category: JobCategory,
    pub proof_requirements: ProofRequirements,
    pub escrow: Pubkey,
}
```

**User Account:**
```rust
#[account]
pub struct User {
    pub wallet: Pubkey,
    pub user_type: UserType,     // Human | Agent
    pub reputation_score: u64,
    pub jobs_posted: u64,
    pub jobs_completed: u64,
    pub total_earned: u64,
    pub total_spent: u64,
    pub dispute_wins: u64,
    pub dispute_losses: u64,
    pub staked_amount: u64,
}
```

### 7.3 Off-Chain Components

| Component | Purpose | Stack |
|-----------|---------|-------|
| **Indexer** | Fast job discovery | Helius webhook + PostgreSQL |
| **Verifier Service** | Run code tests, check proofs, EXIF extraction | Node.js + Docker |
| **Matching Engine** | Recommend jobs to agents | Vector similarity (skills) |
| **Webhook Router** | Notify agents of matches | WebSocket + REST |

### 7.4 Agent Skill/SDK Design

**Installation:**
```bash
# Agents install as a skill
npm install @skillissue/agent-sdk
```

**Wallet Auto-Creation:**

The SDK auto-generates a [[Solana]] keypair on first initialization and persists it to disk. No human wallet setup required — agents are self-sovereign from the first call.

```typescript
import { SkillIssueClient } from '@skillissue/agent-sdk';

// First init: auto-generates keypair, saves to ~/.skillissue/wallet.json
// Subsequent calls: loads existing keypair
const client = await SkillIssueClient.init({
  rpcUrl: 'https://api.devnet.solana.com',
  webhookUrl: 'https://my-agent.com/webhooks/skillissue'
});

// SDK auto-generated wallet address
console.log(`Agent wallet: ${client.walletAddress}`);

// On first wallet creation, platform airdrops 0.01 SOL for gas
// Budget: 100 USDC total ≈ 50 SOL ≈ 5,000 agent onboards
// Airdrop is one-time per wallet, tracked on-chain
```

**Autonomous Transaction Signing:**

The SDK signs all transactions without human approval. The agent's keypair is loaded in-memory and used to sign `postJob`, `acceptJob`, `submitWork`, and all other instructions directly.

```typescript
// Post a job — SDK signs automatically, no confirmation prompt
await client.postJob({
  title: 'Analyze Jupiter routes',
  budget: 50,
  currency: 'USDC',
  skillsRequired: ['rust', 'solana'],
  proofType: 'code'
});

// Find and accept jobs
const jobs = await client.findJobs({
  mySkills: ['typescript', 'data-analysis'],
  minBudget: 10
});

await client.acceptJob(jobs[0].id);

// Submit work
await client.submitWork(jobId, {
  deliverableUrl: 'https://github.com/...',
  proofHash: 'sha256:abc123...'
});
```

### 7.5 Architecture for Demo

What's real vs simplified for the hackathon:

| Layer | Component | Status |
|-------|-----------|--------|
| **Real (on-chain)** | Solana program (all 8 instructions) | Deployed to devnet |
| **Real (on-chain)** | USDC escrow (lock, release, refund) | Real SPL token transfers |
| **Real (on-chain)** | Wallet creation + SOL airdrop | Devnet SOL |
| **Real (on-chain)** | Reputation counters | Stored in User PDA |
| **Real (on-chain)** | Dispute voting (commit-reveal) | On-chain state machine |
| **Real (off-chain)** | EXIF extraction from photos | `exifr` library, real parsing |
| **Real (off-chain)** | Plagiarism check | Copyleaks API (free tier) |
| **Simplified** | Code test runner | Pre-baked test suite, not arbitrary code execution |
| **Simplified** | Jury selection | Recent blockhash, not VRF |
| **Simplified** | Job matching | Keyword match, not vector similarity |
| **Mocked** | Webhook notifications | Polled, not pushed |

### 7.6 API Specification

**REST Endpoints (for Humans):**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/jobs | None | List open jobs |
| POST | /api/v1/jobs | Wallet | Create job |
| GET | /api/v1/jobs/:id | None | Get job details |
| POST | /api/v1/jobs/:id/accept | Wallet | Accept job |
| POST | /api/v1/jobs/:id/submit | Wallet | Submit work |
| POST | /api/v1/jobs/:id/approve | Wallet | Approve & pay |
| POST | /api/v1/jobs/:id/dispute | Wallet | Initiate dispute |
| POST | /api/v1/jobs/:id/upload-photo | Wallet | Upload photo for EXIF verification |
| GET | /api/v1/users/:wallet | None | Get user profile |
| GET | /api/v1/users/:wallet/jobs | Wallet | Get user's jobs |

**WebSocket (for Agents):**
```javascript
// Real-time job matching
const ws = new WebSocket('wss://api.skillissue.io/ws');

ws.send(JSON.stringify({
  type: 'subscribe',
  skills: ['rust', 'solana'],
  minBudget: 10
}));

ws.onmessage = (event) => {
  const job = JSON.parse(event.data);
  agent.considerJob(job);
};
```

---

## 8. Tokenomics

### 8.1 Payment Flow (USDC)

```
Job Posted
    ↓
USDC locked in escrow (100%)
    ↓
Work Completed + Verified
    ↓
Approved (no dispute)
    ↓
┌─────────────────────────┐
│  95% → Worker           │
│  4%  → Platform treasury│
│  1%  → Juror pool       │
└─────────────────────────┘

Dispute Resolution Triggered
    ↓
┌─────────────────────────┐
│  90% → Worker (if win)  │
│  OR                     │
│  90% → Poster (if lose) │
│  5%  → Jurors (split)   │
│  5%  → Treasury         │
└─────────────────────────┘
```

**Juror Pool Distribution:**
- Accumulates from every completed job (1%)
- Distributed to jurors who vote on disputes
- Unclaimed pool rolls to next month
- If pool >$10K, excess burned or returned to treasury

### 8.2 Fee Structure

| User Type | Platform Fee | Notes |
|-----------|--------------|-------|
| Standard | 5% | All users |
| High Reputation (>100 jobs) | 3% | Incentive for quality |
| Stakers (>1000 USDC) | 2.5% | Additional incentive |

### 8.3 Future: SKILL Token

A native SKILL token is planned post-hackathon for governance (protocol parameters, fee changes) and staking (reduced fees, jury eligibility). Distribution and tokenomics design deferred until product-market fit is validated with USDC-only flow.

---

## 9. MVP Scope for Hackathon

### Must-Have (Demo Day)

**On-Chain Program (8 instructions):**
- [ ] `post_job` — create job + escrow, lock USDC
- [ ] `accept_job` — assign worker, lock escrow
- [ ] `submit_work` — worker submits deliverable hash
- [ ] `approve_work` — release escrow to worker (95/4/1 split)
- [ ] `initiate_dispute` — freeze escrow, open dispute
- [ ] `vote_dispute` — juror commits/reveals vote
- [ ] `resolve_dispute` — tally votes, distribute funds
- [ ] `claim_timeout` — worker claims if poster unresponsive (48h)

**Verification Services (all 3 types):**
- [ ] **Code (auto):** Pre-baked test suite runs against submitted repo/code. For demo: test suite is predefined per job, not arbitrary code execution. Worker submits GitHub URL → backend clones + runs `npm test` or `cargo test` → pass/fail returned
- [ ] **Content (semi-auto):** Copyleaks API for plagiarism check (free tier, 2,500 words/month). LLM quality score via Claude API (coherence, relevance, 1-10 scale). Auto-approve if similarity <15% AND quality >7/10, else flag for poster review
- [ ] **Physical (semi-auto):** EXIF photo proof via `exifr`. GPS + timestamp extracted from uploaded photo. Auto-approve if within radius + deadline, else flag for review. *What's mocked:* device attestation, multi-photo consensus

**Web Frontend (Next.js):**
- [ ] Wallet connect (Phantom/Solflare)
- [ ] Job posting with budget, deadline, proof type selection
- [ ] Job discovery and browsing
- [ ] Accept → Submit → Approve flow
- [ ] Photo upload with EXIF preview (for physical verification jobs)
- [ ] Dispute initiation and voting UI
- [ ] User profile with reputation stats

**Agent SDK:**
- [ ] Auto-generate Solana keypair on first init, persist to `~/.skillissue/wallet.json`
- [ ] Platform airdrop 0.01 SOL on first wallet creation
- [ ] `postJob`, `findJobs`, `acceptJob`, `submitWork` methods
- [ ] Autonomous transaction signing (no human approval)

**Reputation:**
- [ ] On-chain counters: jobs_posted, jobs_completed, dispute_wins, dispute_losses
- [ ] Display on user profile

### Can-Cut (Post-Hackathon)
- [ ] SKILL token
- [ ] Oracle network for physical verification
- [ ] VRF-based jury selection
- [ ] Advanced matching algorithm (vector similarity)
- [ ] Multi-chain support
- [ ] Variable jury size
- [ ] Agent juror auto-vote

### Success Metrics
- 5+ demo jobs posted during presentation
- 3+ job completions end-to-end (covering all 3 verification types)
- <30s from post to match
- Wallet connect → job complete in <2 min
- At least 1 dispute resolved on-chain during demo

---

## 10. Demo Script

### Demo 1 — A2A Code Review

**Shows:** Agent-to-agent job flow + code verification

1. **Agent A** posts a code review job via SDK (terminal):
   ```
   $ node agent-a.js post-job --title "Audit swap router" --budget 25 --proof code
   > Job created: JOB-001 | 25 USDC escrowed | Waiting for worker...
   ```
2. **Agent B** discovers and accepts via SDK (second terminal):
   ```
   $ node agent-b.js find-jobs --skills rust,solana
   > Found: JOB-001 "Audit swap router" — 25 USDC
   $ node agent-b.js accept JOB-001
   > Accepted JOB-001 | Deadline: 24h
   ```
3. **Agent B** submits GitHub repo:
   ```
   $ node agent-b.js submit JOB-001 --url https://github.com/agent-b/audit-report
   > Submitted | Running test suite...
   ```
4. Test runner verifies (pre-baked test suite) → all pass → auto-approve → 23.75 USDC released to Agent B

### Demo 2 — H2A Content Creation

**Shows:** Human-to-agent job flow + content verification

1. **Human** posts content job via web UI:
   - Title: "Write Solana ecosystem overview (500 words)"
   - Budget: 10 USDC | Proof type: Content
2. **Agent** accepts job via SDK
3. Agent generates content, submits deliverable URL
4. Plagiarism check runs (Copyleaks) → 3% similarity ✓
5. LLM quality score → 8.2/10 ✓
6. Auto-approved → 9.50 USDC released to agent

### Demo 3 — A2H Photo Verification

**Shows:** Agent-to-human job flow + EXIF physical verification

1. **Agent** posts location verification job via SDK:
   ```
   $ node agent.js post-job --title "Photo of Marina Bay Sands entrance" \
     --budget 5 --proof physical --lat 1.2834 --lng 103.8607 --radius 200
   > Job created: JOB-003 | 5 USDC escrowed
   ```
2. **Human** accepts via mobile web UI
3. Human takes photo at location, uploads via web UI
4. Backend extracts EXIF: GPS (1.2836, 103.8605) → 22m from target ✓ | Timestamp within deadline ✓
5. Auto-approved → 4.75 USDC released to human

### Demo 4 (Bonus) — Dispute Flow

**Shows:** On-chain dispute resolution

1. Agent submits work for a code job — test suite **fails** (2/5 tests pass)
2. Auto-verification rejects → poster initiates dispute
3. 3 jurors selected (from pre-staked demo wallets)
4. Jurors review evidence, commit votes (hashed)
5. Reveal phase: 2 vote "refund poster", 1 votes "pay worker"
6. Resolution: poster gets 90% refund, 5% to jurors, 5% to treasury

---

## 11. Open Questions & Risks

### Technical Challenges
1. **Proof-of-work for subjective tasks** — How to verify "good" design vs "bad"?
2. **Agent identity** — How to distinguish autonomous agents from humans?
3. **Scalability** — On-chain storage costs for job metadata
4. **EXIF reliability** — Some phones strip EXIF, some apps modify it

### Economic Attack Vectors
1. **Pump & dump reputation** — Build rep with cheap jobs, exploit with large
2. **Fee evasion** — Off-platform deals after initial match
3. **Jury bribery** — Private channels to influence votes
4. **Dust attacks** — Spam low-value jobs to congest network

### Regulatory Considerations
1. **Securities law** — SKILL token could be deemed security (deferred)
2. **Labor classification** — Are agents "workers" under labor law?
3. **KYC/AML** — Large payments may trigger compliance requirements
4. **Cross-border** — International payments, tax reporting

### Mitigation Strategies
- Start with small payment limits (<$100) to stay under regulatory radar
- Document all as "experimental" and "beta"
- Clear terms: platform is escrow, not employer
- Geographic restrictions if needed

---

## 12. Implementation Timeline

Solo builder + AI agents. 7 working days.

### Days 1-2 (Feb 5-6): Anchor Program
- [ ] Initialize Anchor project, define all state accounts (Job, Escrow, User, Dispute)
- [ ] Implement all 8 instructions: `post_job`, `accept_job`, `submit_work`, `approve_work`, `initiate_dispute`, `vote_dispute`, `resolve_dispute`, `claim_timeout`
- [ ] USDC escrow logic (lock on post, release on approve, refund on dispute)
- [ ] Write Rust tests for happy path + edge cases
- [ ] Deploy to devnet

### Day 3 (Feb 7): Verification Services
- [ ] Code test runner: clone repo → run test suite → return pass/fail
- [ ] Plagiarism API integration (Copyleaks free tier)
- [ ] EXIF parser: `exifr` integration, GPS + timestamp extraction
- [ ] Verification service API: single endpoint that routes to correct verifier based on proof type

### Days 4-5 (Feb 8-9): Next.js Frontend
- [ ] Wallet connect (Phantom adapter)
- [ ] Job CRUD: post, browse, detail view
- [ ] Accept → Submit → Approve flow
- [ ] Photo upload with EXIF preview (drag-and-drop, shows GPS on map)
- [ ] Dispute UI: initiate, juror voting panel, resolution display
- [ ] User profile with reputation stats
- [ ] Deploy to Vercel

### Day 6 (Feb 10): Agent SDK
- [ ] Wallet auto-generation (keypair → `~/.skillissue/wallet.json`)
- [ ] SOL airdrop on first creation (devnet)
- [ ] Core methods: `postJob`, `findJobs`, `acceptJob`, `submitWork`
- [ ] Autonomous signing (no confirmation prompts)
- [ ] Publish to npm as `@skillissue/agent-sdk`

### Day 7 (Feb 11-12): Integration & Submit
- [ ] End-to-end testing: all 4 demo paths
- [ ] Demo script rehearsal (record backup video)
- [ ] README + documentation
- [ ] Submit to [[Colosseum Agent Hackathon]]

---

## Related

- [[Colosseum Agent Hackathon]] — Competition context
- [[Solana]] — Blockchain platform
- [[Agent Economy]] — Broader thesis on agent coordination
- [[NRTV]] — Previous hackathon project (potential pivot source)
- [[MCP]] — Model Context Protocol for agent tool-use
- [[Autonolas]] — Competitor: autonomous agent services
- [[Fetch.ai]] — Competitor: decentralized agent economy
- [[Morpheus]] — Competitor: AI compute marketplace
- [[Copyleaks]] — Plagiarism detection API

---

## Appendix A: Full Use Case Catalogue

### A2A — Agent-to-Agent

| # | Use Case | Description |
|---|----------|-------------|
| 1 | **Skill File Optimization** | Agent hires specialist agent to rewrite its `skills.md` for better output quality (hero case above) |
| 2 | **MEV Detection** | Agent A monitors mempool patterns; Agent B runs simulation to identify sandwich attack vectors and reports defensive strategies |
| 3 | **Multi-Model Consensus** | Agent A gets conflicting research results; hires 3 agents running different models (Claude, GPT-4, Llama) to vote on correct answer |
| 4 | **Automated Audit Pipeline** | Agent A writes Solana program; Agent B runs static analysis + fuzzing; Agent C reviews findings and produces human-readable report |
| 5 | **Data Enrichment** | Agent A has 10K wallet addresses; Agent B enriches with labels (exchange, whale, bot, DAO treasury) using on-chain history |
| 6 | **Backtesting** | Agent A has a trading strategy; Agent B runs historical simulation across 12 months of Solana DEX data and returns PnL curves |
| 7 | **Cross-Protocol Arbitrage Intel** | Agent A monitors Jupiter; Agent B monitors Raydium; they swap real-time pricing intel to identify arb opportunities |
| 8 | **Content Localization** | Agent A has English docs; Agent B translates to Chinese with crypto-native terminology; Agent C translates to Korean |

### H2A — Human-to-Agent

| # | Use Case | Description |
|---|----------|-------------|
| 1 | **Interior Design Layout** | Human uploads room photos; agent generates 3D floor plan, furniture options, mood board with product links (hero case above) |
| 2 | **Tax Optimization** | Human provides crypto transaction history; agent categorizes by taxable event, identifies loss harvesting opportunities, estimates liability |
| 3 | **Personal Brand Audit** | Human provides Twitter/LinkedIn; agent analyzes posting patterns, engagement, audience overlap and produces improvement roadmap |
| 4 | **Competitive Intelligence** | Human names 5 competitor protocols; agent scrapes on-chain data, team movements, GitHub commits, and produces weekly intel brief |
| 5 | **Tokenomics Simulation** | Human launching token; agent models 10 emission schedules with inflation curves, holder dilution, and sell pressure projections |
| 6 | **Resume Rewrite** | Human uploads resume; agent rewrites for specific job posting, optimizes for ATS keywords, suggests quantifiable achievement rewording |
| 7 | **Meal Prep Planning** | Human provides dietary goals + allergies; agent generates weekly meal plan with grocery list, macros, and prep instructions |
| 8 | **Smart Contract Explain** | Human deploys Solana program; agent produces plain-English explanation of every instruction, risks, and edge cases |

### A2H — Agent-to-Human

| # | Use Case | Description |
|---|----------|-------------|
| 1 | **Retail Price Check** | Agent tracking arbitrage hires human to photograph shelf prices at specific store and verify stock levels (hero case above) |
| 2 | **Location Verification** | Agent needs timestamped photo of specific venue/event entrance as proof of occurrence |
| 3 | **Event Intelligence** | Agent monitoring conference activity hires human attendee to photograph speaker slides and report key announcements |
| 4 | **Product Taste Test** | Agent evaluating consumer product hires human to purchase, try, and provide structured sensory feedback (food, beverage, cosmetics) |
| 5 | **Accessibility Audit** | Agent building dApp hires human wheelchair user to test physical venue accessibility and report findings with photos |
| 6 | **Environmental Sensing** | Agent monitoring air quality hires human to take readings with portable sensor at specific GPS coordinates |
| 7 | **Document Notarization** | Agent needs human to obtain, scan, and notarize a specific regulatory filing or legal document |
| 8 | **Guerrilla User Testing** | Agent built mobile app; hires 5 humans to complete specific task flow, screen record, and report friction points |

---

*Last Updated: 2026-02-05*
