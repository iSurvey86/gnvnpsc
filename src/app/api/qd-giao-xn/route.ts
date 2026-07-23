import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LoaiGiaoXn } from "@/lib/types";

export const runtime = "nodejs";

/** GET danh sách QĐ giao XN */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("qd_giao_xn")
      .select(
        "*, du_an:du_an_id ( id, ten_du_an, ma_du_an ), xi_nghiep:xi_nghiep_id ( id, ten, ma )",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải QĐ giao XN";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** POST tạo dự thảo QĐ giao Xí nghiệp */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      du_an_id?: string;
      loai?: LoaiGiaoXn;
      so_qd_du_thao?: string | null;
      ngay_du_thao?: string | null;
      xi_nghiep_id?: string | null;
      xi_nghiep_ten?: string | null;
      pham_vi?: string | null;
      thoi_han?: string | null;
      can_cu?: string | null;
      trang_thai?: "nhap" | "trinh_gd";
    };

    if (!body.du_an_id) {
      return NextResponse.json(
        { ok: false, error: "Thiếu dự án" },
        { status: 400 },
      );
    }
    if (body.loai !== "tvtk" && body.loai !== "thi_nghiem") {
      return NextResponse.json(
        { ok: false, error: "Loại phải là tvtk hoặc thi_nghiem" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    let xiNghiepId = body.xi_nghiep_id ?? null;

    if (!xiNghiepId && body.xi_nghiep_ten?.trim()) {
      const { data: xn, error: xnErr } = await supabase
        .from("xi_nghiep")
        .insert({
          ten: body.xi_nghiep_ten.trim(),
          phu_hop_tvtk: body.loai === "tvtk",
          phu_hop_thi_nghiem: body.loai === "thi_nghiem",
        })
        .select("id")
        .single();
      if (xnErr) throw new Error(xnErr.message);
      xiNghiepId = xn.id;
    }

    const { data, error } = await supabase
      .from("qd_giao_xn")
      .insert({
        du_an_id: body.du_an_id,
        loai: body.loai,
        so_qd_du_thao: body.so_qd_du_thao ?? null,
        ngay_du_thao: body.ngay_du_thao ?? null,
        xi_nghiep_id: xiNghiepId,
        pham_vi: body.pham_vi ?? null,
        thoi_han: body.thoi_han ?? null,
        can_cu: body.can_cu ?? null,
        trang_thai: body.trang_thai ?? "nhap",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tạo QĐ giao XN";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
