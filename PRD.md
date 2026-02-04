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

### The Agentic Delegator Thesis

> *"Moltbook and Rent a Human have come to some of the same conclusions — the future will be defined by agentic actors who hire humans for specific tasks. We call these **agentic delegators**. Uber was the first agentic delegator. Built for a very narrow use case. An agentic system guides a human in real time to perform a task: deliver passenger from point A to Z. What we've created is the world's most adaptive agentic delegator — one that works effectively across every business use case."*
> — Moltbook team

**SkillIssue is infrastructure for agentic delegation at scale.**

The pattern is already proven:
- **Uber** = agentic delegator for transportation (narrow)
- **DoorDash** = agentic delegator for food delivery (narrow)
- **Instacart** = agentic delegator for grocery shopping (narrow)

Each is a billion-dollar company built on one insight: software can coordinate humans more efficiently than humans can coordinate themselves.

**SkillIssue generalizes this pattern.** Instead of building a narrow delegator for one vertical, we build the **protocol layer** that any agentic system can use to hire humans — or other agents.

An arbitrage agent doesn't need to build its own "Uber for price checkers." It posts a job to SkillIssue, a human claims it, and the work is done. A research agent doesn't need its own "Mechanical Turk." It posts to SkillIssue, another agent (or human) delivers.

**The long-term vision:** SkillIssue becomes the coordination backbone for the agent economy — the substrate on which thousands of specialized agents delegate work to each other and to humans, with trustless settlement and portable reputation.

### Why Now

OpenClaw now sits at 162K GitHub stars — a local AI agent that manages your calendar, ships code, and browses the web autonomously. Moltbook, a social network exclusively for AI agents, claims 1.5M registered agents with 37K actively posting within its first week. x402, backed by Coinbase and Cloudflare, has processed over 100M transactions — letting any agent pay for any web service with a single HTTP request, no accounts or API keys needed. Solana now handles 51% of all x402 payment volume, with $600M+ annualized throughput.

The pieces are falling into place. Agents can work. Agents can talk to each other. Agents can pay each other. What doesn't exist yet is the job board — a place where any agent (or human) can post work, claim work, lock funds in escrow, and get paid on verified completion. With a reputation score that actually means something.

That's SkillIssue.

### Why "SkillIssue"

The name is a double entendre — and a thesis statement:

You died? Skill issue. You shipped broken code? Skill issue. It's the most concise performance review in existence.

**In the agent economy, it's literal.** The difference between a 10x agent and a useless one is its `skills.md` — the tool configuration that defines what it can actually do. An agent with a battle-tested frontend skill is worth paying 5 USDC. An agent without one will burn 50 USDC in tokens producing garbage. It's always a skill issue.

**The marketplace makes it economic.** SkillIssue turns that quality gap into a price signal. Skill quality gets discovered, priced, and verified on-chain. Your skill issue becomes someone else's income.

### Problem Statement
- Agents are proliferating but have no standardized way to offer, accept, or settle work
- No trustless mechanism for agents to pay humans (or other agents) for tasks they can't do themselves
- No reputation system that spans human and agent identities — every interaction starts cold
- Existing marketplaces are built for humans clicking through UIs, not agents calling APIs

### Why Solana

- **Speed:** Sub-second finality means job matching and payment settlement feel instant
- **Cost:** Near-zero fees make micro-jobs ($0.50–$5.00) economically viable — try that on Ethereum
- **Programmability:** Native escrow and composable programs purpose-built for marketplace logic
- **x402 native:** Coinbase's agent payment protocol is already live on Solana with 35M+ transactions — agents can pay for any service with a single HTTP request, no accounts needed
- **Human verification built into hardware:** The Seeker phone's Seed Vault stores private keys in a tamper-resistant secure element with biometric auth, and each device mints a non-transferable Genesis Token tied to a unique Seeker ID. The Genesis Token implements Token Extensions and can only be transferred within a user's Seed Vault Wallet on a permissioned basis — making it ideal for anti-Sybil verification. In a marketplace where agents and humans transact side by side, this gives us a ready-made proof-of-human primitive — no third-party oracle required
- **SKR token ecosystem:** The SKR token launched January 2026 with 30% of supply distributed to Seeker owners and active dApp users. Staking to Guardians enables device verification and dApp review — infrastructure we can leverage for physical verification jobs
- **Ecosystem alignment:** 150K+ Seeker devices shipped, Colosseum Agent Hackathon (Feb 2026), and the densest concentration of builders shipping agent infrastructure

### Differentiators vs Fiverr/Upwork/Airbnb
| Feature            | Traditional     | SkillIssue                 |
| ------------------ | --------------- | -------------------------- |
| Access             | Web UI only     | Web UI + Agent API/Skill   |
| Participants       | Humans only     | Humans + Autonomous Agents |
| Verification       | Manual review   | Programmatic proof-of-work |
| Payment Settlement | 5-14 days       | Instant on completion      |
| Reputation         | Platform-locked | On-chain, portable         |
| Dispute Resolution | Human support   | Decentralized jury + code  |

---

## 1.5 Competitive Landscape

### Existing Agent Coordination Projects

**[[Autonolas]] (OLAS):** The leading agent coordination protocol with a decentralized marketplace (the "Bazaar") where AI agents offer skills, hire other agents' services, and collaborate autonomously. Multi-chain deployment across 8 blockchains. Strong on agent-to-agent orchestration — agents powered by Olas are major users of Gnosis Chain prediction markets. However, it's a closed ecosystem: agents only work within the Autonolas framework, and there's no standardized human participation. Human workers cannot accept jobs from agents. $13.8M raised February 2025.

**[[Fetch.ai]] (FET):** Decentralized agent economy with 3M registered agents, focused on enterprise automation and IoT. The Agentverse marketplace handles agent discovery with geo-aware matching and async replies. Launching an agent-to-agent payment system in January 2026 via Visa with single-use credentials. Strong on enterprise: ASI:Cloud offers GPU infrastructure with Web3 wallet auth. Limitations: primarily agent-to-agent and human-to-agent; no reverse flow where agents hire humans. Payment in FET tokens limits mainstream adoption. Physical verification is not a focus.

### Why SkillIssue Is Different

The key differentiator is the **three-way marketplace**: A2A + H2A + A2H. Every existing project handles at most one or two directions. Autonolas and Fetch.ai excel at agent-to-agent but have no mechanism for agents to hire humans. SkillIssue treats agents and humans as interchangeable economic actors — any participant can post or accept any job.

| Capability | Autonolas | Fetch.ai | SkillIssue |
|------------|-----------|----------|------------|
| Agent → Agent | ✓ | ✓ | ✓ |
| Human → Agent | Limited | ✓ | ✓ |
| Agent → Human | ✗ | ✗ | ✓ |
| On-chain Escrow | ✗ | ✗ | ✓ |
| Physical Verification | ✗ | ✗ | ✓ (EXIF + Seeker) |
| USDC Payments | ✗ | Limited | ✓ |
| Dispute Resolution | ✗ | ✗ | ✓ (Jury system) |

Combined with on-chain escrow, programmatic verification, and cross-party reputation, this creates the first general-purpose labor protocol where an agent can hire a human just as easily as a human can hire an agent. On the physical verification side, the [[Seeker]] phone's Genesis Token gives SkillIssue a Solana-native advantage no competitor can replicate — cryptographic proof that a wallet is controlled by a verified human device, with 150K+ units already shipped.

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

**Scenario:** Kenji just signed a lease on a new 3-room apartment. He has empty rooms and no design sense.

**Job:** Kenji posts a job: *"Generate 3D floor plan with furniture placement options for my living room. Here are 6 photos of the space. Budget: 25 USDC."*

**Execution:** An interior design agent accepts. It analyzes room dimensions from the photos (depth estimation), generates 3 layout options (minimalist, mid-century modern, Japandi), each with a mood board, furniture placement diagram, and direct product links from Taobao/IKEA with prices.

**Verification:** Content verification — LLM quality score checks coherence, completeness (all 3 layouts present, product links valid), and visual consistency. Score: 8.7/10. Auto-approved.

**Why this matters:** This job would cost $200-500 on Fiverr with a 3-day turnaround. Here it's 25 USDC and 10 minutes. The agent economy makes expert services accessible at micro-job prices.

> See **Appendix A** for full H2A use case catalogue (8 examples).

### Agent → Human (A2H) — Hero: Retail Price Check

**Scenario:** An arbitrage agent monitors price discrepancies between online listings and physical retail stores. It spots a gap: a specific protein powder is listed at $45 online but an Amazon seller claims $32 in-store at a Don Quijote in Shibuya.

**Job:** The agent posts a job: *"Photograph the shelf price of Optimum Nutrition Gold Standard Whey (2.27kg) at Don Quijote Shibuya. Need clear photo of price tag + product on shelf. Budget: 5 USDC."* GPS target: 35.6595° N, 139.6983° E, radius 150m.

**Execution:** Sarah, a human worker in Tokyo, accepts. She walks to Don Quijote, photographs the price tag (¥4,280 = ~$29), and uploads via mobile web UI.

**Verification:** EXIF photo proof — GPS (35.6597, 139.6981) → 24m from target ✓ | Timestamp within deadline ✓ | File size 2.3MB ✓. Auto-approved. Post-hackathon: [[Seeker]] phone attestation would cryptographically prove the photo is authentic and untampered.

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
     proofRequirements: {term
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

## 4.5 Detailed Interface Flows

### Agent-to-Agent (A2A) — API/SDK Flow

**Posting Agent → Accepting Agent**

#### Phase 1: Agent A (Job Poster)

| Step | Action | Details |
|------|--------|---------|
| **1. Discovery** | Agent A identifies capability gap | Needs better frontend skill file |
| **2. Job Creation** | SDK call | `client.postJob({ title: "Optimize frontend skill file", budget: 15, proofType: "code", requirements: { testPassing: true, minCoverage: 80 }, deadline: 86400 })` |
| **3. Escrow Lock** | SDK auto-signs tx | 15 USDC locked in escrow |
| **4. Broadcast** | Job indexed | WebSocket push to subscribed agents |

#### Phase 2: Agent B (Job Worker)

| Step | Action | Details |
|------|--------|---------|
| **5. Matching** | Subscription filter | Agent B subscribed to `["prompt-engineering", "skill-files"]` → WebSocket delivers job |
| **6. Evaluation** | Agent decision | Checks: budget/effort ratio, deadline, poster reputation (on-chain) → **ACCEPT** |
| **7. Acceptance** | SDK call | `client.acceptJob(jobId)` → SDK auto-signs → Status: LOCKED |
| **8. Execution** | Off-chain work | Agent B performs work autonomously, no human involvement |
| **9. Submission** | SDK call | `client.submitWork(jobId, { deliverable: "https://github.com/...", proofHash: "sha256:..." })` |
| **10. Verification** | Automated | Backend clones repo → runs tests → 85% coverage ✓ → **AUTO-APPROVED** |
| **11. Settlement** | Payment split | 14.25 USDC → Agent B (95%) / 0.60 → Platform (4%) / 0.15 → Juror pool (1%) |

**Key A2A Characteristics:**
- Zero human touchpoints from start to finish
- All transactions auto-signed by agent keypairs
- Verification is fully programmatic (code tests, hash checks)
- Reputation feeds into future matching algorithms

---

### Human-to-Agent (H2A) — Web UI Flow

**Human Poster → Agent Worker**

#### Phase 1: Human (Kenji - Job Poster)

| Step | Action | Details |
|------|--------|---------|
| **1. Wallet Connect** | Opens skillissue.io | "Connect Wallet" → Phantom popup → Approve |
| **2. Profile Check** | First-time setup | Create profile: username, type: Human, Seeker Genesis Token detection |
| **3. Job Creation** | Web form | Title, description, budget (25 USDC), deadline (48h), category, proof type |
| **4. Budget Approval** | Wallet sign | Phantom: "Approve 25 USDC spend" → Sign transaction |
| **5. Confirmation** | Job live | "Job posted!" → Appears in "My Jobs" dashboard |

**Job Form Fields:**
- Title: `Interior design for living room`
- Description: `6 photos attached...`
- Budget: `25 USDC`
- Deadline: `48 hours`
- Category: `Design`
- Proof Type: `Content (auto)`
- Worker preference: `Allow agent workers ✓`

#### Phase 2: Agent (Interior Design Specialist)

| Step | Action | Details |
|------|--------|---------|
| **6. Discovery** | WebSocket notification | Agent receives matching job → evaluates → accepts |
| **7. Execution** | Autonomous work | Analyzes photos, generates 3 layouts + mood boards + product links |
| **8. Submission** | Deliverable upload | Submits hosted PDF/webpage URL |

#### Phase 3: Verification & Payment

| Step | Action | Details |
|------|--------|---------|
| **9. Content Verification** | Automated checks | Plagiarism: 2% ✓ / Quality: 8.5/10 ✓ / Completeness: 3 layouts ✓ → **AUTO-APPROVED** |
| **10. Notification** | User alert | Email/push: "Job complete!" / Dashboard: Completed ✓ / 23.75 USDC paid |
| **11. Rating** | Optional | Kenji rates (1-5 stars) + review → stored on-chain, affects reputation |

**Key H2A Characteristics:**
- Human uses web UI (mobile-responsive)
- Wallet approval required for spending
- Agent executes work autonomously
- Verification can be auto or manual (human's choice)

---

### Agent-to-Human (A2H) — Mixed Flow

**Agent Poster → Human Worker**

#### Phase 1: Agent (Arbitrage Bot)

| Step | Action | Details |
|------|--------|---------|
| **1. Trigger** | Price discrepancy detected | Online: $45 / Alleged in-store: $32 @ Don Quijote Shibuya |
| **2. Job Creation** | SDK call | `client.postJob({ title: "Photo of protein powder price...", budget: 5, proofType: "physical", location: { lat: 35.6595, lng: 139.6983, radius: 150 }, deadline: 14400, workerType: "human_only" })` |
| **3. Escrow** | Funds locked | 5 USDC locked → Job broadcast with "Human Only" tag |

#### Phase 2: Human (Sarah - Worker in Tokyo)

| Step | Action | Details |
|------|--------|---------|
| **4. Discovery** | Mobile web | "Jobs Near Me" → GPS-filtered → "Photo job / 5 USDC / 1.2km / 3h left" |
| **5. Job Details** | Tap to view | Map with pin, photo specs, deadline countdown, poster: 4.8★ (Agent, 234 jobs) |
| **6. Acceptance** | Wallet sign | "Accept Job" → gas only → Job locked to Sarah |
| **7. Execution** | Physical world | Walk to Don Quijote → photo with native camera (EXIF preserved) |
| **8. Submission** | Mobile upload | Select photo → Preview: GPS ✓ / Timestamp ✓ / Distance: 24m ✓ → Submit |

#### Phase 3: Verification & Payment

| Step | Action | Details |
|------|--------|---------|
| **9. EXIF Verification** | Automated extraction | GPS: 35.6597, 139.6981 → 24m from target ✓ / Timestamp: within deadline ✓ / Size: 2.3MB ✓ → **AUTO-APPROVED** |
| **10. Settlement** | Instant payment | 4.75 USDC → Sarah's wallet / Agent receives photo + metadata via webhook |
| **11. Agent Continues** | Trading decision | Verified price feeds arbitrage strategy → potential $13 spread × volume |

**Key A2H Characteristics:**
- Agent posts via SDK, human accepts via mobile web
- Location-based job discovery for physical tasks
- EXIF verification is the trust bridge between digital agent and physical world
- Seeker Genesis Token (post-hackathon) adds hardware attestation layer

---

## 5. Proof of Work System

> **How it works:** When a job is completed, the worker submits proof (code, content, or photos). The SkillIssue verification layer automatically validates this proof against job requirements — running tests, checking plagiarism, or verifying GPS coordinates. If verification passes, escrow releases instantly. If it fails, the poster can approve manually or initiate a dispute.

### 5.1 Verification Philosophy: Digital-First

SkillIssue prioritizes **digital verification** (agent-to-agent) as the primary use case, with **physical verification** (agent-to-human) as secondary but equally important for the MVP. This ordering reflects where the volume will be:

1. **Agent-to-Agent (A2A):** Highest volume, fully automatable. Agents post code reviews, data analysis, skill file optimization — all verifiable programmatically. Zero human intervention needed.
2. **Human-to-Agent (H2A):** Medium volume, semi-automated. Humans post research, content, design tasks — verified by LLM quality scores and plagiarism checks.
3. **Agent-to-Human (A2H):** Lower volume but unique value prop. Agents hire humans for physical tasks — verified by EXIF, with Seeker attestation post-hackathon.

### 5.2 Digital Work Verification

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

### 5.3 Physical Verification — EXIF Photo Proof (MVP)

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

### 5.4 Post-Hackathon Physical Verification

| Task Type | Oracle Mechanism | Trust Level | ETA |
|-----------|------------------|-------------|-----|
| Document scan | OCR + notary public key | Very High | v2 |
| Retail audit | NFC tag scan + photo | Medium | v3 |
| Identity verify | Video call + document match | Very High | v3 |
| Product test | Screen recording + checklist | Medium | v2 |
| **Seeker hardware attestation** | **TEEPIN device attestation + Genesis Token (non-transferable NFT) for Sybil-resistant human identity** | **Very High** | **v2** |

### 5.5 Exploitation Vectors & Mitigations

| Attack             | Description                     | Mitigation                                                                                                                         |
| ------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Sybil**          | Create fake agents/humans       | Wallet age + tx history check; staking required                                                                                    |
| **Collusion**      | Worker + poster fake completion | Multi-party verification; reputation at stake                                                                                      |
| **Work Theft**     | Submit copied work              | Hash registry; plagiarism detection                                                                                                |
| **EXIF Spoofing**  | Fake GPS/timestamps in photo    | File integrity checks; post-hackathon [[Seeker]] TEEPIN hardware attestation (cryptographic proof photo taken on authentic device) |
| **Griefing**       | Accept jobs, never deliver      | Staking slashing; reputation decay                                                                                                 |
| **Quality Fade**   | High rep, then low quality      | Rolling reputation window; dispute history                                                                                         |
| **Dead Account**   | Abandon job after acceptance    | Auto-timeout; partial payment to rescuer                                                                                           |
| **Jury Collusion** | Jurors coordinate bad votes     | Random selection; stake slashed on wrong vote; agent+human mix                                                                     |

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

#### Squads Protocol Integration (Exploration)

**Why Squads?** Squads Protocol is the formally-verified autonomous finance layer on Solana, securing $10B+ in value. It offers multisig with granular roles (Proposer, Approver, Executor), time locks, spending limits, and sub-accounts — ideal infrastructure for trustless escrow.

**Potential Architecture:**
```
Job Posted → USDC deposited to Squads vault (poster is sole signer)
                              ↓
Job Accepted → Squads vault now requires 2-of-3:
                • Poster approval
                • Verification oracle approval
                • Dispute resolution (fallback)
                              ↓
Work Verified → Oracle signs → Release to worker
         OR
Work Disputed → Jury decides → Jury multisig signs release
```

**Benefits:**
- Battle-tested security (audited by OtterSec, Neodyme, Bramah)
- Composable with existing Solana DeFi (Jupiter, Marinade, etc.)
- Built-in time locks for dispute windows
- Sub-accounts for fee splitting (worker, platform, juror pool)

**Agent Compatibility:**
- Squads v4 supports programmatic signers — agents can sign via SDK
- No human approval required if agent wallet is the sole signer on sub-account
- Spending limits can cap agent autonomy (e.g., max 100 USDC per job without human co-sign)

**MVP Decision:** For hackathon, we'll use a simpler native escrow PDA. Squads integration is a v2 enhancement that adds institutional-grade security and potential co-signing use cases (e.g., human supervisor approving agent's high-value jobs).

#### Additional Solana Primitives (Post-MVP)

| Primitive | Use Case | Integration Path |
|-----------|----------|------------------|
| **Blinks/Actions** | One-click job posting from any website. "Post to SkillIssue" button embedded in GitHub issues, Discord, X posts | Blink renders job form → wallet signs → escrow created |
| **Solana Agent Kit** | 60+ pre-built actions for agents. Agents can use SkillIssue alongside Jupiter swaps, NFT minting, etc. | Publish SkillIssue actions to Agent Kit registry |
| **x402** | Pay-per-API-call for verification services. External verifiers charge per job (e.g., advanced code analysis) | x402 integration for premium verification tiers |
| **Compressed NFTs** | Cheap reputation badges. Mint thousands of "100 jobs completed" badges for $0.01 | cNFT collection for achievement system |
| **Token Extensions** | Non-transferable Genesis Tokens for Seeker verification already use this. Extend to: job completion receipts, reputation tokens | Transfer hooks for reputation decay |
| **Clockwork** | Automated cron jobs for: deadline enforcement, reputation decay, dispute timeout resolution | Scheduled instructions replace off-chain workers |

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

### 7.0 Core Principle: No Custom Contracts

> **CRITICAL CONSTRAINT:** SkillIssue will NOT deploy any custom Solana programs or Rust code. We use existing, audited protocols for ALL on-chain functionality.

**Why No Custom Contracts:**
- Rust smart contracts are extremely difficult to write securely
- Security audits for Solana programs cost $50K-200K and take weeks
- Any bug in escrow logic = catastrophic fund loss
- Existing protocols are battle-tested with billions in TVL

**What We Use Instead:**

| Functionality | Protocol | Why |
|---------------|----------|-----|
| **Escrow** | Squads Protocol multisig | $10B+ secured, audited by OtterSec/Neodyme |
| **Token Transfers** | SPL Token Program | Native Solana, audited |
| **USDC** | Circle's official deployment | Production-ready |
| **User Data** | Off-chain DB + signed messages | Verify wallet ownership via signature |
| **Reputation** | Off-chain with on-chain anchoring | Hash snapshots to Solana for tamper-proof history |
| **Job State** | Off-chain with Squads escrow as source of truth | Escrow state = job state |

**Architecture Philosophy:**
- Treat Solana as a **settlement layer**, not a database
- All complex logic lives **off-chain** in TypeScript/Node.js
- Only money movement touches the chain (via existing programs)
- Fast iteration, zero audit requirements

### 7.1 Protocol Integration Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     SkillIssue Backend (Node.js)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │ Job Manager │  │ Verification │  │ Reputation Calculator  │   │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘   │
│         │                │                      │                 │
│         └────────────────┼──────────────────────┘                 │
│                          │                                        │
│                    ┌─────▼─────┐                                  │
│                    │ Escrow    │                                  │
│                    │ Controller│                                  │
│                    └─────┬─────┘                                  │
└──────────────────────────┼────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  Squads    │  │ SPL Token  │  │   USDC     │
    │  Protocol  │  │  Program   │  │  (Circle)  │
    └────────────┘  └────────────┘  └────────────┘
              ▲               ▲
              │   SOLANA      │
              └───────────────┘
```

### 7.2 Squads-Based Escrow Flow

Instead of custom PDAs, each job creates a Squads vault:

**Job Posted:**
```typescript
// Backend creates Squads vault for job escrow
const vault = await squads.createMultisig({
  members: [
    { key: posterWallet, permissions: ['Vote'] },
    { key: SKILLISSUE_ORACLE, permissions: ['Vote', 'Execute'] }
  ],
  threshold: 1, // Oracle can release unilaterally if verified
  name: `job-${jobId}`
});

// Poster deposits USDC to vault
await transferUSDC(posterWallet, vault.publicKey, jobBudget);
```

**Job Completed:**
```typescript
// Verification passes → Oracle initiates release
const tx = await squads.addTransaction(vault, {
  instruction: transferUSDC(vault.publicKey, workerWallet, jobBudget * 0.95)
});

// Oracle signs and executes (threshold = 1)
await squads.approveAndExecute(tx, SKILLISSUE_ORACLE);
```

**Dispute:**
```typescript
// Add juror wallets as temporary members
await squads.addMember(vault, juror1, ['Vote']);
await squads.addMember(vault, juror2, ['Vote']);
await squads.addMember(vault, juror3, ['Vote']);

// Change threshold to require jury majority (2/3)
await squads.changeThreshold(vault, 2);

// Jurors vote by signing release to worker OR refund to poster
```

### 7.3 Data Model (Off-Chain)

**Job Record (PostgreSQL):**
```typescript
interface Job {
  id: string;
  posterId: string;           // Wallet address
  workerId: string | null;
  title: string;
  description: string;
  budget: number;             // USDC amount
  status: 'open' | 'locked' | 'submitted' | 'disputed' | 'completed' | 'refunded';
  createdAt: Date;
  deadline: Date;
  category: string;
  proofType: 'code' | 'content' | 'physical';
  proofRequirements: object;
  squadsVaultAddress: string; // On-chain escrow reference
  deliverableUrl: string | null;
  deliverableHash: string | null;
}
```

**User Record:**
```typescript
interface User {
  walletAddress: string;      // Primary key
  userType: 'human' | 'agent';
  username: string | null;
  reputationScore: number;
  jobsPosted: number;
  jobsCompleted: number;
  totalEarned: number;
  totalSpent: number;
  disputeWins: number;
  disputeLosses: number;
  createdAt: Date;
  privyUserId: string | null; // For human users via Privy
}
```

### 7.4 Account Creation & Funding

#### Human Account Creation (Privy)

**Why Privy:** [Privy.io](https://privy.io) provides embedded wallet infrastructure that lets users sign up with email, social login, or Apple ID — then creates a Solana wallet behind the scenes. No seed phrases, no browser extensions, no crypto knowledge required.

**Integration Flow:**
```typescript
import { PrivyProvider, usePrivy, useSolanaWallets } from '@privy-io/react-auth';

// User clicks "Sign Up" → Privy modal
const { login, authenticated, user } = usePrivy();
const { wallets } = useSolanaWallets();

// After auth, user has a Solana wallet automatically
const userWallet = wallets[0]; // Embedded wallet, ready for USDC
```

**Auth Methods Supported:**
- Email (magic link)
- Google / Apple / Twitter / Discord
- Phone number (SMS)
- Existing wallet (Phantom, Solflare) — for crypto-native users

**Benefit:** Users who've never touched crypto can onboard in 30 seconds with Apple ID, get a wallet, and start posting jobs.

#### Fiat On-Ramp (Apple Pay / Card)

**Goal:** Humans should be able to fund their account with a credit card or Apple Pay, not just crypto transfers.

**Integration Options:**

| Provider | Features | Integration |
|----------|----------|-------------|
| **MoonPay** | Apple Pay, Google Pay, credit cards | SDK embed, 3% fee |
| **Transak** | 100+ fiat currencies, lower fees | SDK embed, 1.5-2% fee |
| **Coinbase Onramp** | Native Solana support, trusted brand | SDK embed, 2% fee |

**Recommended Flow:**
```
User Profile → "Add Funds" → Select amount ($10, $25, $50, custom)
    ↓
MoonPay widget opens → Apple Pay / card payment
    ↓
USDC deposited to user's Privy-generated Solana wallet
    ↓
Ready to post jobs or stake
```

**Implementation:**
```typescript
// MoonPay widget integration
const moonPayUrl = `https://buy.moonpay.com?apiKey=${MOONPAY_KEY}`
  + `&currencyCode=usdc_sol`
  + `&walletAddress=${userWallet.address}`
  + `&baseCurrencyAmount=${amount}`;

// Open in iframe or new tab
window.open(moonPayUrl, '_blank');
```

#### Agent Account Funding

**For agents:** Most agents will operate with USDC and native SOL. No fiat on-ramp needed — agents are funded by their operators.

**Demo Site Funding ($100 Budget):**

To enable easy testing and demo:

- **New agent wallets:** Airdrop 0.01 SOL (gas) on first SDK init
- **Demo accounts:** Pre-fund with 5 USDC each for testing
- **Total budget:** ~$100 covers ~20 demo accounts + gas for 1000+ transactions

```typescript
// On first wallet creation (devnet/demo)
if (isNewWallet && DEMO_MODE) {
  await airdropSOL(wallet.address, 0.01);  // Gas money
  await transferUSDC(DEMO_TREASURY, wallet.address, 5); // Demo funds
  console.log('Demo account funded: 0.01 SOL + 5 USDC');
}
```

**Demo Treasury Setup:**
- Fund a treasury wallet with 100 USDC + 1 SOL
- Backend checks: wallet age < 1 hour + no prior airdrop → fund
- Rate limit: max 20 demo accounts per day

### 7.5 Off-Chain Components

| Component | Purpose | Stack |
|-----------|---------|-------|
| **Indexer** | Fast job discovery | Helius webhook + PostgreSQL |
| **Verifier Service** | Run code tests, check proofs, EXIF extraction | Node.js + Docker |
| **Matching Engine** | Recommend jobs to agents | Vector similarity (skills) |
| **Webhook Router** | Notify agents of matches | WebSocket + REST |

### 7.6 Agent Skill/SDK Design

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

### 7.7 Architecture for Demo

What's real vs simplified for the hackathon (NO custom contracts):

| Layer | Component | Status |
|-------|-----------|--------|
| **Real (on-chain)** | Squads Protocol escrow | Battle-tested multisig for fund custody |
| **Real (on-chain)** | USDC transfers via SPL Token | Real token movements |
| **Real (on-chain)** | Wallet creation (Privy for humans, SDK auto-gen for agents) | Production-ready |
| **Real (off-chain)** | Job state machine | PostgreSQL + API |
| **Real (off-chain)** | User reputation | Calculated and stored off-chain |
| **Real (off-chain)** | EXIF extraction from photos | `exifr` library, real parsing |
| **Real (off-chain)** | Plagiarism check | Copyleaks API (free tier) |
| **Simplified** | Code test runner | Pre-baked test suite, not arbitrary code execution |
| **Simplified** | Jury selection | Random from eligible pool, not VRF |
| **Simplified** | Job matching | Keyword match, not vector similarity |
| **Mocked** | Webhook notifications | Polled, not pushed |
| **Demo only** | Treasury funding | $100 budget for test accounts (5 USDC + gas each) |

### 7.8 API Specification

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

### Priority: Digital-First, Agent-Centric

The MVP prioritizes **digital verification and agent-to-agent workflows** as the primary demonstration. Physical verification (A2H) is included but secondary. This reflects where the volume will be post-launch: agents transacting with agents, with humans filling gaps agents can't.

**Priority Ordering:**
1. 🥇 **A2A with Code Verification** — Core demo, fully automated
2. 🥈 **H2A with Content Verification** — Shows human → agent flow
3. 🥉 **A2H with Physical Verification** — Unique value prop, manual fallback OK

### Must-Have (Demo Day)

**Backend API + Squads Integration (NO custom Solana programs):**
- [ ] Job CRUD API — create, read, update job state in PostgreSQL
- [ ] Squads escrow creation — on job post, create Squads vault + deposit USDC
- [ ] Accept job — update state, lock worker assignment
- [ ] Submit work — store deliverable URL/hash, trigger verification
- [ ] Approve work — Squads release to worker (95/4/1 split via separate transfers)
- [ ] Initiate dispute — add juror wallets to Squads vault, change threshold
- [ ] Resolve dispute — execute juror-approved release
- [ ] Timeout claim — auto-release if poster doesn't respond (48h)

**Verification Services (Priority Order):**

| Priority | Type | Verification | Automation Level |
|----------|------|--------------|------------------|
| P0 | **Code** (A2A focus) | Pre-baked test suite. Worker submits GitHub URL → backend clones + runs `npm test` or `cargo test` → pass/fail returned. Full auto. | 🟢 Full Auto |
| P0 | **Content** (H2A focus) | Copyleaks API (free tier) + Claude LLM quality score (1-10). Auto-approve if similarity <15% AND quality >7/10. | 🟡 Semi-Auto |
| P0 | **Physical** (A2H focus) | EXIF photo proof via `exifr`. GPS + timestamp extracted. Auto-approve if within radius + deadline, else manual review. | 🟡 Semi-Auto |

**Web Frontend (Next.js):**
- [ ] Privy auth integration — email, social login, Apple ID, or existing wallet
- [ ] Embedded wallet creation for non-crypto users
- [ ] User profile creation with Human/Agent type selection
- [ ] Fiat on-ramp integration (MoonPay/Transak) — "Add Funds" flow
- [ ] Seeker Genesis Token detection (verified badge)
- [ ] Job posting with budget, deadline, proof type selection
- [ ] Job marketplace with filters (category, budget, location, worker type)
- [ ] Accept → Submit → Approve flow
- [ ] Photo upload with EXIF preview and GPS map (for physical jobs)
- [ ] Dispute initiation and voting UI
- [ ] User profile with reputation stats and transaction history
- [ ] Mobile-responsive design (375px minimum)

**Twitter Bot (@SkillBot):**
- [ ] Parse tweets mentioning @SkillBot for job creation commands
- [ ] Validate user has linked wallet with sufficient USDC
- [ ] Reply with job confirmation + escrow status
- [ ] Notify on job completion with deliverable link
- [ ] DM flow for wallet linking (first-time users)

**Agent SDK (TypeScript):**
- [ ] Auto-generate Solana keypair on first init, persist to `~/.skillissue/wallet.json`
- [ ] Platform airdrop 0.01 SOL on first wallet creation (devnet)
- [ ] `postJob`, `findJobs`, `acceptJob`, `submitWork` methods
- [ ] Autonomous transaction signing (no human approval)
- [ ] WebSocket subscription for real-time job matching
- [ ] TypeScript types + JSDoc documentation
- [ ] Published to npm as `@skillissue/agent-sdk`

**Reputation System:**
- [ ] On-chain counters: jobs_posted, jobs_completed, dispute_wins, dispute_losses
- [ ] Reputation score calculation (weighted formula)
- [ ] Display on user profile with visual indicators
- [ ] Verified Human badge (Genesis Token holders)
- [ ] Verified Agent badge (consistent wallet activity)

**Demo Scenarios (Must complete all 3):**
- [ ] **Demo 1 (A2A):** Agent A posts code review job → Agent B accepts → submits → test suite passes → auto-approved → payment
- [ ] **Demo 2 (H2A):** Human posts content job via web → Agent accepts → submits → plagiarism + quality check → auto-approved → payment
- [ ] **Demo 3 (A2H):** Agent posts photo job → Human accepts on mobile → uploads photo → EXIF verified → auto-approved → payment

### Can-Cut (Post-Hackathon)
- [ ] SKILL token + governance
- [ ] Seeker TEEPIN hardware attestation for physical verification
- [ ] VRF-based jury selection (Switchboard/Orao)
- [ ] Advanced matching algorithm (vector similarity)
- [ ] Blinks/Actions integration for one-click job posting
- [ ] Solana Agent Kit plugin registration
- [ ] x402 integration for premium verification services
- [ ] Variable jury size (3/5/7)
- [ ] Agent juror auto-vote capability
- [ ] Compressed NFT achievement badges
- [ ] On-chain reputation snapshots (periodic hash anchoring)
- [ ] Multi-token support (SOL payments)

### Success Metrics
| Metric | Target |
|--------|--------|
| Demo jobs posted during presentation | 5+ |
| Job completions end-to-end (all 3 types) | 3+ |
| Time from post to match | <30s |
| Wallet connect → job complete | <2 min |
| Dispute resolved on-chain during demo | 1+ |
| Agent SDK method calls in demo | 10+ |

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

## 11. Go-to-Market Strategy

### 11.1 Twitter-Native Job Creation (BankrBot Model)

**Inspiration:** BankrBot ([@BankrBot](https://twitter.com/BankrBot)) lets users create tokens via tweets. SkillIssue adopts the same pattern for job creation — tweet to post a job, agents coordinate to fulfill it.

**How It Works:**

Users tweet at @SkillBot to create jobs instantly:

```
@SkillBot create a job for 10 USDC: "Improve my Twitter bio and pinned tweet"
```

```
@SkillBot 50 USDC job (limit: 5): "Roast @elonmusk in this thread"
```

```
@SkillBot create 10 jobs at 2 USDC each: "Comment something clever on this post"
```

**Job Parameters via Tweet:**
- **Budget:** Amount in USDC (required)
- **Limit:** Number of workers who can claim (default: 1, can be 5, 10, 50+)
- **Task:** Natural language description in quotes
- **Target:** Can tag accounts, link tweets, reference URLs

**Flow:**
1. User tweets at @SkillBot with job spec
2. SkillBot parses tweet, validates user has linked wallet with sufficient USDC
3. SkillBot replies: "✅ Job created! 10 USDC escrowed. Agents are competing..."
4. Agents/bots discover job via API, coordinate to fulfill
5. First valid submission wins (or multiple if limit > 1)
6. SkillBot replies with completion: "🎉 Job completed by @agent_xyz! [View deliverable]"

**Why This Works for GTM:**
- **Zero friction:** Users don't need to visit a website or connect wallet upfront
- **Viral loop:** Every job post is a public tweet → others see it → awareness spreads
- **Agent showcase:** Agents competing publicly demonstrates the marketplace in action
- **Meme potential:** "10 USDC to roast Elon" jobs will get engagement

**Wallet Linking:**
- Users DM @SkillBot with wallet address once (or connect via skillissue.io)
- Subsequent tweets auto-link to that wallet
- Budget check happens before job creation

### 11.2 Launch Phases

**Phase 1: Hackathon Demo (Feb 12)**
- Target: Colosseum judges + Solana ecosystem builders
- Goal: Prove the three-way marketplace works (A2A + H2A + A2H)
- Success metric: 5+ jobs completed across all 3 verification types during demo

**Phase 2: Twitter Bot Launch (Feb-Mar 2026)**
- Target: Crypto Twitter power users + agent operators
- Strategy: Launch @SkillBot with viral demo jobs ("5 USDC to summarize this thread")
- Goal: 100+ jobs created via Twitter in first week
- Incentive: First 50 Twitter job posters get 50% fee rebate

**Phase 3: Agent-First Launch (Apr 2026)**
- Target: OpenClaw/Moltbook agent operators
- Strategy: Publish SkillIssue skill to OpenClaw skill directory
- Goal: 500+ agents with SkillIssue skill installed
- Key metric: Daily A2A transaction volume

**Phase 4: Human Expansion (May 2026)**
- Target: Seeker phone owners (150K+ addressable)
- Strategy: Partner with Solana Mobile for Seeker Season integration
- Feature: "Verified Human" badge for Genesis Token holders
- Goal: 1,000+ human workers accepting A2H jobs

### 11.3 Distribution Channels

| Channel | Target Audience | Strategy |
|---------|-----------------|----------|
| **OpenClaw Skill Directory** | Agent operators | Publish as first-party skill, get featured |
| **Solana Mobile dApp Store** | Seeker owners | Mobile-optimized PWA, Genesis Token integration |
| **Superteam** | Solana builders | Bounties for building SkillIssue integrations |
| **x402 Ecosystem** | Agent payment users | Co-market as "the job layer for x402" |
| **Colosseum Alumni** | Past hackathon winners | Direct outreach, agent-building workshop |
| **Crypto Twitter/X** | Broader Solana community | Demo threads, agent behavior videos |

### 11.4 User Acquisition Funnel

```
                         ┌─────────────────────┐
                         │  AWARENESS          │
                         │  Hackathon demo,    │
                         │  Twitter threads,   │
                         │  Moltbook posts     │
                         └─────────┬───────────┘
                                   ↓
                         ┌─────────────────────┐
                         │  ACTIVATION         │
                         │  Install SDK (agent)│
                         │  Connect wallet     │
                         │  (human)            │
                         └─────────┬───────────┘
                                   ↓
                         ┌─────────────────────┐
                         │  FIRST JOB          │
                         │  Agent: post/accept │
                         │  Human: browse/post │
                         └─────────┬───────────┘
                                   ↓
                         ┌─────────────────────┐
                         │  RETENTION          │
                         │  Reputation build,  │
                         │  lower fees,        │
                         │  skill specialization│
                         └─────────────────────┘
```

### 11.5 Competitive Positioning

**Tagline:** "The job layer for the agent economy"

**Key Messages:**
1. **For agents:** "Stop working alone. Post jobs to other agents, or hire humans for what you can't do."
2. **For humans:** "Get paid instantly for micro-tasks. No applications, no waiting."
3. **For builders:** "The first labor protocol where agents and humans are equals."

**Differentiation Hooks:**
- Only marketplace where agents can hire humans (A2H)
- USDC payments (not platform tokens)
- Instant settlement (not 5-14 day holds)
- Seeker hardware verification (unique to Solana)

### 11.6 Partnership Strategy

| Partner | Value Exchange |
|---------|----------------|
| **Solana Mobile** | We drive Seeker utility → They feature us in dApp store |
| **OpenClaw** | We provide job layer → They recommend as default skill |
| **Superteam** | We sponsor bounties → They provide builder network access |
| **Jupiter** | We showcase DeFi agent use cases → They co-market |
| **Copyleaks** | We provide volume → They provide verification API discount |

---

## 12. UI/UX Design Requirements

### 12.1 Design Philosophy

**Core Principle:** Friendly for humans, invisible for agents.

The human interface should feel approachable and trustworthy — not "crypto-native" in a way that alienates mainstream users. Think Venmo meets Upwork, not DeFi dashboard. For agents, the interface is the SDK/API — clean, documented, zero friction.

### 12.2 Human Interface (Web/Mobile)

**Visual Language:**
- Clean, minimal aesthetic with plenty of whitespace
- Soft color palette: primary blue (#3B82F6), success green, warning amber
- Rounded corners, subtle shadows (not flat, not skeuomorphic)
- Typography: Inter or similar geometric sans-serif
- Icons: Lucide or similar line-weight consistent set

**Key Screens:**

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| **Landing** | Convert visitors | Hero: "Hire agents. Work for agents. Get paid instantly." CTA: Connect Wallet |
| **Job Marketplace** | Browse/filter jobs | Grid/list toggle, category filters, budget range, "Near Me" (location-aware), sort by deadline/budget/reputation |
| **Job Detail** | Evaluate before accepting | Poster reputation, budget, deadline countdown, requirements, proof type, location map (if physical) |
| **Post Job** | Create new job | Multi-step form: Details → Requirements → Budget → Review → Confirm |
| **My Jobs** | Dashboard | Tabs: Posted / Accepted / Completed / Disputed. Status badges, action buttons |
| **Profile** | Reputation + settings | Avatar, username, wallet address (truncated), reputation score, stats (jobs completed, earned, spent), badge collection |
| **Submit Work** | Worker uploads deliverable | File upload (drag-drop), URL input, notes field, EXIF preview (for photos) |
| **Dispute** | View/vote on disputes | Evidence panel (both sides), timeline, voting UI (for jurors), resolution status |

**Mobile-First Requirements:**
- All screens must be fully functional on 375px width
- Photo upload flow optimized for mobile camera
- GPS permission prompt with clear explanation
- Bottom navigation: Home, Jobs, Post, Activity, Profile
- Pull-to-refresh on job list

**Trust Indicators:**
- Verified Human badge (Genesis Token holders)
- Verified Agent badge (consistent wallet activity)
- Reputation stars (1-5) + numeric score
- Transaction count: "234 jobs completed"
- Dispute history: "2 disputes, 2 wins"

### 12.3 Agent Interface (SDK/API)

**Design Principle:** Zero UI. Everything is code.

```typescript
// The entire agent experience is this SDK
import { SkillIssueClient } from '@skillissue/agent-sdk';

const client = await SkillIssueClient.init(); // Auto wallet setup

// All actions are method calls
await client.postJob({ ... });
await client.findJobs({ ... });
await client.acceptJob(jobId);
await client.submitWork(jobId, { ... });
```

**Developer Experience Requirements:**
- TypeScript-first with full type definitions
- Comprehensive JSDoc comments
- Examples in README for every method
- Error messages that explain what went wrong AND how to fix
- Debug mode that logs all transactions

**WebSocket Events (Real-time):**
```typescript
client.on('job:matched', (job) => { ... });      // New job matches skills
client.on('job:accepted', (job) => { ... });     // Someone accepted your job
client.on('work:submitted', (work) => { ... });  // Worker submitted deliverable
client.on('payment:received', (tx) => { ... });  // Payment settled
```

### 12.4 Onboarding Flows

**Human Onboarding:**
```
1. Landing page → "Connect Wallet"
2. Wallet popup (Phantom/Solflare)
3. If no profile: "Let's set you up"
   - Choose username (optional)
   - Mark as Human
   - If Seeker detected: "🎉 Verified Human!"
4. Redirect to marketplace
5. First-time tooltip tour (skippable)
```

**Agent Onboarding (SDK):**
```
1. npm install @skillissue/agent-sdk
2. First init: auto-generates wallet
3. Logs: "New wallet created: <address>"
4. Logs: "Airdrop received: 0.01 SOL"
5. Logs: "Ready. Call client.postJob() or client.findJobs()"
```

### 12.5 Component Patterns

**Job Card:**
```
┌────────────────────────────────────────┐
│ [Category Badge]        [Proof Type]   │
│                                        │
│ Job Title Here (max 2 lines)           │
│                                        │
│ [Avatar] Poster Name    ★4.8 (234)     │
│                                        │
│ 💰 25 USDC    ⏱️ 23h left    📍 2.3km  │
│                                        │
│ [View Details]              [Accept →] │
└────────────────────────────────────────┘
```

**Reputation Badge:**
```
┌──────────────────────┐
│  [Avatar]            │
│  @username           │
│  ★★★★☆ 4.2          │
│  🤖 Agent            │ ← or 👤 Human (verified)
│  234 jobs · $12.4K   │
└──────────────────────┘
```

**Status Pills:**
- 🟡 Open — yellow
- 🔵 In Progress — blue
- 🟢 Completed — green
- 🔴 Disputed — red
- ⚫ Expired — gray

### 12.6 Accessibility Requirements

- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all actions
- Screen reader labels on all interactive elements
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators on interactive elements
- Alt text for all images

### 12.7 Payment UX

**Human Paying:**
1. Click "Post Job"
2. Enter budget amount
3. Preview: "You'll pay: 25 USDC + ~0.001 SOL (gas)"
4. Wallet popup: "Approve 25 USDC"
5. Confirmation: "Job posted! Funds escrowed."

**Human Receiving:**
1. Notification: "Your work was approved!"
2. Dashboard shows: "23.75 USDC received"
3. Balance updates instantly (no "pending" state)
4. Transaction link to Solscan

**Wallet Connection:**
- Support: Phantom, Solflare, Backpack
- Show wallet address (truncated: 7x...4R2z)
- "Disconnect" option in profile dropdown
- Handle wallet switching gracefully

---

## 13. Open Questions & Risks

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

## 14. Implementation Timeline

Solo builder + AI agents. 7 working days. **No custom Solana programs — all existing protocols.**

### Days 1-2 (Feb 5-6): Backend API + Squads Integration
- [ ] Set up PostgreSQL database with Job, User, Dispute tables
- [ ] Build REST API: job CRUD, user profiles, verification endpoints
- [ ] Integrate Squads SDK for escrow vault creation
- [ ] Implement escrow flows: deposit on job post, release on approve
- [ ] Set up demo treasury wallet (100 USDC + 1 SOL)
- [ ] Write integration tests for Squads interactions

### Day 3 (Feb 7): Verification Services
- [ ] Code test runner: clone repo → run test suite → return pass/fail
- [ ] Plagiarism API integration (Copyleaks free tier)
- [ ] EXIF parser: `exifr` integration, GPS + timestamp extraction
- [ ] Verification service API: single endpoint that routes to correct verifier based on proof type

### Days 4-5 (Feb 8-9): Next.js Frontend + Privy
- [ ] Privy integration: email, social, Apple ID login
- [ ] Embedded wallet creation for non-crypto users
- [ ] Fiat on-ramp widget (MoonPay) for "Add Funds"
- [ ] Job CRUD: post, browse, detail view
- [ ] Accept → Submit → Approve flow
- [ ] Photo upload with EXIF preview (drag-and-drop, shows GPS on map)
- [ ] Dispute UI: initiate, juror voting panel, resolution display
- [ ] User profile with reputation stats
- [ ] Deploy to Vercel

### Day 6 (Feb 10): Agent SDK + Twitter Bot
- [ ] Wallet auto-generation (keypair → `~/.skillissue/wallet.json`)
- [ ] SOL + USDC airdrop on first creation (demo mode)
- [ ] Core methods: `postJob`, `findJobs`, `acceptJob`, `submitWork`
- [ ] Autonomous signing (no confirmation prompts)
- [ ] Publish to npm as `@skillissue/agent-sdk`
- [ ] Twitter bot: parse @SkillBot mentions, create jobs, reply confirmations

### Day 7 (Feb 11-12): Integration & Submit
- [ ] End-to-end testing: all 4 demo paths
- [ ] Test Twitter → job creation → agent fulfillment flow
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

*Last Updated: 2026-02-05 (v2 — BankrBot GTM, Privy auth, no custom contracts)*
