"use client";

interface Activity {
  _id: string;
  type: string;
  message: string;
  timestamp: number;
  agent?: {
    id: string;
    name: string;
    emoji: string;
  } | null;
  task?: {
    id: string;
    title: string;
  } | null;
}

interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
}

export function ActivityFeed({ activities, limit }: ActivityFeedProps) {
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 5) return `${seconds}s ago`;
    return "just now";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return "➕";
      case "task_updated":
        return "📝";
      case "task_status_changed":
        return "🔄";
      case "task_assigned":
        return "👤";
      case "message_sent":
        return "💬";
      case "document_created":
        return "📄";
      case "document_updated":
        return "📝";
      case "document_deleted":
        return "🗑️";
      case "system":
        return "⚙️";
      default:
        return "📋";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task_created":
      case "document_created":
        return "text-emerald-500";
      case "task_updated":
      case "document_updated":
        return "text-blue-500";
      case "task_status_changed":
        return "text-amber-500";
      case "task_assigned":
        return "text-purple-500";
      case "message_sent":
        return "text-cyan-500";
      case "document_deleted":
        return "text-red-500";
      case "system":
        return "text-zinc-400";
      default:
        return "text-zinc-300";
    }
  };

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <div key={activity._id} className="flex items-start space-x-3 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
          <div className={`text-lg ${getTypeColor(activity.type)}`}>
            {getTypeIcon(activity.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-200">{activity.message}</p>
              <time className="text-xs text-zinc-500">
                {formatTimeAgo(activity.timestamp)}
              </time>
            </div>
            
            <div className="flex items-center gap-4 mt-1">
              {activity.agent && (
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <span>{activity.agent.emoji}</span>
                  {activity.agent.name}
                </span>
              )}
              {activity.task && (
                <span className="text-xs text-zinc-400">
                  Task: {activity.task.title}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {displayActivities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-zinc-500">No activities yet</p>
        </div>
      )}
    </div>
  );
}