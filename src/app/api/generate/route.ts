import { NextRequest, NextResponse } from "next/server";

const FAL_QUEUE = "https://queue.fal.run/fal-ai/trellis";

export async function POST(req: NextRequest) {
  // Lire la clé à l'intérieur de la fonction (pas au niveau module)
  const FAL_KEY = process.env.FAL_API_KEY;

  console.log("[generate] FAL_API_KEY present:", !!FAL_KEY, "| length:", FAL_KEY?.length ?? 0);

  if (!FAL_KEY) {
    console.error("[generate] FAL_API_KEY is missing from environment");
    return NextResponse.json({ error: "FAL_API_KEY not configured" }, { status: 503 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

  // Convertir en base64 data URL — pas besoin d'uploader vers fal.ai storage
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const contentType = file.type || "image/jpeg";
  const imageUrl = `data:${contentType};base64,${base64}`;

  console.log("[generate] Submitting to fal-ai/trellis, image size:", arrayBuffer.byteLength, "bytes");

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
    console.error("[generate] fal-ai/trellis error:", genResp.status, err);
    return NextResponse.json({ error: "Generation failed", detail: err }, { status: 500 });
  }

  const data = await genResp.json() as { request_id: string };
  console.log("[generate] Job submitted, request_id:", data.request_id);
  return NextResponse.json({ taskId: data.request_id });
}
