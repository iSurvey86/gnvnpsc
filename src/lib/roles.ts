import { defaultAdminPassword, defaultUserPassword } from "@/lib/auth-defaults";

export type VaiTro = "admin" | "user";

export function isAdminRole(v: string | null | undefined): boolean {
  return v === "admin";
}

/** Mật khẩu khi cấp login theo vai trò */
export function passwordForRole(vaiTro: string | null | undefined): string {
  return isAdminRole(vaiTro) ? defaultAdminPassword() : defaultUserPassword();
}
