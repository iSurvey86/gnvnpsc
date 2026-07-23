import { NextResponse } from "next/server";
import { parseGiaoAPdf } from "@/lib/scan-ai/parse-giao-a";

export const runtime = "nodejs";

/**
 * POST multipart: field `file` = PDF QĐ Giao A
 * Phase 0: stub sẵn — cần GEMINI_API_KEY để chạy thật.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Thiếu file PDF (field: file)" },
        { status: 400 },
      );
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Chỉ nhận application/pdf" },
        { status: 400 },
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const result = await parseGiaoAPdf(buf);
    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi ScanAI";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
