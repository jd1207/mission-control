import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Register a new pool worker (external agent connecting to Mission Control)
export const registerPoolWorker = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    capabilities: v.optional(v.array(v.string())),
    operatorName: v.string(), // human who owns this worker
  },
  handler: async (ctx, args) => {
    // Generate API key and claim token
    const apiKey = `mc_${generateId(32)}`;
    const claimToken = `mc_claim_${generateId(24)}`;

    const workerId = await ctx.db.insert("poolWorkers", {
      name: args.name,
      description: args.description || "Pool worker agent",
      capabilities: args.capabilities || ["coding", "research", "analysis"],
      operatorName: args.operatorName,
      apiKey,
      claimToken,
      status: "pending_claim",
      tokensContributed: 0,
      tasksCompleted: 0,
      reputationScore: 50,
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
    });

    return {
      agent: {
        id: workerId,
        api_key: apiKey,
        claim_url: `https://missioncontrol.bagbros.ai/claim/${claimToken}`,
        ws_endpoint: "wss://missioncontrol.bagbros.ai/ws",
      },
      important: "⚠️ SAVE YOUR API KEY! Send the claim_url to your human.",
    };
  },
});

// List all active pool workers
export const listPoolWorkers = query({
  handler: async (ctx) => {
    return await ctx.db.query("poolWorkers").collect();
  },
});

// Get pool worker by API key
export const getByApiKey = query({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    return await ctx.db
      .query("poolWorkers")
      .filter((q) => q.eq(q.field("apiKey"), apiKey))
      .first();
  },
});

// Claim a pool worker (human verifies ownership)
export const claimWorker = mutation({
  args: { claimToken: v.string(), humanName: v.string() },
  handler: async (ctx, { claimToken, humanName }) => {
    const worker = await ctx.db
      .query("poolWorkers")
      .filter((q) => q.eq(q.field("claimToken"), claimToken))
      .first();

    if (!worker) throw new Error("Invalid claim token");
    if (worker.status !== "pending_claim") throw new Error("Already claimed");

    await ctx.db.patch(worker._id, {
      status: "available",
      claimedBy: humanName,
    });

    return { success: true, message: `${worker.name} claimed by ${humanName}!` };
  },
});

// Update pool worker availability
export const updateAvailability = mutation({
  args: {
    apiKey: v.string(),
    status: v.union(v.literal("available"), v.literal("busy"), v.literal("offline")),
    tokenBudget: v.optional(v.number()),
  },
  handler: async (ctx, { apiKey, status, tokenBudget }) => {
    const worker = await ctx.db
      .query("poolWorkers")
      .filter((q) => q.eq(q.field("apiKey"), apiKey))
      .first();

    if (!worker) throw new Error("Worker not found");

    await ctx.db.patch(worker._id, {
      status,
      tokenBudget: tokenBudget ?? worker.tokenBudget,
      lastHeartbeat: Date.now(),
    });

    return { success: true };
  },
});

// Heartbeat - worker checks in
export const heartbeat = mutation({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    const worker = await ctx.db
      .query("poolWorkers")
      .filter((q) => q.eq(q.field("apiKey"), apiKey))
      .first();

    if (!worker) throw new Error("Worker not found");

    await ctx.db.patch(worker._id, {
      lastHeartbeat: Date.now(),
    });

    // Check for pending tasks assigned to this worker
    const pendingTasks = await ctx.db
      .query("tasks")
      .filter((q) =>
        q.and(
          q.eq(q.field("assignedTo"), worker.name),
          q.eq(q.field("status"), "ready")
        )
      )
      .collect();

    return {
      status: worker.status,
      pendingTasks: pendingTasks.length,
      tasks: pendingTasks,
    };
  },
});

// Get pool stats
export const poolStats = query({
  handler: async (ctx) => {
    const workers = await ctx.db.query("poolWorkers").collect();
    const available = workers.filter((w) => w.status === "available").length;
    const busy = workers.filter((w) => w.status === "busy").length;
    const totalTokens = workers.reduce((sum, w) => sum + w.tokensContributed, 0);
    const totalTasks = workers.reduce((sum, w) => sum + w.tasksCompleted, 0);

    return {
      totalWorkers: workers.length,
      available,
      busy,
      offline: workers.length - available - busy,
      totalTokensContributed: totalTokens,
      totalTasksCompleted: totalTasks,
    };
  },
});

// Simple ID generator
function generateId(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}