import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { isPhoPhong, isTruongPhong } from "@/lib/chuc-danh";
import {
  isPhanHeCode,
  type PhanHeCode,
  type VaiTroPhanHe,
} from "@/lib/phan-he";
import { getSessionProfile } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

const ALL_PHAN_HE: PhanHeCode[] = ["tvtk", "thi_nghiem", "tvgs"];

export async function PATCH(request: Request, { params }: Props) {
  try {
    const profile = await getSessionProfile();
    if (!profile?.isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Chỉ Admin được cập nhật nhân sự" },
        { status: 403 },
      );
    }

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
      phan_he?: PhanHeCode[];
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

    let effectiveCodes: PhanHeCode[] | undefined;
    let effectiveRole: VaiTroPhanHe | undefined;
    if (body.phan_he !== undefined) {
      const selected = body.phan_he.filter(isPhanHeCode);
      const quanLyToanBo =
        data.vai_tro === "admin" || isTruongPhong(data.chuc_danh);
      const codes = quanLyToanBo ? ALL_PHAN_HE : selected;
      const role: VaiTroPhanHe =
        quanLyToanBo || isPhoPhong(data.chuc_danh) ? "manager" : "assigner";
      effectiveCodes = codes;
      effectiveRole = role;

      const { error: disableError } = await supabase
        .from("nhan_su_phan_he")
        .update({ active: false })
        .eq("nhan_su_id", id);
      if (disableError) throw new Error(disableError.message);

      if (codes.length > 0) {
        const { error: roleError } = await supabase
          .from("nhan_su_phan_he")
          .upsert(
            codes.map((phan_he) => ({
              nhan_su_id: id,
              phan_he,
              vai_tro_phan_he: role,
              active: true,
            })),
            { onConflict: "nhan_su_id,phan_he" },
          );
        if (roleError) throw new Error(roleError.message);
      }
    }
    await logHoatDong({
      phanHe: "HE_THONG",
      hanhDong: "UPDATE",
      chiTietNgan: `Cập nhật nhân sự ${data.ho_ten}`,
      doiTuongId: id,
      duLieuDong: {
        truong_thay_doi: Object.keys(body),
        ma_nv: data.ma_nv,
        ho_ten: data.ho_ten,
        email: data.email,
        chuc_danh: data.chuc_danh,
        dien_thoai: data.dien_thoai,
        to_lam_viec: effectiveCodes ?? body.phan_he ?? null,
        quyen_phan_he: effectiveRole ?? null,
      },
      email: profile.email,
      hoTen: profile.nhanSu?.ho_ten ?? profile.email,
      authUserId: profile.userId,
    });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật nhân sự";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
