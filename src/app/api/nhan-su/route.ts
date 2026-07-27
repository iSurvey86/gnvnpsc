import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nhan_su")
      .select("*")
      .order("ma_nv", { ascending: true });

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải nhân sự";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ma_nv?: string | null;
      ho_ten?: string;
      email?: string;
      don_vi?: string | null;
      chuc_danh?: string | null;
      dien_thoai?: string | null;
      active?: boolean;
    };

    if (!body.ho_ten?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Thiếu họ tên hoặc email" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nhan_su")
      .insert({
        ma_nv: body.ma_nv?.trim() || null,
        ho_ten: body.ho_ten.trim(),
        email: body.email.trim().toLowerCase(),
        don_vi: body.don_vi?.trim() || null,
        chuc_danh: body.chuc_danh?.trim() || null,
        dien_thoai: body.dien_thoai?.trim() || null,
        active: body.active ?? true,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi thêm nhân sự";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
