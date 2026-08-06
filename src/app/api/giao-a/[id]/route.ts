import { NextResponse } from "next/server";
import {
  AuthError,
  canXoaHoSoGiaoA,
  requireSession,
} from "@/lib/phan-he-auth";
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

/**
 * DELETE hồ sơ Giao A + dự án thuộc hồ sơ.
 * Chỉ Admin / Trưởng phòng. Không xóa nếu đã có QĐ giao XN.
 */
export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const profile = await requireSession();
    if (!canXoaHoSoGiaoA(profile)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Chỉ Quản trị hoặc Trưởng phòng được xóa hồ sơ Giao A. Quét sai — báo Trưởng phòng để xóa.",
        },
        { status: 403 },
      );
    }

    const { id } = await ctx.params;
    const supabase = createAdminClient();

    const { data: duAns } = await supabase
      .from("du_an")
      .select("id")
      .eq("qd_giao_a_id", id);

    const ids = (duAns ?? []).map((d) => d.id as string);
    if (ids.length) {
      const { count } = await supabase
        .from("qd_giao_xn")
        .select("id", { count: "exact", head: true })
        .in("du_an_id", ids);
      if ((count ?? 0) > 0) {
        return NextResponse.json(
          {
            ok: false,
            error: "Hồ sơ đã có QĐ giao XN — không hủy được",
          },
          { status: 400 },
        );
      }
      const { error: delDa } = await supabase
        .from("du_an")
        .delete()
        .eq("qd_giao_a_id", id);
      if (delDa) throw new Error(delDa.message);
    }

    const { error } = await supabase.from("qd_giao_a").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi hủy hồ sơ Giao A";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
