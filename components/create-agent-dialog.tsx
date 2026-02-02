"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface CreateAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = ["🤖", "🧠", "⚡", "🔧", "🎨", "📊", "🛡️", "🔍", "💻", "🚀", "🦾", "👾", "🎯", "📡", "🏗️"];

const CAPABILITY_OPTIONS = [
  "coding", "frontend", "backend", "api", "database",
  "research", "analysis", "testing", "devops", "security",
  "design", "documentation", "planning", "review", "debugging",
];

export function CreateAgentDialog({ isOpen, onClose }: CreateAgentDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤖");
  const [selectedCaps, setSelectedCaps] = useState<string[]>([]);
  const [customCap, setCustomCap] = useState("");

  const createAgent = useMutation(api.agents.create);

  const toggleCap = (cap: string) => {
    setSelectedCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const addCustomCap = () => {
    if (customCap.trim() && !selectedCaps.includes(customCap.trim())) {
      setSelectedCaps((prev) => [...prev, customCap.trim()]);
      setCustomCap("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createAgent({
        name: name.trim(),
        emoji,
        capabilities: selectedCaps.length > 0 ? selectedCaps : ["general"],
      });
      setName("");
      setEmoji("🤖");
      setSelectedCaps([]);
      onClose();
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Agent</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Frontend Agent"
                required
              />
            </div>

            {/* Emoji */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">Icon</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition ${
                      emoji === e
                        ? "bg-emerald-500/20 ring-2 ring-emerald-500"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Capabilities
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {CAPABILITY_OPTIONS.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCap(cap)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      selectedCaps.includes(cap)
                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCap}
                  onChange={(e) => setCustomCap(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCap())}
                  className="flex-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Add custom capability..."
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomCap}>
                  Add
                </Button>
              </div>
              {selectedCaps.length > 0 && (
                <p className="text-xs text-zinc-500 mt-1">
                  Selected: {selectedCaps.join(", ")}
                </p>
              )}
            </div>

            {/* Preview */}
            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
              <p className="text-xs text-zinc-500 mb-1">Preview</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{name || "Agent Name"}</p>
                  <p className="text-xs text-zinc-500">
                    {selectedCaps.length > 0 ? selectedCaps.join(" · ") : "No capabilities selected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Create Agent</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}