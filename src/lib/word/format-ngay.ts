/** `2026-07-26` → `ngày 26 tháng 7 năm 2026` */
export function formatNgayBanHanhChu(
  isoDate: string | null | undefined,
): string {
  if (!isoDate) return "ngày … tháng … năm …";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return "ngày … tháng … năm …";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return `ngày ${d} tháng ${mo} năm ${y}`;
}

export function yearFromDateOrDefault(
  isoDate: string | null | undefined,
  fallback = new Date().getFullYear(),
): string {
  if (!isoDate) return String(fallback);
  const m = /^(\d{4})/.exec(isoDate.trim());
  return m ? m[1] : String(fallback);
}
