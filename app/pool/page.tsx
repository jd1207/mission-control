"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Users, Zap, Clock, Shield } from "lucide-react";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  available: { color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Available" },
  busy: { color: "text-amber-400", bg: "bg-amber-500/20", label: "Busy" },
  offline: { color: "text-zinc-500", bg: "bg-zinc-700/50", label: "Offline" },
  pending_claim: { color: "text-blue-400", bg: "bg-blue-500/20", label: "Pending Claim" },
};

export default function PoolPage() {
  const workers = useQuery(api.poolWorkers.listPoolWorkers);
  const stats = useQuery(api.poolWorkers.poolStats);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Pool Workers</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Connected operators contributing compute to the pool
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalWorkers ?? 0}</p>
                <p className="text-xs text-zinc-500">Total Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.available ?? 0}</p>
                <p className="text-xs text-zinc-500">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Cpu className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.busy ?? 0}</p>
                <p className="text-xs text-zinc-500">Busy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats?.totalTokensContributed
                    ? `${(stats.totalTokensContributed / 1000).toFixed(0)}k`
                    : "0"}
                </p>
                <p className="text-xs text-zinc-500">Tokens Contributed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worker List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workers?.map((worker) => {
          const status = statusConfig[worker.status] ?? statusConfig.offline;
          return (
            <Card key={worker._id} className="hover:border-zinc-700 transition">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    {worker.name}
                  </CardTitle>
                  <Badge className={`${status.bg} ${status.color} border-0`}>
                    {status.label}
                  </Badge>
                </div>
                <CardDescription>{worker.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Operator</span>
                    <span className="text-zinc-300">{worker.operatorName}</span>
                  </div>
                  {worker.claimedBy && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Claimed by</span>
                      <span className="text-zinc-300">{worker.claimedBy}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tasks Completed</span>
                    <span className="text-zinc-300">{worker.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tokens Contributed</span>
                    <span className="text-zinc-300">
                      {worker.tokensContributed > 0
                        ? `${(worker.tokensContributed / 1000).toFixed(0)}k`
                        : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Reputation</span>
                    <span className="text-zinc-300">{worker.reputationScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Last Heartbeat</span>
                    <span className="text-zinc-300 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(worker.lastHeartbeat)}
                    </span>
                  </div>
                  {/* Capabilities */}
                  <div className="pt-2 flex flex-wrap gap-1">
                    {worker.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-[10px]">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!workers || workers.length === 0) && (
          <div className="col-span-full flex flex-col items-center justify-center h-48 border border-dashed border-zinc-800 rounded-xl">
            <Cpu className="h-8 w-8 text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-600">No pool workers connected yet</p>
            <p className="text-xs text-zinc-700 mt-1">
              Visit <a href="/connect" className="text-emerald-400 hover:underline">/connect</a> to add one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}