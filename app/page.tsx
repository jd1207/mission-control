"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentCard } from "@/components/agent-card";
import { TaskBoard } from "@/components/task-board";
import { ActivityFeed } from "@/components/activity-feed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const agents = useQuery(api.agents.list);
  const tasksByStatus = useQuery(api.tasks.listByStatus);
  const activities = useQuery(api.activities.listRecent, { limit: 15 });

  // Count stats
  const totalTasks = tasksByStatus
    ? Object.values(tasksByStatus).reduce((sum: number, arr: unknown[]) => sum + arr.length, 0)
    : 0;
  const activeAgents = agents?.filter((a) => a.status === "active" || a.status === "busy").length ?? 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Mission Control</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {activeAgents} agent{activeAgents !== 1 ? "s" : ""} active · {totalTasks} task{totalTasks !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {/* Agent Cards */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents?.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              currentTask={agent.currentTaskId ? { title: "Loading..." } : undefined}
            />
          ))}
          {!agents && (
            <div className="col-span-full flex items-center justify-center h-32 text-zinc-600">
              Loading agents…
            </div>
          )}
        </div>
      </section>

      {/* Task Board */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Task Board</h2>
        {tasksByStatus ? (
          <TaskBoard tasksByStatus={tasksByStatus} />
        ) : (
          <div className="flex items-center justify-center h-48 text-zinc-600">Loading tasks…</div>
        )}
      </section>

      {/* Activity Feed */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest events across all agents</CardDescription>
          </CardHeader>
          <CardContent>
            {activities ? (
              <ActivityFeed activities={activities} />
            ) : (
              <div className="flex items-center justify-center h-24 text-zinc-600">
                Loading…
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
