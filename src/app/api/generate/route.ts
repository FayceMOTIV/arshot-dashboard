import { NextRequest, NextResponse } from "next/server";

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_BASE = "https://api.meshy.ai/openapi/v2";

export async function POST(req: NextRequest) {
  if (!MESHY_API_KEY) {
    return NextResponse.json({ error: "MESHY_API_KEY not configured" }, { status: 503 });
  }

  let imageBase64: string;

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });
    const buffer = await file.arrayBuffer();
    const b64 = Buffer.from(buffer).toString("base64");
    imageBase64 = `data:${file.type || "image/jpeg"};base64,${b64}`;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const resp = await fetch(`${MESHY_BASE}/image-to-3d`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MESHY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_base64: imageBase64,
      enable_pbr: false,
      ai_model: "meshy-4",
      topology: "quad",
      target_polycount: 30000,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Meshy error:", resp.status, text);
    return NextResponse.json({ error: text }, { status: resp.status });
  }

  const data = await resp.json();
  return NextResponse.json({ taskId: data.result });
}
