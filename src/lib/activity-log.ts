import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/session";

export type ActivityPhanHe =
  | "XAC_THUC"
  | "DA"
  | "GIAO_A"
  | "GIAO_XN"
  | "HE_THONG"
  | "SYSTEM";

export type ActivityHanhDong =
  | "LOGIN"
  | "LOGIN_FAIL"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "SCAN"
  | "CAP_DANG_NHAP"
  | "DOI_MK"
  | "VIEW";

export type NhatKyHoatDong = {
  id: number;
  thoi_gian: string;
  email: string | null;
  ho_ten: string | null;
  auth_user_id: string | null;
  phan_he: string;
  hanh_dong: string;
  doi_tuong_id: string | null;
  chi_tiet_ngan: string | null;
  du_lieu_dong: Record<string, unknown>;
  trang_thai: string;
};

export type LogHoatDongInput = {
  phanHe: ActivityPhanHe | string;
  hanhDong: ActivityHanhDong | string;
  chiTietNgan: string;
  doiTuongId?: string | null;
  duLieuDong?: Record<string, unknown>;
  trangThai?: "Thành công" | "Thất bại" | string;
  /** Ghi đè actor (vd login fail chưa có session) */
  email?: string | null;
  hoTen?: string | null;
  authUserId?: string | null;
};

/**
 * Ghi nhật ký — không ném lỗi ra ngoài (không chặn nghiệp vụ).
 * Ưu tiên email/họ tên truyền vào; không thì lấy session.
 */
export async function logHoatDong(input: LogHoatDongInput): Promise<void> {
  try {
    let email = input.email?.trim() || null;
    let hoTen = input.hoTen?.trim() || null;
    let authUserId = input.authUserId ?? null;

    let viewAsCap: string | null = null;
    const profile = await getSessionProfile().catch(() => null);
    if (profile) {
      email = email || profile.email;
      hoTen = hoTen || profile.actorHoTen || profile.email;
      authUserId = authUserId || profile.userId;
      viewAsCap = profile.viewAs;
    }

    const duLieuDong = {
      ...(input.duLieuDong ?? {}),
      ...(viewAsCap ? { view_as: viewAsCap } : {}),
    };

    const admin = createAdminClient();
    const { error } = await admin.from("nhat_ky_hoat_dong").insert({
      email: email || "System",
      ho_ten: hoTen || "Hệ thống",
      auth_user_id: authUserId,
      phan_he: input.phanHe,
      hanh_dong: input.hanhDong,
      doi_tuong_id: input.doiTuongId ? String(input.doiTuongId) : null,
      chi_tiet_ngan: input.chiTietNgan,
      du_lieu_dong: duLieuDong,
      trang_thai: input.trangThai ?? "Thành công",
    });

    if (error) {
      console.error("[nhat_ky] insert:", error.message);
    }
  } catch (err) {
    console.error("[nhat_ky]", err);
  }
}
