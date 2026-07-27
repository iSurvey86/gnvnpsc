/** Mật khẩu mặc định khi cấp đăng nhập từ danh mục Nhân sự (user thường) */
export function defaultUserPassword(): string {
  return process.env.DEFAULT_USER_PASSWORD?.trim() || "Gnvnpsc@2026";
}

/** Mật khẩu tài khoản Admin hệ thống */
export function defaultAdminPassword(): string {
  return process.env.DEFAULT_ADMIN_PASSWORD?.trim() || "Admin@123";
}

export const ADMIN_EMAIL = "admin@gnvnpsc.local";

/** Alias đăng nhập Admin: "Admin" → email Auth phía sau */
const ADMIN_ALIASES = new Set([
  "admin",
  "administrator",
  "quantri",
  "quản trị",
]);

/**
 * Chuẩn hóa ô đăng nhập → email Supabase Auth.
 * Admin chỉ cần gõ Admin; user thường vẫn nhập đủ email.
 */
export function resolveLoginIdentifier(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  const lower = s.toLowerCase();
  if (ADMIN_ALIASES.has(lower) || lower === ADMIN_EMAIL) {
    return ADMIN_EMAIL;
  }
  return lower;
}
