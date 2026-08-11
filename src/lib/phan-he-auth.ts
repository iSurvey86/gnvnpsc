import { isTruongPhong } from "@/lib/chuc-danh";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  canWriteVaiTro,
  isPhanHeCode,
  type PhanHeCode,
  type VaiTroPhanHe,
} from "@/lib/phan-he";
import {
  getSessionProfile,
  type SessionProfile,
} from "@/lib/session";

export type ActorInfo = {
  userId: string;
  email: string;
  hoTen: string;
  nhanSuId: string | null;
  isAdmin: boolean;
};

export function toActor(profile: SessionProfile): ActorInfo {
  return {
    userId: profile.userId,
    email: profile.email,
    // Nhật ký luôn ghi Admin thật khi đang xem với quyền
    hoTen: profile.actorHoTen || profile.nhanSu?.ho_ten?.trim() || profile.email,
    nhanSuId:
      profile.viewAs && profile.nhanSu?.id?.startsWith("view-as-")
        ? null
        : (profile.nhanSu?.id ?? null),
    isAdmin: profile.realIsAdmin,
  };
}

/** Xóa hồ sơ Giao A trên danh sách — chỉ Admin hoặc Trưởng phòng. */
export function canXoaHoSoGiaoA(profile: SessionProfile): boolean {
  if (profile.viewAs === "truong_phong") return true;
  if (profile.viewAs) return false;
  if (profile.isAdmin) return true;
  return isTruongPhong(profile.nhanSu?.chuc_danh);
}

export async function requireSession(): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) {
    throw new AuthError("Chưa đăng nhập", 401);
  }
  return profile;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

/**
 * Quyền trên phân hệ.
 * - Admin: full write mọi PH
 * - Có dòng nhan_su_phan_he: theo vai_tro_phan_he
 * - Chưa có dòng nào: tương thích — ghi được TVTK, xem được PH khác
 */
export async function getPhanHeRole(
  profile: SessionProfile,
  phanHe: PhanHeCode,
): Promise<VaiTroPhanHe | "admin" | null> {
  // «Xem với quyền»: cả 3 tổ được thao tác thật theo cấp giả lập
  if (profile.viewAs === "truong_phong") return "manager";
  if (profile.viewAs === "pho_phong" || profile.viewAs === "nhan_vien") {
    return "assigner";
  }

  if (profile.isAdmin) return "admin";
  if (!profile.nhanSu?.id) {
    // Chưa map nhân sự: chỉ xem
    return null;
  }
  // Trưởng phòng phụ trách chung: quản lý, xem và thao tác cả 3 phân hệ.
  if (isTruongPhong(profile.nhanSu.chuc_danh)) {
    return "manager";
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("nhan_su_phan_he")
    .select("phan_he, vai_tro_phan_he, active")
    .eq("nhan_su_id", profile.nhanSu.id)
    .eq("active", true);

  const rows = (data ?? []) as Array<{
    phan_he: string;
    vai_tro_phan_he: string;
  }>;

  if (rows.length === 0) {
    // Tương thích giai đoạn chuyển: mặc định assigner TVTK
    return phanHe === "tvtk" ? "assigner" : "viewer";
  }

  const hit = rows.find((r) => r.phan_he === phanHe);
  if (!hit) return "viewer";
  const v = hit.vai_tro_phan_he;
  if (
    v === "viewer" ||
    v === "scanner" ||
    v === "assigner" ||
    v === "manager"
  ) {
    return v;
  }
  return "viewer";
}

export async function requireWritePhanHe(
  phanHe: PhanHeCode,
): Promise<{ profile: SessionProfile; actor: ActorInfo }> {
  const profile = await requireSession();
  const role = await getPhanHeRole(profile, phanHe);
  if (role === "admin" || canWriteVaiTro(role)) {
    return { profile, actor: toActor(profile) };
  }
  throw new AuthError(
    `Không có quyền thao tác trên phân hệ ${phanHe}. Chỉ được xem.`,
    403,
  );
}

export function parsePhanHeParam(
  v: string | null | undefined,
): PhanHeCode {
  if (isPhanHeCode(v)) return v;
  return "tvtk";
}
