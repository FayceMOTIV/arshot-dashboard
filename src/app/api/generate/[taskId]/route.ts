import { NextRequest, NextResponse } from "next/server";

const FAL_KEY = process.env.FAL_API_KEY;
const FAL_QUEUE_BASE = "https://queue.fal.run/fal-ai/trellis";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  if (!FAL_KEY) {
    return NextResponse.json({ error: "FAL_API_KEY not configured" }, { status: 503 });
  }

  const headers = { Authorization: `Key ${FAL_KEY}` };

  // 1. Check status
  const statusResp = await fetch(
    `${FAL_QUEUE_BASE}/requests/${taskId}/status`,
    { headers, cache: "no-store" }
  );

  if (!statusResp.ok) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const statusData = await statusResp.json() as { status: string; error?: string };

  if (statusData.status === "FAILED") {
    return NextResponse.json({
      status: "FAILED",
      progress: 0,
      glbUrl: null,
      usdzUrl: null,
      thumbnailUrl: null,
    });
  }

  if (statusData.status !== "COMPLETED") {
    // IN_QUEUE or IN_PROGRESS
    const progress = statusData.status === "IN_PROGRESS" ? 50 : 10;
    return NextResponse.json({
      status: "IN_PROGRESS",
      progress,
      glbUrl: null,
      usdzUrl: null,
      thumbnailUrl: null,
    });
  }

  // 2. COMPLETED — fetch the result
  const resultResp = await fetch(
    `${FAL_QUEUE_BASE}/requests/${taskId}`,
    { headers, cache: "no-store" }
  );

  if (!resultResp.ok) {
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 });
  }

  const result = await resultResp.json() as {
    model_mesh?: { url?: string };
    video?: { url?: string };
  };

  const glbUrl = result.model_mesh?.url ?? null;

  return NextResponse.json({
    status: "SUCCEEDED",
    progress: 100,
    glbUrl,
    usdzUrl: null,
    thumbnailUrl: result.video?.url ?? null,
  });
}
