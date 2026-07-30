import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LoaiGiaoXn } from "@/lib/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("qd_giao_xn")
      .select(
        "*, du_an:du_an_id ( * ), xi_nghiep:xi_nghiep_id ( id, ten, ma )",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy dự thảo" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as {
      so_qd_du_thao?: string | null;
      ngay_du_thao?: string | null;
      xi_nghiep_id?: string | null;
      pham_vi?: string | null;
      thoi_han?: string | null;
      can_cu?: string | null;
      loai?: LoaiGiaoXn;
      trang_thai?: "nhap" | "trinh_gd" | "da_ban_hanh";
    };

    const supabase = createAdminClient();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.so_qd_du_thao !== undefined)
      patch.so_qd_du_thao = body.so_qd_du_thao;
    if (body.ngay_du_thao !== undefined) patch.ngay_du_thao = body.ngay_du_thao;
    if (body.xi_nghiep_id !== undefined) patch.xi_nghiep_id = body.xi_nghiep_id;
    if (body.pham_vi !== undefined) patch.pham_vi = body.pham_vi;
    if (body.thoi_han !== undefined) patch.thoi_han = body.thoi_han;
    if (body.can_cu !== undefined) patch.can_cu = body.can_cu;
    if (body.loai === "tvtk" || body.loai === "thi_nghiem" || body.loai === "tvgs")
      patch.loai = body.loai;
    if (
      body.trang_thai === "nhap" ||
      body.trang_thai === "trinh_gd" ||
      body.trang_thai === "da_ban_hanh"
    ) {
      patch.trang_thai = body.trang_thai;
    }

    const { data, error } = await supabase
      .from("qd_giao_xn")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
