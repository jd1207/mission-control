"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentCard } from "@/components/agent-card";
import { TaskBoard } from "@/components/task-board";
import { ActivityFeed } from "@/components/activity-feed";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { CreateAgentDialog } from "@/components/create-agent-dialog";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [deleteTask, setDeleteTask] = useState<{ _id: string; title: string } | null>(null);

  const agents = useQuery(api.agents.list);
  const tasksByStatus = useQuery(api.tasks.listByStatus);
  const activities = useQuery(api.activities.listRecent, { limit: 15 });

  // Count stats
  const totalTasks = tasksByStatus
    ? Object.values(tasksByStatus).reduce((sum: number, arr: unknown[]) => sum + arr.length, 0)
    : 0;
  const activeAgents = agents?.filter((a) => a.status === "active" || a.status === "busy").length ?? 0;

  return (
    <div className="p-4 pt-14 lg:pt-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
      {/* Dialogs */}
      <CreateTaskDialog isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} />
      <CreateAgentDialog isOpen={showCreateAgent} onClose={() => setShowCreateAgent(false)} />
      <DeleteTaskDialog
        task={deleteTask}
        open={!!deleteTask}
        onOpenChange={(open) => !open && setDeleteTask(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight"><span className="text-ember">Mission</span> <span className="text-orange-50">Control</span></h1>
          <p className="text-xs sm:text-sm text-orange-200/40 mt-1">
            {activeAgents} agent{activeAgents !== 1 ? "s" : ""} active · {totalTasks} task{totalTasks !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateAgent(true)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Agent
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateTask(true)}
            className="gap-1.5 bg-ember hover:bg-ember-glow text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Task
          </Button>
        </div>
      </div>

      {/* Agent Cards */}
      <section>
        <h2 className="text-sm font-semibold text-ember/70 uppercase tracking-wider mb-3">Agents</h2>
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
        <h2 className="text-sm font-semibold text-ember/70 uppercase tracking-wider mb-3">Task Board</h2>
        {tasksByStatus ? (
          <TaskBoard
            tasksByStatus={tasksByStatus}
            onTaskDelete={(task) => setDeleteTask(task)}
          />
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
