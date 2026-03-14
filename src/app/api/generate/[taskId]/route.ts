import { NextRequest, NextResponse } from "next/server";

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_BASE = "https://api.meshy.ai/openapi/v2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  if (!MESHY_API_KEY) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const resp = await fetch(`${MESHY_BASE}/image-to-3d/${taskId}`, {
    headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
    cache: "no-store",
  });

  if (!resp.ok) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const data = await resp.json();

  return NextResponse.json({
    status: data.status as "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED",
    progress: data.progress ?? 0,
    glbUrl: (data.model_urls?.glb as string) ?? null,
    usdzUrl: (data.model_urls?.usdz as string) ?? null,
    thumbnailUrl: (data.thumbnail_url as string) ?? null,
  });
}
