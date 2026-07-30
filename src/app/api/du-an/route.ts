import { NextResponse } from "next/server";
import { resolveDiaDiem } from "@/lib/soan-qd-defaults";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** GET danh sách dự án + QĐ Giao A + QĐ giao XN */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("du_an")
      .select(
        `id, ma_du_an, ten_du_an, dia_diem, quy_mo, goi_cong_viec, ghi_chu, cap_dien_ap, huong_giao, xi_nghiep_id, qd_giao_a_id, created_at,
         qd_giao_a:qd_giao_a_id ( id, so_qd, ngay_qd, scan_status ),
         xi_nghiep:xi_nghiep_id ( id, ten, ma ),
         qd_giao_xn ( id, loai, trang_thai, so_qd_du_thao, xi_nghiep:xi_nghiep_id ( id, ten, ma ) )`,
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);

    const rows = data ?? [];
    // Bổ sung địa điểm còn trống (vd TNHC chỉ ghi tỉnh trong tên / PC tỉnh)
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
    };

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
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi thêm dự án";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
