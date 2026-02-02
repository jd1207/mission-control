import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    emoji: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("busy"), v.literal("error")),
    currentTaskId: v.optional(v.id("tasks")),
    lastHeartbeat: v.number(),
    capabilities: v.array(v.string()),
    // v2: heartbeat tracking fields
    currentModel: v.optional(v.string()),
    sessionKey: v.optional(v.string()),
    metadata: v.optional(v.object({})),
  })
    .index("by_status", ["status"])
    .index("by_heartbeat", ["lastHeartbeat"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    assigneeId: v.optional(v.id("agents")),
    createdAt: v.number(),
    updatedAt: v.number(),
    dueDate: v.optional(v.number()),
    tags: v.array(v.string()),
    metadata: v.optional(v.object({})),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assigneeId"])
    .index("by_priority", ["priority"])
    .index("by_created", ["createdAt"]),

  messages: defineTable({
    taskId: v.id("tasks"),
    senderId: v.optional(v.id("agents")),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("system"), v.literal("error")),
    timestamp: v.number(),
    metadata: v.optional(v.object({})),
  })
    .index("by_task", ["taskId"])
    .index("by_timestamp", ["timestamp"]),

  activities: defineTable({
    type: v.string(),
    agentId: v.optional(v.id("agents")),
    taskId: v.optional(v.id("tasks")),
    message: v.string(),
    timestamp: v.number(),
    metadata: v.optional(v.object({})),
  })
    .index("by_agent", ["agentId"])
    .index("by_task", ["taskId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("note"), v.literal("code"), v.literal("config"), v.literal("other")),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    metadata: v.optional(v.object({})),
  })
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"])
    .index("by_tags", ["tags"]),

  // v2: Notifications table for @mentions
  notifications: defineTable({
    mentionedAgentId: v.id("agents"),
    fromAgentId: v.optional(v.id("agents")),
    taskId: v.id("tasks"),
    content: v.string(),
    delivered: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_mentioned", ["mentionedAgentId"])
    .index("by_delivered", ["delivered"])
    .index("by_mentioned_delivered", ["mentionedAgentId", "delivered"]),
});
