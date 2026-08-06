import { NextResponse } from "next/server";
import { isTruongPhong } from "@/lib/chuc-danh";
import { canXoaHoSoGiaoA } from "@/lib/phan-he-auth";
import { getSessionProfile } from "@/lib/session";

export async function GET() {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ ok: false, error: "Chưa đăng nhập" }, { status: 401 });
    }
    const isTruongPhongNs = isTruongPhong(profile.nhanSu?.chuc_danh);
    return NextResponse.json({
      ok: true,
      data: {
        email: profile.email,
        vai_tro: profile.vaiTro,
        is_admin: profile.isAdmin,
        is_truong_phong: isTruongPhongNs,
        can_xoa_giao_a: canXoaHoSoGiaoA(profile),
        chuc_danh: profile.nhanSu?.chuc_danh ?? null,
        ho_ten: profile.nhanSu?.ho_ten ?? null,
        don_vi: profile.nhanSu?.don_vi ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
