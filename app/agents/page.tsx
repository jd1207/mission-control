"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentCard } from "@/components/agent-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/activity-feed";

export default function AgentsPage() {
  const agents = useQuery(api.agents.list);

  const activeCount = agents?.filter((a) => a.status === "active" || a.status === "busy").length ?? 0;
  const totalCount = agents?.length ?? 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Agents</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {activeCount} of {totalCount} agents active
        </p>
      </div>

      {/* Agent Grid */}
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

      {/* Agent Activity Sections */}
      {agents?.map((agent) => (
        <AgentActivitySection key={agent._id} agent={agent} />
      ))}
    </div>
  );
}

function AgentActivitySection({ agent }: { agent: any }) {
  const activities = useQuery(api.activities.listByAgent, {
    agentId: agent._id,
    limit: 8,
  });

  if (!activities || activities.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span>{agent.emoji}</span>
          {agent.name}
        </CardTitle>
        <CardDescription>Recent activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityFeed activities={activities} />
      </CardContent>
    </Card>
  );
}
