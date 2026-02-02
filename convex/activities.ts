import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new activity
export const create = mutation({
  args: {
    type: v.string(),
    message: v.string(),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("activities", {
      type: args.type,
      message: args.message,
      agentId: args.agentId,
      taskId: args.taskId,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
    
    return activityId;
  },
});

// List recent activities (last 50)
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .take(args.limit || 50);
    
    // Get related agent and task details
    const activitiesWithDetails = await Promise.all(
      activities.map(async (activity) => {
        const agent = activity.agentId ? await ctx.db.get(activity.agentId) : null;
        const task = activity.taskId ? await ctx.db.get(activity.taskId) : null;
        
        return {
          ...activity,
          agent: agent ? { id: agent._id, name: agent.name, emoji: agent.emoji } : null,
          task: task ? { id: task._id, title: task.title } : null,
        };
      })
    );
    
    return activitiesWithDetails;
  },
});

// List activities by agent
export const listByAgent = query({
  args: { agentId: v.id("agents"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .filter(q => q.eq(q.field("agentId"), args.agentId))
      .order("desc")
      .take(args.limit || 100);
    
    // Get related task details
    const activitiesWithTasks = await Promise.all(
      activities.map(async (activity) => {
        const task = activity.taskId ? await ctx.db.get(activity.taskId) : null;
        
        return {
          ...activity,
          task: task ? { id: task._id, title: task.title } : null,
        };
      })
    );
    
    return activitiesWithTasks;
  },
});