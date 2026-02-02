import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new message — with @mention parsing
export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("system"), v.literal("error")),
    senderId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      taskId: args.taskId,
      content: args.content,
      type: args.type,
      senderId: args.senderId,
      timestamp: Date.now(),
    });

    // Update task's updatedAt
    await ctx.db.patch(args.taskId, { updatedAt: Date.now() });

    // Parse @mentions and create notifications
    const mentionRegex = /@(\w+)/g;
    let match;
    const mentionedNames: string[] = [];
    while ((match = mentionRegex.exec(args.content)) !== null) {
      mentionedNames.push(match[1]);
    }

    if (mentionedNames.length > 0) {
      const allAgents = await ctx.db.query("agents").collect();
      for (const name of mentionedNames) {
        const agent = allAgents.find(
          (a) => a.name.toLowerCase() === name.toLowerCase()
        );
        if (agent) {
          await ctx.db.insert("notifications", {
            mentionedAgentId: agent._id,
            fromAgentId: args.senderId,
            taskId: args.taskId,
            content: args.content,
            delivered: false,
            timestamp: Date.now(),
          });
        }
      }
    }

    // Create activity if it's not a system message
    if (args.type !== "system") {
      const sender = args.senderId ? await ctx.db.get(args.senderId) : null;
      const senderName = sender ? sender.name : "Unknown";

      await ctx.db.insert("activities", {
        type: "message_sent",
        taskId: args.taskId,
        agentId: args.senderId || undefined,
        message: `${senderName}: ${args.content}`,
        timestamp: Date.now(),
      });
    }

    return messageId;
  },
});

// List messages by task
export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .order("asc")
      .take(1000);

    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = message.senderId ? await ctx.db.get(message.senderId) : null;
        return {
          ...message,
          sender: sender ? { id: sender._id, name: sender.name, emoji: sender.emoji } : null,
        };
      })
    );

    return messagesWithSenders;
  },
});
