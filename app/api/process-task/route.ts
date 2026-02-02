import { NextRequest, NextResponse } from "next/server";
import { sessionsSpawn } from "@/lib/openclaw";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskTitle, taskDescription, taskId } = body;

    if (!taskTitle || !taskDescription) {
      return NextResponse.json({ error: "Missing task title or description" }, { status: 400 });
    }

    const prompt = [
      `## Task: ${taskTitle}`,
      "",
      taskDescription,
      "",
      `Task ID: ${taskId}`,
      "",
      "Process this task and report back with your findings or completed work.",
    ].join("\n");

    const result = await sessionsSpawn({
      task: prompt,
      label: `task-${taskId}`,
      cleanup: "keep",
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Process task error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
