import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { getSessionProfile } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  try {
    const profile = await getSessionProfile();
    if (!profile?.isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Chỉ Admin được cập nhật Xí nghiệp" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = (await request.json()) as {
      ma?: string | null;
      ten?: string;
      phu_hop_tvtk?: boolean;
      phu_hop_thi_nghiem?: boolean;
      phu_hop_tvgs?: boolean;
      active?: boolean;
    };

    const patch: Record<string, unknown> = {};
    if (body.ma !== undefined) patch.ma = body.ma?.trim() || null;
    if (body.ten !== undefined) {
      if (!body.ten.trim()) {
        return NextResponse.json(
          { ok: false, error: "Tên không được trống" },
          { status: 400 },
        );
      }
      patch.ten = body.ten.trim();
    }
    if (body.phu_hop_tvtk !== undefined) patch.phu_hop_tvtk = body.phu_hop_tvtk;
    if (body.phu_hop_thi_nghiem !== undefined) {
      patch.phu_hop_thi_nghiem = body.phu_hop_thi_nghiem;
    }
    if (body.phu_hop_tvgs !== undefined) {
      patch.phu_hop_tvgs = body.phu_hop_tvgs;
    }
    if (body.active !== undefined) patch.active = body.active;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { ok: false, error: "Không có trường cập nhật" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("xi_nghiep")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    await logHoatDong({
      phanHe: "HE_THONG",
      hanhDong: "UPDATE",
      chiTietNgan: `Cập nhật Xí nghiệp ${data.ten}`,
      doiTuongId: id,
      duLieuDong: {
        truong_thay_doi: Object.keys(body),
        ma_xi_nghiep: data.ma,
        ten_xi_nghiep: data.ten,
        phu_hop_tvtk: data.phu_hop_tvtk,
        phu_hop_thi_nghiem: data.phu_hop_thi_nghiem,
        phu_hop_tvgs: data.phu_hop_tvgs,
      },
      email: profile.email,
      hoTen: profile.nhanSu?.ho_ten ?? profile.email,
      authUserId: profile.userId,
    });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật XN";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
