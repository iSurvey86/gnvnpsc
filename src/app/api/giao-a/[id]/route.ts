import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** GET một hồ sơ Giao A + danh mục dự án */
export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createAdminClient();

    const { data: qd, error: qdErr } = await supabase
      .from("qd_giao_a")
      .select("*")
      .eq("id", id)
      .single();

    if (qdErr) throw new Error(qdErr.message);

    const { data: duAn, error: daErr } = await supabase
      .from("du_an")
      .select("*")
      .eq("qd_giao_a_id", id)
      .order("created_at", { ascending: true });

    if (daErr) throw new Error(daErr.message);

    return NextResponse.json({ ok: true, data: { qd, du_an: duAn ?? [] } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải hồ sơ";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
