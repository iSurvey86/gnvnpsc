import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      ma_nv?: string | null;
      ho_ten?: string;
      email?: string;
      don_vi?: string | null;
      chuc_danh?: string | null;
      dien_thoai?: string | null;
      active?: boolean;
      goi_y_doi_mk?: boolean;
    };

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.ma_nv !== undefined) patch.ma_nv = body.ma_nv?.trim() || null;
    if (body.ho_ten !== undefined) {
      if (!body.ho_ten.trim()) {
        return NextResponse.json(
          { ok: false, error: "Họ tên không được trống" },
          { status: 400 },
        );
      }
      patch.ho_ten = body.ho_ten.trim();
    }
    if (body.email !== undefined) {
      if (!body.email.trim()) {
        return NextResponse.json(
          { ok: false, error: "Email không được trống" },
          { status: 400 },
        );
      }
      patch.email = body.email.trim().toLowerCase();
    }
    if (body.don_vi !== undefined) patch.don_vi = body.don_vi?.trim() || null;
    if (body.chuc_danh !== undefined) {
      patch.chuc_danh = body.chuc_danh?.trim() || null;
    }
    if (body.dien_thoai !== undefined) {
      patch.dien_thoai = body.dien_thoai?.trim() || null;
    }
    if (body.active !== undefined) patch.active = body.active;
    if (body.goi_y_doi_mk !== undefined) {
      patch.goi_y_doi_mk = body.goi_y_doi_mk;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nhan_su")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật nhân sự";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
