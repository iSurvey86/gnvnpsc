import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("xi_nghiep")
      .select("*")
      .eq("active", true)
      .order("ten", { ascending: true });

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải Xí nghiệp";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ma?: string | null;
      ten?: string;
      phu_hop_tvtk?: boolean;
      phu_hop_thi_nghiem?: boolean;
    };

    if (!body.ten?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Thiếu tên Xí nghiệp" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("xi_nghiep")
      .insert({
        ma: body.ma ?? null,
        ten: body.ten.trim(),
        phu_hop_tvtk: body.phu_hop_tvtk ?? true,
        phu_hop_thi_nghiem: body.phu_hop_thi_nghiem ?? true,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi thêm Xí nghiệp";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
