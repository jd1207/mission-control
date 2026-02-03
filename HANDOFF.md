# HANDOFF.md — Mission Control Agent Onboarding

*Last updated: Feb 2, 2026 — by BagBot 💼*

Welcome aboard. This file gets you up to speed on Mission Control so you can start contributing immediately.

---

## What Is Mission Control?

Mission Control (MC) is a **collaborative AI orchestration platform**. Think of it as the coordination layer for multiple AI agents working on shared projects together.

**Core idea:** Your AI agent sits idle most of the time. MC lets agents connect to a shared pool, pick up tasks, contribute compute, and earn rewards — all coordinated through a real-time dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Backend/DB | Convex (real-time database with built-in subscriptions) |
| Deployment | Railway |
| Blockchain | Solana (in progress — Anchor framework) |
| Video/Marketing | Remotion (in `remotion/` subfolder) |

---

## Project Structure

```
mission-control/
├── app/                    # Next.js pages & API routes
│   ├── (dashboard)/        # Main dashboard views
│   │   ├── agents/         # Agent management
│   │   ├── tasks/          # Task board
│   │   └── pool/           # Pool worker dashboard
│   ├── connect/            # Agent connection flow
│   ├── claim/              # Human claims agent
│   └── api/                # API routes (process-task webhook)
├── components/             # Reusable UI components
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── agents.ts           # Agent CRUD + registration
│   ├── tasks.ts            # Task management
│   ├── poolWorkers.ts      # Pool worker operations
│   ├── messages.ts         # Agent messaging
│   └── http.ts             # HTTP webhook endpoints
├── remotion/               # Remotion video project (separate package)
├── branding/               # Logo, brand guide, assets
├── public/                 # Static files incl. skill.md for agents
├── shared/                 # Coordination docs
└── skill.md                # Agent connection instructions
```

---

## Database Schema (Convex)

Key tables:
- **agents** — registered AI agents (name, status, capabilities, owner)
- **tasks** — work items (title, description, status, assignedAgent, priority)
- **messages** — agent-to-agent and system messages
- **activities** — activity feed / audit log
- **poolWorkers** — agents in the compute pool (credits, status)
- **creditPool** — credit rotation tracking
- **documents** — shared files/context
- **notifications** — system notifications

---

## Current Status

### ✅ What's Built
- Real-time dashboard with agent cards, task board, activity feed
- Agent registration + human claim flow
- Pool worker system with credit tracking
- "Process Task" button (triggers webhook → agent executes)
- Create Task / Create Agent dialogs
- Landing page at `/connect`
- Deployed to Railway (live)
- 5 branded Remotion promo videos
- Branding: emerald green (#22C55E) + dark navy (#0A0A0F)

### 🚧 What Needs Work (Priority Order)
1. **Solana Integration** ← HACKATHON CRITICAL
   - On-chain staking for pool operators
   - SPL token rewards on task completion
   - Agent reputation as on-chain metadata
   - Anchor program needed
2. **Connect flow end-to-end testing** — agent registers → human claims → task assigned → processed
3. **Error handling** — "Process Task" button needs better feedback when no agent connected
4. **Wire Create Agent dialog** into agents page properly

---

## Hackathon Context

We're in the **Colosseum Solana Agent Hackathon** (Feb 2-12, 2026).

**Rules:**
- ALL code must be written by AI agents (humans configure/run, agents build)
- Must integrate with Solana
- Project can be updated until submission (submission locks it permanently)
- Judged on: technical execution, creativity, real-world utility

**Our Edge:** We're the only team building agent COORDINATION. Everyone else builds individual agent tools. We build the layer that connects them.

**Prizes:** $100K USDC total (1st: $50K, 2nd: $30K, 3rd: $15K, Most Agentic: $5K)

---

## How to Contribute

### Git Workflow
- **Main branch:** `main` — protected, only reviewed code
- **Your branch:** `agent/<your-name>-<task-slug>` (e.g., `agent/rembrandt-solana-program`)
- Push your branch, open a PR when ready

### Task Workflow
1. Check the task board or this doc for what needs doing
2. Create your branch
3. Build the thing
4. Push + PR
5. Update this doc with what you did

### Environment Setup
```bash
# Clone
git clone https://github.com/natebag/mission-control.git
cd mission-control

# Install deps
npm install

# Convex (need CONVEX_DEPLOY_KEY or `npx convex dev`)
# Ask BagBot for Convex access if needed

# Run locally
npm run dev
```

---

## Immediate Priority: Solana Program

We need an **Anchor program** that handles:

1. **Pool Staking** — operators deposit SOL/tokens to join the compute pool
2. **Task Escrow** — task creators lock payment, released on completion
3. **Reward Distribution** — completed tasks trigger SPL token transfer to worker
4. **Reputation** — on-chain metadata tracking agent task history

If you're picking this up, start with a basic Anchor project in a `solana/` directory. Devnet deployment first.

---

## Team

| Name | Role | Notes |
|------|------|-------|
| Nate | Founder / Owner | Makes final calls |
| BagBot | Lead Agent (Windows) | Built the platform, coordinates |
| BagJones / Rembrandt | Agent | You're here — welcome! |
| Lewy / REAAAAALBAAAADBOT | Agent | Parallel tasks, memes, engagement |
| MacBag | Agent (Mac) | Currently down |

---

## Communication

- **Telegram group:** Real Clawdmons (primary coordination)
- **Git:** Push branches, open PRs, update HANDOFF.md
- **Shared repo:** github.com/natebag/bagbot-shared (cross-agent docs)

---

## ⚠️ IMPORTANT RULES

1. **DO NOT publish project details publicly** without team approval
2. **DO NOT submit the hackathon project** — only Nate/BagJones authorize submission
3. **Keep the repo private** — no sharing links externally
4. **All code must be AI-written** — hackathon rule, don't break it

---

*Read this, pick a task, start building. Ask in the group if you need context.*

—BagBot 💼
