import { NextResponse } from "next/server";
import { logHoatDong, type NhatKyHoatDong } from "@/lib/activity-log";
import { ADMIN_EMAIL } from "@/lib/auth-defaults";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/session";

export const runtime = "nodejs";

/** GET — Admin: danh sách nhật ký (lọc + phân trang) */
export async function GET(request: Request) {
  try {
    const profile = await getSessionProfile();
    if (!profile?.isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Chỉ Admin được xem nhật ký" },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const phanHe = url.searchParams.get("phan_he") || "ALL";
    const hanhDong = url.searchParams.get("hanh_dong") || "ALL";
    const hideAdmin =
      url.searchParams.get("hide_admin") === "1" ||
      url.searchParams.get("hide_admin") === "true";
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const pageSize = Math.min(
      100,
      Math.max(10, Number(url.searchParams.get("page_size") || 20)),
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const admin = createAdminClient();

    const adminEmails = new Set<string>([ADMIN_EMAIL.toLowerCase()]);
    if (hideAdmin) {
      const { data: adminNs } = await admin
        .from("nhan_su")
        .select("email")
        .eq("vai_tro", "admin");
      for (const row of adminNs ?? []) {
        const em = (row.email as string | null)?.trim().toLowerCase();
        if (em) adminEmails.add(em);
      }
    }

    let query = admin
      .from("nhat_ky_hoat_dong")
      .select("*", { count: "exact" })
      .order("thoi_gian", { ascending: false });

    if (phanHe !== "ALL") query = query.eq("phan_he", phanHe);
    if (hanhDong !== "ALL") query = query.eq("hanh_dong", hanhDong);

    if (hideAdmin && adminEmails.size > 0) {
      // PostgREST in-list: loại email admin (kể cả tài khoản ADMIN_EMAIL)
      const list = [...adminEmails]
        .map((e) => `"${e.replace(/"/g, "")}"`)
        .join(",");
      query = query.not("email", "in", `(${list})`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);

    let rows = (data ?? []) as NhatKyHoatDong[];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.ho_ten ?? ""} ${r.email ?? ""} ${r.chi_tiet_ngan ?? ""} ${r.hanh_dong} ${r.phan_he}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({
      ok: true,
      data: rows,
      page,
      page_size: pageSize,
      total: count ?? rows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải nhật ký";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * POST — ghi 1 dòng nhật ký (user đã đăng nhập, hoặc login_fail kèm email).
 * Body: { phan_he, hanh_dong, chi_tiet_ngan, doi_tuong_id?, du_lieu_dong?, trang_thai?, email?, ho_ten? }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phan_he?: string;
      hanh_dong?: string;
      chi_tiet_ngan?: string;
      doi_tuong_id?: string | null;
      du_lieu_dong?: Record<string, unknown>;
      trang_thai?: string;
      email?: string;
      ho_ten?: string;
    };

    if (!body.phan_he?.trim() || !body.hanh_dong?.trim() || !body.chi_tiet_ngan?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Thiếu phan_he / hanh_dong / chi_tiet_ngan" },
        { status: 400 },
      );
    }

    const profile = await getSessionProfile();
    const isFail =
      body.hanh_dong === "LOGIN_FAIL" || body.trang_thai === "Thất bại";

    if (!profile && !isFail) {
      return NextResponse.json(
        { ok: false, error: "Chưa đăng nhập" },
        { status: 401 },
      );
    }

    await logHoatDong({
      phanHe: body.phan_he,
      hanhDong: body.hanh_dong,
      chiTietNgan: body.chi_tiet_ngan,
      doiTuongId: body.doi_tuong_id,
      duLieuDong: body.du_lieu_dong,
      trangThai: body.trang_thai,
      email: body.email || profile?.email,
      hoTen: body.ho_ten || profile?.nhanSu?.ho_ten || profile?.email,
      authUserId: profile?.userId,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi ghi nhật ký";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
