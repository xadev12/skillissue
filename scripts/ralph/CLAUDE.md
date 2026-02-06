# CLAUDE.md - SkillIssue Ralph Loop

## Project Context

**SkillIssue** is an Agent-to-Agent, Human-to-Agent, Agent-to-Human Job Marketplace on Solana for the Colosseum Hackathon.

**Wallet for Deployments:** `6RrjCr3Q8zWGjHzqF9L9M94bKN1kFwEE4tF8XYXWj4vP`

**Key Constraints:**
- NO custom Solana programs (use Squads Protocol for escrow)
- USDC payments only
- React + TypeScript + Vite
- Welcoming marketplace design (not generic blue)

## Tech Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS (glassmorphism, dark theme)
- **Auth:** Privy (embedded wallets + social login)
- **Blockchain:** Solana (devnet for hackathon)
- **Escrow:** Squads Protocol (multisig, no custom contracts)
- **Token:** USDC (SPL Token)

## Design Principles

**Welcoming Marketplace:**
- Warm colors: Deep purple (#6B4EE6), Teal (#2DD4BF)
- Glassmorphism cards with subtle gradients
- Clean typography, generous whitespace
- Friendly microcopy (not corporate)
- Reference: Fiverr but warmer, more personal

**Key Pages:**
1. Homepage - welcoming hero, value prop, recent jobs
2. Job Listings - filterable grid, search
3. Job Detail - full info, accept action
4. Post Job - multi-step form
5. Profile - stats, history, reputation

## File Structure

```
skillissue/
├── app/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # Routes
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utils
│   └── package.json
├── prd.json               # Ralph task list (this file)
├── progress.txt           # Ralph learnings (append-only)
└── scripts/ralph/
    ├── ralph.sh          # Ralph loop script
    └── CLAUDE.md         # This file
```

## Quality Checklist

Before marking any story as complete:

- [ ] `npm run build` passes (TypeScript check)
- [ ] `npm run dev` starts without errors
- [ ] Component renders without console errors
- [ ] Responsive on mobile (375px) and desktop
- [ ] Follows design system (colors, spacing, typography)

## Common Patterns

**Component Structure:**
```tsx
// Always use memo for performance
export const ComponentName = memo(function ComponentName({ props }: Props) {
  // implementation
});

// Glass card style
<div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
```

**Colors:**
- Background: `#0F0F1A` (dark)
- Card: `#1A1A2E` (elevated)
- Primary: `#6B4EE6` (purple)
- Secondary: `#2DD4BF` (teal)
- Text: White / gray-300

## Wallet Setup

**Deployer Wallet:** `6RrjCr3Q8zWGjHzqF9L9M94bKN1kFwEE4tF8XYXWj4vP`

This wallet has devnet SOL for transactions. Use it for:
- Deploying to devnet
- Creating Squads vaults
- Testing escrow flows

## Ralph Loop Commands

**Run the loop:**
```bash
./scripts/ralph/ralph.sh --tool claude 20
```

**Check progress:**
```bash
cat prd.json | jq '.userStories[] | {id, title, passes}'
cat progress.txt
```

**Manual commit (if needed):**
```bash
git add .
git commit -m "[ralph] US-XXX: Description"
```

## Resources

- [[SkillIssue PRD]] — Full product requirements
- [[Squads Protocol]] — Escrow integration docs
- [[Privy Docs]] — Embedded wallet setup
- [[Colosseum Hackathon]] — Event details

---

**Focus:** Welcoming marketplace UI → Working Squads escrow → Demo-ready