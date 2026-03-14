import { NextRequest, NextResponse } from "next/server";

const FAL_KEY = process.env.FAL_API_KEY;
const FAL_QUEUE = "https://queue.fal.run/fal-ai/trellis";

export async function POST(req: NextRequest) {
  if (!FAL_KEY) {
    return NextResponse.json({ error: "FAL_API_KEY not configured" }, { status: 503 });
  }

  // Read uploaded image and convert to base64 data URL (no storage upload needed)
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const contentType = file.type || "image/jpeg";
  const imageUrl = `data:${contentType};base64,${base64}`;

  // Submit to fal-ai/trellis
  const genResp = await fetch(FAL_QUEUE, {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      ss_sampling_steps: 12,
      slat_sampling_steps: 12,
      mesh_simplify: 0.95,
      texture_size: 1024,
    }),
  });

  if (!genResp.ok) {
    const err = await genResp.text();
    console.error("[fal-ai/trellis] Submit error:", genResp.status, err);
    return NextResponse.json({ error: "Generation failed", detail: err }, { status: 500 });
  }

  const { request_id } = await genResp.json() as { request_id: string };
  return NextResponse.json({ taskId: request_id });
}
