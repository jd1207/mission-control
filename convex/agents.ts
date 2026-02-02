import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get agent by name (for @mention resolution)
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.find(
      (a) => a.name.toLowerCase() === args.name.toLowerCase()
    ) ?? null;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("busy"), v.literal("error")),
    currentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      currentTaskId: args.currentTaskId,
      lastHeartbeat: Date.now(),
    });

    await ctx.db.insert("activities", {
      type: "agent_status_changed",
      agentId: args.id,
      message: `${agent.name} changed status to ${args.status}`,
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// v2: Heartbeat — update agent's heartbeat timestamp + optional model/session info
export const heartbeat = mutation({
  args: {
    id: v.id("agents"),
    currentModel: v.optional(v.string()),
    sessionKey: v.optional(v.string()),
    currentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    const updates: Record<string, unknown> = {
      lastHeartbeat: Date.now(),
    };
    if (args.currentModel !== undefined) updates.currentModel = args.currentModel;
    if (args.sessionKey !== undefined) updates.sessionKey = args.sessionKey;
    if (args.currentTaskId !== undefined) updates.currentTaskId = args.currentTaskId;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});
