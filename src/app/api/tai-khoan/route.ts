import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/session";
import type { NhanSu } from "@/lib/types";

export const runtime = "nodejs";

/**
 * GET — danh sách tài khoản non-admin (vai_tro = user).
 * Mọi user đã đăng nhập được xem; cấp/đặt lại MK vẫn chỉ Admin (API khác).
 * Query: q, active=1|0|all, da_cap=1|0|all
 */
export async function GET(request: Request) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "Chưa đăng nhập" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const active = url.searchParams.get("active") || "all";
    const daCap = url.searchParams.get("da_cap") || "all";

    const admin = createAdminClient();
    let query = admin
      .from("nhan_su")
      .select("*")
      .eq("vai_tro", "user")
      .order("ho_ten", { ascending: true });

    if (active === "1") query = query.eq("active", true);
    if (active === "0") query = query.eq("active", false);
    if (daCap === "1") query = query.eq("da_cap_dang_nhap", true);
    if (daCap === "0") query = query.eq("da_cap_dang_nhap", false);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let rows = (data ?? []) as NhanSu[];
    if (q) {
      rows = rows.filter((r) => {
        const hay =
          `${r.ho_ten} ${r.email} ${r.ma_nv ?? ""} ${r.don_vi ?? ""} ${r.dien_thoai ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({
      ok: true,
      data: rows,
      is_admin: profile.isAdmin,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Lỗi tải danh sách tài khoản";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
