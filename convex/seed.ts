import { mutation } from "./_generated/server";

// Seed initial data for the BagBros Mission Control
export default mutation({
  args: {},
  handler: async (ctx) => {
    // Check if agents already exist
    const existingAgents = await ctx.db.query("agents").take(1);
    if (existingAgents.length > 0) {
      throw new Error("Database already seeded");
    }
    
    const now = Date.now();
    
    // Create BagBot agent
    await ctx.db.insert("agents", {
      name: "BagBot",
      emoji: "💼",
      status: "active",
      currentTaskId: undefined,
      lastHeartbeat: now,
      capabilities: ["system_management", "file_operations", "windows_commands", "browser_automation"],
      currentModel: "claude-opus-4-5",
      sessionKey: "agent:main:main",
    });
    
    // Create MacBag agent
    await ctx.db.insert("agents", {
      name: "MacBag",
      emoji: "🧠",
      status: "idle",
      currentTaskId: undefined,
      lastHeartbeat: now,
      capabilities: ["creative_tasks", "macos_commands", "research", "imessage_relay"],
      currentModel: "claude-sonnet-4",
      sessionKey: "agent:macbag:main",
    });
    
    // Create WinBag agent
    await ctx.db.insert("agents", {
      name: "WinBag",
      emoji: "🪟",
      status: "idle",
      currentTaskId: undefined,
      lastHeartbeat: now,
      capabilities: ["virtualization", "testing", "windows_dev"],
      sessionKey: "agent:winbag:main",
    });

    // Create Jarvis agent (Squad Lead - from viral article pattern)
    await ctx.db.insert("agents", {
      name: "Jarvis",
      emoji: "🤖",
      status: "idle",
      currentTaskId: undefined,
      lastHeartbeat: now,
      capabilities: ["coordination", "delegation", "monitoring", "task_management"],
      currentModel: "claude-opus-4-5",
      sessionKey: "agent:jarvis:main",
    });

    // Create Friday agent (Developer)
    await ctx.db.insert("agents", {
      name: "Friday",
      emoji: "💻",
      status: "idle",
      currentTaskId: undefined,
      lastHeartbeat: now,
      capabilities: ["coding", "debugging", "code_review", "testing"],
      currentModel: "claude-sonnet-4",
      sessionKey: "agent:developer:main",
    });

    // Create Fury agent (Researcher)
    await ctx.db.insert("agents", {
      name: "Fury",
      emoji: "🔍",
      status: "idle",
      currentTaskId: undefined,
      lastHeartbeat: now,
      capabilities: ["research", "analysis", "competitive_intel", "data_gathering"],
      currentModel: "claude-sonnet-4",
      sessionKey: "agent:researcher:main",
    });
    
    // Create sample tasks
    await ctx.db.insert("tasks", {
      title: "Build Mission Control v2",
      description: "Upgrade Mission Control with 5-column Kanban, @mentions, agent heartbeats, and OpenClaw integration",
      status: "done",
      priority: "urgent",
      createdAt: now - 3600000,
      updatedAt: now,
      tags: ["engineering", "priority"],
    });

    await ctx.db.insert("tasks", {
      title: "Deploy to test.theaicouncil.io",
      description: "Set up Railway deployment for Mission Control and configure subdomain",
      status: "in_progress",
      priority: "high",
      createdAt: now,
      updatedAt: now,
      tags: ["devops", "deployment"],
    });

    await ctx.db.insert("tasks", {
      title: "Integrate Council agents",
      description: "Import the 57 specialist agents from The Council into Mission Control as assignable agents",
      status: "inbox",
      priority: "medium",
      createdAt: now,
      updatedAt: now,
      tags: ["integration", "agents"],
    });

    await ctx.db.insert("tasks", {
      title: "Add daily standup cron",
      description: "Create a cron job that compiles agent activity into a daily standup summary sent to Telegram",
      status: "inbox",
      priority: "medium",
      createdAt: now,
      updatedAt: now,
      tags: ["automation", "reporting"],
    });

    // Create a welcome activity
    await ctx.db.insert("activities", {
      type: "system",
      message: "🚀 BagBros Mission Control v2 initialized with 6 agents — let's secure some bags!",
      timestamp: now,
    });
    
    return { success: true, message: "Database seeded successfully" };
  },
});