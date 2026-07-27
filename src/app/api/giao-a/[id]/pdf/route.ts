import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "qd-giao-a";

type Ctx = { params: Promise<{ id: string }> };

/** GET — xem PDF Giao A gốc (mở tab mới) */
export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createAdminClient();

    const { data: qd, error } = await supabase
      .from("qd_giao_a")
      .select("id, so_qd, storage_path")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!qd?.storage_path) {
      return NextResponse.json(
        { ok: false, error: "Chưa có file PDF Giao A" },
        { status: 404 },
      );
    }

    const { data: file, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(qd.storage_path);

    if (dlErr || !file) {
      throw new Error(dlErr?.message ?? "Không tải được PDF");
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const safeName = (qd.so_qd || id)
      .toString()
      .replace(/[^\w.-]+/g, "_")
      .slice(0, 80);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="GiaoA-${safeName}.pdf"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi xem PDF";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
