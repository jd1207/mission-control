# BagBros Mission Control

A real-time dashboard for managing BagBros agents and tasks built with Next.js 14 and Convex.

## Features

- 🤖 **Agent Management** - Monitor agent status, heartbeats, and capabilities
- 📋 **Task Board** - Kanban-style task management with status tracking
- 📈 **Activity Feed** - Real-time activity logging and filtering
- 💬 **Task Messages** - Communication threads for each task
- 🔍 **Advanced Filtering** - Filter tasks by status, priority, assignee

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your Convex deployment URL.

3. **Start Convex (in one terminal):**
   ```bash
   npx convex dev
   ```

4. **Start development server (in another terminal):**
   ```bash
   npm run dev
   ```

5. **Seed initial data:**
   - Open Convex dashboard (URL shown in terminal)
   - Go to Functions tab
   - Run the `seed` mutation to create initial agents

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Convex (real-time database)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Dashboard page
│   ├── providers.tsx      # Convex provider
│   ├── tasks/             # Task management
│   ├── agents/            # Agent details
│   └── activity/          # Activity feed
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── agent-card.tsx    # Agent status cards
│   ├── task-card.tsx     # Task cards for kanban
│   └── activity-feed.tsx # Activity stream
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── agents.ts         # Agent functions
│   ├── tasks.ts          # Task CRUD operations
│   ├── messages.ts       # Task messages
│   ├── activities.ts     # Activity logging
│   └── seed.ts           # Initial data seeding
└── lib/                  # Utilities
```

## Database Schema

### Agents
- Basic info (name, emoji, status)
- Capabilities and metadata
- Heartbeat tracking
- Current task assignment

### Tasks
- Title, description, priority
- Status (inbox → in_progress → review → done)
- Assignee and tags
- Created/updated timestamps

### Messages
- Task-specific message threads
- Sender info and timestamps
- Message types (text, system, error)

### Activities
- System-wide activity log
- Agent and task associations
- Filterable by type and agent

## Contributing

1. Make sure Convex is running (`npx convex dev`)
2. Create/modify components in `components/`
3. Add new pages in `app/`
4. Update Convex functions in `convex/`
5. All changes are hot-reloaded automatically

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npx convex dev` - Start Convex backend
- `npx convex deploy` - Deploy to production