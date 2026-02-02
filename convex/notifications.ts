import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a notification (used by @mention parsing)
export const create = mutation({
  args: {
    mentionedAgentId: v.id("agents"),
    fromAgentId: v.optional(v.id("agents")),
    taskId: v.id("tasks"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      mentionedAgentId: args.mentionedAgentId,
      fromAgentId: args.fromAgentId,
      taskId: args.taskId,
      content: args.content,
      delivered: false,
      timestamp: Date.now(),
    });
  },
});

// List undelivered notifications for an agent
export const listForAgent = query({
  args: {
    agentId: v.id("agents"),
    onlyUndelivered: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("notifications")
      .withIndex("by_mentioned", (qb) => qb.eq("mentionedAgentId", args.agentId));

    if (args.onlyUndelivered) {
      q = q.filter((qb) => qb.eq(qb.field("delivered"), false));
    }

    const notifications = await q.order("desc").take(args.limit || 50);

    // Enrich with agent/task details
    return await Promise.all(
      notifications.map(async (n) => {
        const fromAgent = n.fromAgentId ? await ctx.db.get(n.fromAgentId) : null;
        const task = await ctx.db.get(n.taskId);
        return {
          ...n,
          fromAgent: fromAgent ? { id: fromAgent._id, name: fromAgent.name, emoji: fromAgent.emoji } : null,
          task: task ? { id: task._id, title: task.title } : null,
        };
      })
    );
  },
});

// Mark notification(s) as delivered
export const markDelivered = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { delivered: true });
  },
});

// Mark all notifications for an agent as delivered
export const markAllDelivered = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const undelivered = await ctx.db
      .query("notifications")
      .withIndex("by_mentioned_delivered", (qb) =>
        qb.eq("mentionedAgentId", args.agentId).eq("delivered", false)
      )
      .collect();

    for (const n of undelivered) {
      await ctx.db.patch(n._id, { delivered: true });
    }

    return undelivered.length;
  },
});

// Count undelivered notifications for an agent
export const countUndelivered = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const undelivered = await ctx.db
      .query("notifications")
      .withIndex("by_mentioned_delivered", (qb) =>
        qb.eq("mentionedAgentId", args.agentId).eq("delivered", false)
      )
      .collect();
    return undelivered.length;
  },
});
