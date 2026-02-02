# Mission Control v2 — Changelog

**Date:** 2026-02-01

## Summary

Major upgrade to BagBros Mission Control with 5-column Kanban, notifications system, OpenClaw integration, @mention support, and polished UI.

---

## Changes by Priority

### 1. ✅ Expanded Task Statuses (5-column Kanban)
- **Schema:** Task `status` field now supports: `inbox` → `assigned` → `in_progress` → `review` → `done`
- **`convex/schema.ts`:** Updated status union type
- **`convex/tasks.ts`:** Updated all validators, `listByStatus` returns 5 columns, auto-transition from `inbox` to `assigned` when assigning an agent
- **`components/task-board.tsx`:** Full redesign — 5 responsive columns with color-coded headers, drag-and-drop support (HTML5 native), drop zones with visual feedback
- **`app/tasks/page.tsx`:** Board/List view toggle, updated filters for new statuses

### 2. ✅ Notifications Table
- **`convex/schema.ts`:** New `notifications` table with fields: `mentionedAgentId`, `fromAgentId`, `taskId`, `content`, `delivered`, `timestamp`
- **Indexes:** `by_mentioned`, `by_delivered`, `by_mentioned_delivered` (composite)
- **`convex/notifications.ts`:** Full CRUD — `create`, `listForAgent` (with optional undelivered filter), `markDelivered`, `markAllDelivered`, `countUndelivered`

### 3. ✅ OpenClaw Service
- **`lib/openclaw.ts`:** TypeScript module wrapping OpenClaw CLI with proper types
  - `sessionsSpawn()` — spawn sub-agent sessions
  - `sessionsSend()` — send messages to existing sessions
  - `sessionsList()` — list active sessions
- Full type definitions for `SessionRow`, `SessionSpawnParams`, `SessionSendParams`, etc.
- Server-side only (dynamic import of `child_process`)

### 4. ✅ "Process Task" Button
- **`components/task-card.tsx`:** "🤖 Process Task" button appears on hover for non-done tasks
- **`app/api/process-task/route.ts`:** POST endpoint that spawns a sub-agent via OpenClaw with the task title + description as the prompt
- Shows spawned session key or error inline on the card

### 5. ✅ @Mention Support
- **`convex/messages.ts`:** `create` mutation now parses `@AgentName` from message content using regex
- Automatically creates notification records for mentioned agents by matching against agent names (case-insensitive)
- **`app/tasks/page.tsx`:** `MentionText` component renders @mentions in emerald green within the task detail panel

### 6. ✅ UI Polish
- **Warm editorial aesthetic** with zinc/emerald/amber palette
- **`components/sidebar.tsx`:** Cleaner branding, "BagBros" with emerald accent, version footer
- **`components/task-board.tsx`:** Color-coded column headers (📥 Inbox, 👤 Assigned, ⚡ In Progress, 🔍 Review, ✅ Done), rounded corners, drop zones
- **`components/task-card.tsx`:** Compact card design with priority dots, tag pills, hover-reveal actions
- **`components/agent-card.tsx`:** Shows status dot (pulsing for active/busy), model, session key, stale indicator (>30min), capability chips
- **`app/page.tsx`:** Dashboard with stats summary, max-width container
- **`app/agents/page.tsx`:** Agent count, cleaner layout, hides empty activity sections

### 7. ✅ Agent Heartbeat Tracking
- **`convex/schema.ts`:** Added `currentModel` (optional string) and `sessionKey` (optional string) to agents table
- **`convex/agents.ts`:** New `heartbeat` mutation for updating `lastHeartbeat`, `currentModel`, `sessionKey`, `currentTaskId`
- **`convex/agents.ts`:** New `getByName` query for @mention resolution
- **`components/agent-card.tsx`:** Displays model (🧠), session key (🔑), stale heartbeat warning

## Other Fixes
- **`lib/utils.ts`:** Added `formatRelativeTime()` and `formatDateTime()` helpers
- **`convex/documents.ts`:** Fixed broken `.any()` array filter (Convex doesn't support it)
- **`convex/convex.config.ts`:** Fixed `defineApp()` call (was passing unsupported args)
- **`components/activity-feed.tsx`:** Fixed null vs undefined type mismatch for agent/task fields
- **`app/tasks/[id]/page.tsx`:** Rewrote to match current schema (was referencing non-existent `assigneeIds` field)

## Files Modified
```
convex/schema.ts          — notifications table, agent fields, 5 statuses
convex/tasks.ts           — 5-status support, auto-assign transition
convex/agents.ts          — heartbeat mutation, getByName query
convex/messages.ts        — @mention parsing + notification creation
convex/notifications.ts   — NEW: full notification CRUD
convex/documents.ts       — fixed array filter bug
convex/convex.config.ts   — fixed defineApp call
lib/utils.ts              — added formatRelativeTime, formatDateTime
lib/openclaw.ts           — NEW: OpenClaw CLI wrapper
app/api/process-task/     — NEW: POST endpoint for sub-agent spawning
app/page.tsx              — polished dashboard
app/tasks/page.tsx        — board/list views, 5 statuses, @mention rendering
app/tasks/[id]/page.tsx   — rewritten for current schema
app/agents/page.tsx       — polished layout
components/task-board.tsx  — 5-column kanban with drag-drop
components/task-card.tsx   — process task button, compact design
components/agent-card.tsx  — heartbeat/model/session display
components/sidebar.tsx     — polished branding
components/activity-feed.tsx — type fix
components/create-task-dialog.tsx — type fix
```
