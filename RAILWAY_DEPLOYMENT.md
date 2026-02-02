# Railway Deployment Guide — Mission Control

## Prerequisites
- Railway account with a project
- GitHub repo: `natebag/mission-control`
- Convex deployment: `famous-parakeet-451`

## Step 1: Create Railway Service
1. Go to [railway.app](https://railway.app) → your project
2. Click **"+ New"** → **"GitHub Repo"**
3. Select `natebag/mission-control`
4. Railway will auto-detect Node.js

## Step 2: Set Environment Variables
In the Railway service settings → **Variables**, add:

```
NEXT_PUBLIC_CONVEX_URL=https://famous-parakeet-451.convex.cloud
CONVEX_DEPLOYMENT=dev:famous-parakeet-451
PORT=3000
```

**Important:** Do NOT set `RAILWAY_ENVIRONMENT` — it's auto-set by Railway.

## Step 3: Build Settings
The `package.json` build script handles Railway automatically:
- On Railway (`$RAILWAY_ENVIRONMENT` set): skips `convex codegen`, uses pre-committed generated files
- Locally: runs `convex codegen` then `next build`

No custom build command needed.

## Step 4: Deploy
Railway auto-deploys on push to `main`. Or trigger manually from the dashboard.

## Step 5: Custom Domain (Optional)
1. In Railway → **Settings** → **Networking** → **Custom Domain**
2. Add: `test.theaicouncil.io` (or your preferred subdomain)
3. Update DNS: CNAME record pointing to Railway's provided domain

## Current Status
- ✅ Build passes locally (`next build`)
- ✅ Convex generated files committed (no auth needed in CI)
- ✅ GitHub repo up to date
- ✅ `railway.yaml` configured with env vars
- ⏳ Railway service needs to be created

## Architecture
```
Browser → Next.js (Railway) → Convex Cloud (famous-parakeet-451)
                              ↓
                        Real-time DB (agents, tasks, messages, activities)
```

## Features (v2.2)
- 5-column Kanban board with drag-and-drop
- Task CRUD with delete cascade
- Bulk operations (multi-select → delete or status change)
- Agent cards with heartbeat tracking
- Task comments with @mention support
- Process Task → spawns OpenClaw sub-agent
- Activity feed with filtering
- Board + List views
- Dark theme throughout
