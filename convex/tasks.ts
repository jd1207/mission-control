import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const taskStatusValidator = v.union(
  v.literal("inbox"),
  v.literal("assigned"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("done")
);

// List all tasks
export const list = query({
  args: {
    status: v.optional(taskStatusValidator),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    assigneeId: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("tasks");

    if (args.status) {
      q = q.filter((qb) => qb.eq(qb.field("status"), args.status));
    }
    if (args.priority) {
      q = q.filter((qb) => qb.eq(qb.field("priority"), args.priority));
    }
    if (args.assigneeId) {
      q = q.filter((qb) => qb.eq(qb.field("assigneeId"), args.assigneeId));
    }

    const tasks = await q.order("desc").take(args.limit || 100);

    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId) : null;
        return {
          ...task,
          assignee: assignee ? { id: assignee._id, name: assignee.name, emoji: assignee.emoji } : null,
        };
      })
    );

    return tasksWithAssignees;
  },
});

// Get a single task
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return null;

    const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId) : null;
    return {
      ...task,
      assignee: assignee ? { id: assignee._id, name: assignee.name, emoji: assignee.emoji } : null,
    };
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    assigneeId: v.optional(v.id("agents")),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.assigneeId ? "assigned" : "inbox",
      priority: args.priority,
      assigneeId: args.assigneeId,
      createdAt: now,
      updatedAt: now,
      dueDate: args.dueDate,
      tags: args.tags || [],
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      taskId,
      message: `Task "${args.title}" created`,
      timestamp: now,
    });

    return taskId;
  },
});

// Update task details
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.id, updates);

    await ctx.db.insert("activities", {
      type: "task_updated",
      taskId: args.id,
      message: `Task "${task.title}" updated`,
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Update task status
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: taskStatusValidator,
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activities", {
      type: "task_status_changed",
      taskId: args.id,
      message: `Task "${task.title}" moved to ${args.status.replace("_", " ")}`,
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Assign task to agent
export const assign = mutation({
  args: {
    id: v.id("tasks"),
    assigneeId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    const assignee = args.assigneeId ? await ctx.db.get(args.assigneeId) : null;

    const updates: Record<string, unknown> = {
      assigneeId: args.assigneeId,
      updatedAt: Date.now(),
    };
    // Auto-transition inbox → assigned when assigning
    if (args.assigneeId && task.status === "inbox") {
      updates.status = "assigned";
    }

    await ctx.db.patch(args.id, updates);

    const assigneeName = assignee ? assignee.name : "Unassigned";
    await ctx.db.insert("activities", {
      type: "task_assigned",
      taskId: args.id,
      agentId: args.assigneeId || undefined,
      message: `Task "${task.title}" assigned to ${assigneeName}`,
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// List tasks by status (for kanban board) — now with 5 columns
export const listByStatus = query({
  args: {},
  handler: async (ctx) => {
    const statuses = ["inbox", "assigned", "in_progress", "review", "done"] as const;
    const result: Record<string, Array<Record<string, unknown>>> = {};

    for (const status of statuses) {
      const tasks = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("status"), status))
        .order("desc")
        .take(100);

      const tasksWithAssignees = await Promise.all(
        tasks.map(async (task) => {
          const assignee = task.assigneeId ? await ctx.db.get(task.assigneeId) : null;
          return {
            ...task,
            assignee: assignee ? { id: assignee._id, name: assignee.name, emoji: assignee.emoji } : null,
          };
        })
      );

      result[status] = tasksWithAssignees;
    }

    return result;
  },
});
