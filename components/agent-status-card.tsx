"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { Clock, Zap, AlertCircle } from "lucide-react";

interface Agent {
  _id: string;
  name: string;
  role: string;
  status: "idle" | "active" | "blocked";
  emoji: string;
  sessionKey: string;
  currentTaskId?: string;
  lastHeartbeat: number;
}

interface AgentStatusCardProps {
  agent: Agent;
}

export function AgentStatusCard({ agent }: AgentStatusCardProps) {
  const getStatusIcon = () => {
    switch (agent.status) {
      case "active":
        return <Zap className="h-4 w-4 text-emerald-400" />;
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (agent.status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";
      case "blocked":
        return "bg-red-500/10 text-red-400 ring-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 ring-slate-500/20";
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-2xl">{agent.emoji}</span>
            <span className="text-slate-200">{agent.name}</span>
          </span>
          <Badge className={`status-badge ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-1">{agent.status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-400">{agent.role}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-slate-400">
              Last seen {formatRelativeTime(agent.lastHeartbeat)}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Session: {agent.sessionKey}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}