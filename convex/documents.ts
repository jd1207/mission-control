import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new document
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("note"), v.literal("code"), v.literal("config"), v.literal("other")),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      type: args.type,
      tags: args.tags || [],
      createdAt: now,
      updatedAt: now,
      metadata: args.metadata,
    });
    
    // Create activity
    await ctx.db.insert("activities", {
      type: "document_created",
      message: `Document "${args.title}" created`,
      timestamp: now,
    });
    
    return documentId;
  },
});

// Get a document
export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List documents
export const list = query({
  args: {
    type: v.optional(v.union(v.literal("note"), v.literal("code"), v.literal("config"), v.literal("other"))),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("documents");
    
    if (args.type) {
      query = query.filter(q => q.eq(q.field("type"), args.type));
    }
    // Note: Convex doesn't support array member filtering natively in filters.
    // Filter in JS after fetch if needed. Skipping tag filter at DB level.
    
    return await query.order("desc").take(args.limit || 100);
  },
});

// Update a document
export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.optional(v.union(v.literal("note"), v.literal("code"), v.literal("config"), v.literal("other"))),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document not found");
    
    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.type !== undefined) updates.type = args.type;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.metadata !== undefined) updates.metadata = args.metadata;
    
    await ctx.db.patch(args.id, updates);
    
    // Create activity
    await ctx.db.insert("activities", {
      type: "document_updated",
      message: `Document "${document.title}" updated`,
      timestamp: Date.now(),
    });
    
    return args.id;
  },
});

// Delete a document
export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("Document not found");
    
    await ctx.db.delete(args.id);
    
    // Create activity
    await ctx.db.insert("activities", {
      type: "document_deleted",
      message: `Document "${document.title}" deleted`,
      timestamp: Date.now(),
    });
    
    return args.id;
  },
});