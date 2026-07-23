import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** GET danh sách hồ sơ QĐ Giao A (mới nhất trước) */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("qd_giao_a")
      .select("id, so_qd, ngay_qd, trich_yeu, scan_status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải danh sách";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
