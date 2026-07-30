import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import {
  AuthError,
  parsePhanHeParam,
  requireSession,
  requireWritePhanHe,
} from "@/lib/phan-he-auth";
import { resolveDiaDiem } from "@/lib/soan-qd-defaults";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** GET danh sách dự án + QĐ Giao A + QĐ giao XN (?phan_he=) */
export async function GET(request: Request) {
  try {
    await requireSession();
    const phanHeParam = new URL(request.url).searchParams.get("phan_he");
    const phanHe = phanHeParam ? parsePhanHeParam(phanHeParam) : null;

    const supabase = createAdminClient();
    let q = supabase
      .from("du_an")
      .select(
        `id, ma_du_an, ten_du_an, dia_diem, quy_mo, goi_cong_viec, ghi_chu, cap_dien_ap, huong_giao, xi_nghiep_id, phan_he, qd_giao_a_id, created_at, created_by, updated_by, assigned_by, assigned_at,
         qd_giao_a:qd_giao_a_id ( id, so_qd, ngay_qd, scan_status, scanned_by_ho_ten ),
         xi_nghiep:xi_nghiep_id ( id, ten, ma ),
         qd_giao_xn ( id, loai, trang_thai, so_qd_du_thao, phan_he, xi_nghiep:xi_nghiep_id ( id, ten, ma ) )`,
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (phanHe) q = q.eq("phan_he", phanHe);

    const { data, error } = await q;
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    await Promise.all(
      rows.map(async (r) => {
        if (r.dia_diem) return;
        const filled = resolveDiaDiem(null, { tenDuAn: r.ten_du_an as string });
        if (!filled) return;
        r.dia_diem = filled;
        await supabase
          .from("du_an")
          .update({ dia_diem: filled })
          .eq("id", r.id);
      }),
    );

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi tải dự án";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** POST thêm dự án thủ công */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      qd_giao_a_id?: string | null;
      ma_du_an?: string | null;
      ten_du_an?: string;
      dia_diem?: string | null;
      quy_mo?: string | null;
      goi_cong_viec?: string | null;
      ghi_chu?: string | null;
      cap_dien_ap?: string | null;
      huong_giao?: string | null;
      xi_nghiep_id?: string | null;
      phan_he?: string | null;
    };

    const phanHe = parsePhanHeParam(body.phan_he);
    const { actor } = await requireWritePhanHe(phanHe);

    if (!body.ten_du_an?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Thiếu tên dự án" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("du_an")
      .insert({
        qd_giao_a_id: body.qd_giao_a_id ?? null,
        ma_du_an: body.ma_du_an ?? null,
        ten_du_an: body.ten_du_an.trim(),
        dia_diem: resolveDiaDiem(body.dia_diem, {
          tenDuAn: body.ten_du_an,
        }),
        quy_mo: body.quy_mo ?? null,
        goi_cong_viec: body.goi_cong_viec ?? null,
        ghi_chu: body.ghi_chu ?? null,
        cap_dien_ap:
          body.cap_dien_ap === "110kv" || body.cap_dien_ap === "trung_ha_ap"
            ? body.cap_dien_ap
            : null,
        huong_giao:
          body.huong_giao === "tvtk" ||
          body.huong_giao === "tn" ||
          body.huong_giao === "tvtk_tn"
            ? body.huong_giao
            : null,
        xi_nghiep_id: body.xi_nghiep_id || null,
        phan_he: phanHe,
        created_by: actor.userId,
        updated_by: actor.userId,
        assigned_by: body.xi_nghiep_id ? actor.userId : null,
        assigned_at: body.xi_nghiep_id ? new Date().toISOString() : null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await logHoatDong({
      phanHe: "DA",
      hanhDong: "CREATE",
      chiTietNgan: `Tạo DA ${data.ma_du_an || data.ten_du_an}`,
      doiTuongId: data.id,
      duLieuDong: { phan_he: phanHe },
      email: actor.email,
      hoTen: actor.hoTen,
      authUserId: actor.userId,
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi thêm dự án";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
