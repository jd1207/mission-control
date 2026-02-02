# Mission Control — Backend Architecture

## Core Concept
Users create tasks on a dashboard → tag to agents → hit "Process" → system spawns isolated OpenClaw sessions with ONLY the context needed for that task. Multiple tasks can process in parallel across different agents/instances.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 (App Router) | Already built, SSR + real-time |
| **Real-time DB** | Convex | Built-in subscriptions, no WebSocket wiring needed |
| **API** | Next.js API Routes + Convex Functions | Serverless, scales automatically |
| **Agent Bridge** | OpenClaw Skill (skill.md) | Agents read skill, auto-configure |
| **Task Execution** | OpenClaw `sessions_spawn` | Isolated sessions per task |
| **Auth** | Convex Auth or NextAuth | User accounts + agent claiming |
| **Payments** | Solana Web3.js | SOL rewards (Phase 2) |
| **Hosting** | Railway (or Vercel) | Simple deployment |

---

## Data Model (Convex Schema)

```typescript
// convex/schema.ts

// Users (humans who own agents)
users: defineTable({
  name: v.string(),
  email: v.optional(v.string()),
  walletAddress: v.optional(v.string()),  // SOL wallet
  claimedAgents: v.array(v.string()),     // agent IDs they own
  tokensContributed: v.number(),
  rewardsEarned: v.number(),
})

// Agents (AI instances that do work)
agents: defineTable({
  name: v.string(),
  description: v.string(),
  capabilities: v.array(v.string()),       // ["coding", "research", "analysis"]
  ownerId: v.optional(v.id("users")),      // claimed by user
  apiKey: v.string(),                       // mc_xxx
  status: v.union(
    v.literal("available"),
    v.literal("busy"),
    v.literal("offline"),
    v.literal("pending_claim")
  ),
  provider: v.string(),                     // "openclaw", "claude-code", "codex"
  connectionType: v.union(
    v.literal("local"),                     // runs on same machine as MC
    v.literal("remote")                     // external instance via WebSocket
  ),
  availableHours: v.optional(v.object({
    timezone: v.string(),
    idle: v.array(v.string()),             // ["09:00-17:00"]
  })),
  tokenBudget: v.optional(v.number()),     // max tokens per session
  tokensUsed: v.number(),
  tasksCompleted: v.number(),
  lastHeartbeat: v.optional(v.number()),
  reputationScore: v.number(),
})

// Projects (repos/codebases agents work on)  
projects: defineTable({
  name: v.string(),
  description: v.string(),
  repoUrl: v.string(),                     // GitHub repo
  defaultBranch: v.string(),               // "main"
  contextFile: v.string(),                 // path to CONTEXT.md
  connectedAgents: v.array(v.id("agents")),
  ownerId: v.id("users"),
  status: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("archived")
  ),
})

// Tasks (units of work)
tasks: defineTable({
  title: v.string(),
  description: v.string(),
  projectId: v.id("projects"),
  assignedAgentId: v.optional(v.id("agents")),
  createdBy: v.id("users"),
  status: v.union(
    v.literal("backlog"),
    v.literal("ready"),                    // can be processed
    v.literal("processing"),               // agent is working on it
    v.literal("paused"),                   // credit rotation pause
    v.literal("review"),                   // needs human review
    v.literal("done")
  ),
  priority: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("urgent")
  ),
  branch: v.optional(v.string()),          // agent/<name>-<task-slug>
  contextSnapshot: v.optional(v.string()), // task-specific context passed to session
  sessionKey: v.optional(v.string()),      // OpenClaw session ID
  tokensUsed: v.number(),
  estimatedTokens: v.optional(v.number()),
  result: v.optional(v.string()),          // completion summary
  tags: v.array(v.string()),              // for filtering/routing
  parentTaskId: v.optional(v.id("tasks")), // subtask support
})

// Sessions (OpenClaw sessions spawned per task)
sessions: defineTable({
  taskId: v.id("tasks"),
  agentId: v.id("agents"),
  sessionKey: v.string(),                  // OpenClaw session key
  model: v.string(),                       // which model is being used
  status: v.union(
    v.literal("running"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("paused")
  ),
  tokensUsed: v.number(),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  contextProvided: v.string(),             // what context was injected
  output: v.optional(v.string()),          // result summary
})

// Credit Pool (tracking token usage rotation)
creditPool: defineTable({
  agentId: v.id("agents"),
  userId: v.id("users"),
  provider: v.string(),                    // "anthropic", "openai"
  budgetRemaining: v.number(),
  budgetTotal: v.number(),
  rotationOrder: v.number(),               // 1, 2, 3... for cycling
  activeUntil: v.optional(v.number()),     // when current rotation ends
  cooldownUntil: v.optional(v.number()),   // when credits refresh
})
```

---

## Task Processing Flow

### Option A: "Process" Button (PRIMARY — User-Triggered)

```
User clicks "Process" on task in UI
  → Convex mutation: processTask(taskId, agentId)
    → Build context snapshot (ONLY task-relevant info)
    → Determine which agent/instance to use
    → Call OpenClaw sessions_spawn or send WebSocket task
    → Create session record
    → Update task status to "processing"
    → Agent receives task with minimal context
    → Agent works on isolated branch
    → Agent reports completion
    → Task moves to "review" or "done"
```

### Option B: Heartbeat Auto-Processing (SECONDARY — Idle Fill)

```
Agent heartbeat fires (every 30 min)
  → Check: am I idle? Is my human using me?
  → If idle: poll /api/v1/tasks/pending
  → Pick highest priority task matching capabilities
  → Self-assign and start processing
  → Same flow as above
```

### Heartbeat Cost Optimization

**Problem:** Heartbeats use tokens. Checking every 30 min with Claude Opus = expensive.

**Solutions:**

1. **Cheap model for heartbeats:**
   ```typescript
   // Heartbeat uses Haiku/Flash, task execution uses Opus/Sonnet
   sessions_spawn({
     task: "Check Mission Control for pending tasks",
     model: "anthropic/claude-haiku",  // cheap/fast
     // vs task execution:
     model: "anthropic/claude-sonnet-4",  // full power
   })
   ```

2. **Webhook trigger (best option):**
   ```typescript
   // When user clicks "Process" → webhook hits agent's OpenClaw
   // No heartbeat needed for task pickup
   POST https://agent-instance.com/webhook/mission-control
   {
     "type": "task_assigned",
     "task": { ... }
   }
   ```

3. **Long-poll instead of heartbeat:**
   ```typescript
   // Agent opens single long-lived connection
   // Server pushes tasks when available
   // Zero polling overhead
   GET /api/v1/tasks/listen?timeout=300
   ```

4. **Convex real-time subscriptions:**
   ```typescript
   // Frontend subscribes to task changes
   // When task assigned → triggers agent action
   // No polling, pure push
   useQuery(api.tasks.getAssigned, { agentId })
   ```

**Recommendation:** Use webhook + Convex subscriptions. Process button triggers webhook to agent. No wasteful heartbeat polling.

---

## Session Spawning (Key Implementation)

When a task is processed, we spawn an ISOLATED session with ONLY task context:

```typescript
// convex/tasks.ts

export const processTask = mutation({
  args: { taskId: v.id("tasks"), agentId: v.optional(v.id("agents")) },
  handler: async (ctx, { taskId, agentId }) => {
    const task = await ctx.db.get(taskId);
    const project = await ctx.db.get(task.projectId);
    
    // Build minimal context for this task ONLY
    const contextSnapshot = buildTaskContext(task, project);
    
    // Determine agent (assigned or auto-pick from pool)
    const agent = agentId 
      ? await ctx.db.get(agentId)
      : await pickBestAgent(ctx, task);
    
    // Determine model based on task type
    const model = task.priority === "urgent" 
      ? "anthropic/claude-sonnet-4"    // heavy tasks
      : "anthropic/claude-haiku";       // lighter tasks
    
    // For LOCAL agents (same OpenClaw instance):
    // Use sessions_spawn directly
    
    // For REMOTE agents (external instances):
    // Send task via WebSocket/webhook
    
    await ctx.db.patch(taskId, {
      status: "processing",
      assignedAgentId: agent._id,
      branch: `agent/${agent.name}-${slugify(task.title)}`,
      sessionKey: sessionKey,
    });
  }
});

function buildTaskContext(task, project) {
  // ONLY include what the agent needs:
  return `
## Task: ${task.title}
${task.description}

## Project: ${project.name}
Repo: ${project.repoUrl}
Branch: agent/${agentName}-${slugify(task.title)}

## Instructions
1. Clone repo and checkout your branch
2. Read CONTEXT.md for current project state
3. Complete the task described above
4. Commit changes with descriptive messages
5. Update CONTEXT.md with what you did
6. Push branch and report completion

## Constraints
- Stay on YOUR branch only
- Do not modify files outside task scope
- If you need clarification, report back
- Token budget: ${task.estimatedTokens || 'unlimited'}
  `.trim();
}
```

---

## Parallel Processing

Multiple tasks can run simultaneously:

```
Task 1: "Build auth" → Agent A (BagJones' instance) → Branch: agent/bagjones-auth
Task 2: "Build UI"   → Agent B (Lewy's instance)    → Branch: agent/lewy-ui  
Task 3: "Write tests" → Agent C (Nate's instance)    → Branch: agent/bagbot-tests

All 3 run in parallel, isolated branches, no conflicts.
Orchestrator merges completed branches in dependency order.
```

---

## Credit Rotation Logic

```typescript
// convex/creditPool.ts

export const rotateCredits = mutation({
  handler: async (ctx) => {
    const pool = await ctx.db.query("creditPool")
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();
    
    // Find current active provider
    const current = pool.find(p => p.activeUntil > Date.now());
    
    if (!current || current.budgetRemaining <= 0) {
      // Rotate to next in order
      const next = pool
        .filter(p => p.cooldownUntil < Date.now())
        .sort((a, b) => a.rotationOrder - b.rotationOrder)[0];
      
      if (next) {
        await ctx.db.patch(next._id, {
          activeUntil: Date.now() + (2 * 60 * 60 * 1000), // 2 hours
        });
        
        // Pause current, set cooldown
        if (current) {
          await ctx.db.patch(current._id, {
            activeUntil: null,
            cooldownUntil: Date.now() + (4 * 60 * 60 * 1000), // 4hr cooldown
          });
        }
      }
    }
  }
});
```

---

## API Routes Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/agents/register` | Register new agent |
| GET | `/api/v1/agents/me` | Get agent status |
| POST | `/api/v1/agents/availability` | Update availability |
| GET | `/api/v1/projects` | List projects |
| POST | `/api/v1/projects` | Create project |
| POST | `/api/v1/projects/:id/join` | Join project |
| GET | `/api/v1/tasks/pending` | Get available tasks |
| POST | `/api/v1/tasks/:id/process` | Trigger task processing |
| POST | `/api/v1/tasks/:id/progress` | Report progress |
| POST | `/api/v1/tasks/:id/complete` | Report completion |
| POST | `/api/v1/pool/join` | Join general compute pool |
| GET | `/api/v1/pool/status` | Pool stats |
| WS | `/ws` | Real-time task routing |

---

## Implementation Order

### Phase 0: MVP (This Week)
1. Convex schema (above)
2. Task CRUD in UI (create, assign, process button)
3. Agent registration API
4. Local session spawning (sessions_spawn for same-instance agents)
5. Basic dashboard (tasks, agents, status)

### Phase 1: Multi-Instance (Next Week)  
6. WebSocket bridge for remote agents
7. Skill.md auto-registration flow
8. Credit tracking per agent
9. Branch isolation + CONTEXT.md handoffs

### Phase 2: Credit Rotation (Week 3)
10. Credit pool management
11. Auto-rotation logic
12. Usage analytics dashboard
13. Webhook triggers (no heartbeat polling)

### Phase 3: Rewards (Week 4)
14. SOL wallet connection
15. Reward calculation
16. On-chain payments
17. Reputation system