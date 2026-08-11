import { cookies } from "next/headers";
import { ADMIN_EMAIL } from "@/lib/auth-defaults";
import type { NhanSu, VaiTro } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getViewAsPreset,
  parseViewAsCap,
  VIEW_AS_COOKIE,
  type ViewAsCap,
} from "@/lib/view-as";

export type SessionProfile = {
  userId: string;
  email: string;
  nhanSu: NhanSu | null;
  vaiTro: VaiTro;
  /** Quyền hiệu lực (false khi đang «Xem với quyền») */
  isAdmin: boolean;
  /** Admin đăng nhập thật — dùng mở menu xem quyền / thoát */
  realIsAdmin: boolean;
  /** Persona đang giả lập; null = không xem */
  viewAs: ViewAsCap | null;
  /** Họ tên actor thật (nhật ký / banner thoát) */
  actorHoTen: string;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();
  const email = user.email.toLowerCase();
  const { data: ns } = await admin
    .from("nhan_su")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  const metaRole =
    (user.app_metadata?.vai_tro as string | undefined) ||
    (user.user_metadata?.vai_tro as string | undefined);

  const realIsAdmin =
    ns?.vai_tro === "admin" ||
    metaRole === "admin" ||
    email === ADMIN_EMAIL;

  const nhanSu = (ns as NhanSu | null) ?? null;
  const actorHoTen = nhanSu?.ho_ten?.trim() || user.email;

  const base: SessionProfile = {
    userId: user.id,
    email: user.email,
    nhanSu,
    vaiTro: realIsAdmin ? "admin" : "user",
    isAdmin: realIsAdmin,
    realIsAdmin,
    viewAs: null,
    actorHoTen,
  };

  if (!realIsAdmin) return base;

  const jar = await cookies();
  const cap = parseViewAsCap(jar.get(VIEW_AS_COOKIE)?.value);
  if (!cap) return base;

  const preset = getViewAsPreset(cap);
  const overlayNs: NhanSu = nhanSu
    ? {
        ...nhanSu,
        ma_nv: preset.ma_nv,
        ho_ten: preset.ho_ten,
        chuc_danh: preset.chuc_danh,
        vai_tro: "user",
      }
    : {
        id: `view-as-${cap}`,
        ma_nv: preset.ma_nv,
        ho_ten: preset.ho_ten,
        email: user.email,
        don_vi: "Phòng Kinh doanh",
        chuc_danh: preset.chuc_danh,
        dien_thoai: null,
        active: true,
        auth_user_id: user.id,
        da_cap_dang_nhap: true,
        goi_y_doi_mk: false,
        vai_tro: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

  return {
    ...base,
    nhanSu: overlayNs,
    vaiTro: "user",
    isAdmin: false,
    viewAs: cap,
  };
}
