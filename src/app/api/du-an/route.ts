import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { laDuAn110kv, resolveLoaiHinhDuAn } from "@/lib/loai-hinh-du-an";
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
    const sp = new URL(request.url).searchParams;
    const phanHeParam = sp.get("phan_he");
    const phanHe = phanHeParam ? parsePhanHeParam(phanHeParam) : null;
    // Mặc định chỉ trả dự án đã lưu chính thức; bản nháp chỉ dùng cho màn Review
    const gomBanNhap = sp.get("gom_ban_nhap") === "1";

    const supabase = createAdminClient();
    let q = supabase
      .from("du_an")
      .select(
        `id, ma_du_an, ten_du_an, dia_diem, quy_mo, goi_cong_viec, ghi_chu, cap_dien_ap, loai_hinh_du_an, huong_giao, xi_nghiep_id, phan_he, da_luu, qd_giao_a_id, created_at, created_by, updated_by, assigned_by, assigned_at,
         qd_giao_a:qd_giao_a_id ( id, so_qd, ngay_qd, scan_status, scanned_by_ho_ten ),
         xi_nghiep:xi_nghiep_id ( id, ten, ma ),
         qd_giao_xn ( id, loai, trang_thai, so_qd_du_thao, phan_he, pdf_ky_storage_path, xi_nghiep:xi_nghiep_id ( id, ten, ma ) )`,
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (phanHe) q = q.eq("phan_he", phanHe);
    if (!gomBanNhap) q = q.eq("da_luu", true);

    const { data, error } = await q;
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Array<Record<string, unknown> & { id: string }>;
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

    // Map QĐ phủ nhiều công trình (cùng Giao A)
    const ids = rows.map((r) => r.id);
    if (ids.length) {
      const { data: maps, error: mapErr } = await supabase
        .from("qd_giao_xn_du_an")
        .select(
          `du_an_id,
           qd_giao_xn:qd_giao_xn_id (
             id, loai, trang_thai, so_qd_du_thao, du_an_id, pdf_ky_storage_path, phan_he,
             xi_nghiep:xi_nghiep_id ( id, ten, ma )
           )`,
        )
        .in("du_an_id", ids);
      if (mapErr) throw new Error(mapErr.message);

      const byDuAn = new Map<string, unknown[]>();
      for (const m of maps ?? []) {
        const list = byDuAn.get(m.du_an_id as string) ?? [];
        const qd = Array.isArray(m.qd_giao_xn) ? m.qd_giao_xn[0] : m.qd_giao_xn;
        if (qd) list.push({ ...qd, mapped: true });
        byDuAn.set(m.du_an_id as string, list);
      }
      for (const r of rows) {
        r.qd_giao_xn_map = byDuAn.get(r.id) ?? [];
      }
    }

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
      loai_hinh_du_an?: string | null;
      huong_giao?: string | null;
      xi_nghiep_id?: string | null;
      phan_he?: string | null;
      da_luu?: boolean;
    };

    const phanHe = parsePhanHeParam(body.phan_he);
    const { actor } = await requireWritePhanHe(phanHe);

    if (!body.ten_du_an?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Thiếu tên dự án" },
        { status: 400 },
      );
    }

    const capDienAp =
      body.cap_dien_ap === "110kv" || body.cap_dien_ap === "trung_ha_ap"
        ? body.cap_dien_ap
        : null;
    const loaiHinh = resolveLoaiHinhDuAn(capDienAp, body.loai_hinh_du_an);
    if (
      !laDuAn110kv(capDienAp) &&
      body.loai_hinh_du_an != null &&
      String(body.loai_hinh_du_an).trim() !== "" &&
      !loaiHinh
    ) {
      return NextResponse.json(
        { ok: false, error: "Loại hình dự án không hợp lệ (CQT / SCMBA / DMS)" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Dòng thêm tay trên màn Review phải là nháp cho tới khi bấm Lưu
    let daLuu = true;
    if (body.qd_giao_a_id) {
      const { data: qd } = await supabase
        .from("qd_giao_a")
        .select("da_luu")
        .eq("id", body.qd_giao_a_id)
        .maybeSingle();
      if (qd) daLuu = qd.da_luu === true;
    }
    if (typeof body.da_luu === "boolean") daLuu = body.da_luu;

    if (daLuu && !loaiHinh) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Dự án trung hạ áp phải chọn loại hình (CQT / SCMBA / DMS) trước khi lưu",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("du_an")
      .insert({
        qd_giao_a_id: body.qd_giao_a_id ?? null,
        da_luu: daLuu,
        ma_du_an: body.ma_du_an ?? null,
        ten_du_an: body.ten_du_an.trim(),
        dia_diem: resolveDiaDiem(body.dia_diem, {
          tenDuAn: body.ten_du_an,
        }),
        quy_mo: body.quy_mo ?? null,
        goi_cong_viec: body.goi_cong_viec ?? null,
        ghi_chu: body.ghi_chu ?? null,
        cap_dien_ap: capDienAp,
        loai_hinh_du_an: loaiHinh,
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
      chiTietNgan: `Thêm dự án ${data.ma_du_an || data.ten_du_an}`,
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
