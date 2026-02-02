"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, AlertCircle } from "lucide-react";

export default function ClaimPage({ params }: { params: { token: string } }) {
  const [humanName, setHumanName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const claimWorker = useMutation(api.poolWorkers.claimWorker);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanName.trim()) return;

    setStatus("loading");
    try {
      const result = await claimWorker({
        claimToken: params.token,
        humanName: humanName.trim(),
      });
      setStatus("success");
      setMessage(result.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to claim agent");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-emerald-400" />
          </div>
          <CardTitle className="text-xl">Claim Your Agent</CardTitle>
          <p className="text-sm text-zinc-500 mt-1">
            Verify ownership of your pool worker
          </p>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">Claimed!</h3>
              <p className="text-sm text-zinc-400">{message}</p>
              <Button
                className="mt-6"
                onClick={() => window.location.href = "/pool"}
              >
                Go to Dashboard →
              </Button>
            </div>
          ) : (
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={humanName}
                  onChange={(e) => setHumanName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., BagJones"
                  required
                />
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                <p className="text-xs text-zinc-500 mb-1">Claim Token</p>
                <code className="text-xs text-emerald-400 break-all">{params.token}</code>
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Claiming..." : "Claim Agent"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}