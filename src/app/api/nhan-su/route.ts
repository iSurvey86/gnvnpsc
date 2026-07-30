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

const ALL_PHAN_HE: PhanHeCode[] = ["tvtk", "thi_nghiem", "tvgs"];

function resolveAssignments(
  phanHe: unknown,
  chucDanh: string | null | undefined,
): Array<{ phan_he: PhanHeCode; vai_tro_phan_he: VaiTroPhanHe }> {
  const selected = Array.isArray(phanHe)
    ? phanHe.filter(isPhanHeCode)
    : [];
  const codes = isTruongPhong(chucDanh) ? ALL_PHAN_HE : selected;
  const role: VaiTroPhanHe =
    isTruongPhong(chucDanh) || isPhoPhong(chucDanh) ? "manager" : "assigner";
  return codes.map((code) => ({ phan_he: code, vai_tro_phan_he: role }));
}

export async function GET() {
  try {
    const profile = await getSessionProfile();
    if (!profile?.isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Chỉ Admin được quản lý nhân sự" },
        { status: 403 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nhan_su")
      .select("*, nhan_su_phan_he(phan_he, vai_tro_phan_he, active)")
      .order("ma_nv", { ascending: true });

    if (error) throw new Error(error.message);
    const effectiveData = (data ?? []).map((row) => {
      if (row.vai_tro === "admin" || isTruongPhong(row.chuc_danh)) {
        return {
          ...row,
          nhan_su_phan_he: ALL_PHAN_HE.map((phan_he) => ({
            phan_he,
            vai_tro_phan_he: "manager" as const,
            active: true,
          })),
        };
      }
      return row;
    });
    return NextResponse.json({ ok: true, data: effectiveData });
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
      phan_he?: PhanHeCode[];
    };

    if (!body.ho_ten?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Thiếu họ tên hoặc email" },
        { status: 400 },
      );
    }

    const profile = await getSessionProfile();
    if (!profile?.isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Chỉ Admin được thêm nhân sự" },
        { status: 403 },
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
    const assignments = resolveAssignments(body.phan_he, body.chuc_danh);
    if (assignments.length > 0) {
      const { error: roleError } = await supabase
        .from("nhan_su_phan_he")
        .upsert(
          assignments.map((item) => ({
            nhan_su_id: data.id,
            ...item,
            active: true,
          })),
          { onConflict: "nhan_su_id,phan_he" },
        );
      if (roleError) throw new Error(roleError.message);
    }
    await logHoatDong({
      phanHe: "HE_THONG",
      hanhDong: "CREATE",
      chiTietNgan: `Thêm nhân sự ${data.ho_ten}`,
      doiTuongId: data.id,
      duLieuDong: {
        ma_nv: data.ma_nv,
        ho_ten: data.ho_ten,
        email: data.email,
        chuc_danh: data.chuc_danh,
        dien_thoai: data.dien_thoai,
        to_lam_viec: assignments.map((item) => item.phan_he),
        quyen_phan_he: assignments[0]?.vai_tro_phan_he ?? null,
      },
      email: profile.email,
      hoTen: profile.nhanSu?.ho_ten ?? profile.email,
      authUserId: profile.userId,
    });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi thêm nhân sự";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
