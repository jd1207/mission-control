"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/activity-feed";

export default function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [limit, setLimit] = useState(50);

  const agents = useQuery(api.agents.list);
  const activities = useQuery(api.activities.listRecent, { limit });

  // Filter activities based on selected filters
  const filteredActivities = activities?.filter((activity) => {
    if (typeFilter !== "all" && activity.type !== typeFilter) return false;
    if (agentFilter !== "all" && activity.agentId !== agentFilter) return false;
    return true;
  });

  // Get unique activity types for filter
  const activityTypes = Array.from(
    new Set(activities?.map((activity) => activity.type) || [])
  ).sort();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Activity Feed</h1>
        <p className="text-zinc-400">Complete activity log for all agents and tasks</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter activities by type, agent, or time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">Activity Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100"
              >
                <option value="all">All Types</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">Agent</label>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100"
              >
                <option value="all">All Agents</option>
                {agents?.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.emoji} {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100"
              >
                <option value={25}>Last 25</option>
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={200}>Last 200</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {filteredActivities?.length || 0}
            </div>
            <p className="text-xs text-zinc-500">
              of {activities?.length || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {new Set(filteredActivities?.filter(a => a.agentId).map(a => a.agentId)).size}
            </div>
            <p className="text-xs text-zinc-500">
              agents with activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {new Set(filteredActivities?.map(a => a.type)).size}
            </div>
            <p className="text-xs text-zinc-500">
              different types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Stream</CardTitle>
          <CardDescription>
            {filteredActivities?.length === activities?.length
              ? `Showing all ${activities?.length || 0} activities`
              : `Showing ${filteredActivities?.length || 0} of ${activities?.length || 0} activities`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities ? (
            <ActivityFeed activities={filteredActivities} />
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-zinc-500">Loading activities...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}