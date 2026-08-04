/**
 * Chuẩn Việt Nam trên giao diện: `2026-04-14` → `14/04/2026`.
 * Giữ nguyên chuỗi nếu không khớp YYYY-MM-DD.
 */
export function formatNgayVN(
  isoDate: string | null | undefined,
  empty = "—",
): string {
  if (!isoDate?.trim()) return empty;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return isoDate.trim();
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Ngày trống trên Word / in → khoảng trắng (Doffice / điền tay sau). */
const NGAY_BAN_HANH_TRONG = "ngày        tháng        năm        ";

/** `2026-07-26` → `ngày 26 tháng 7 năm 2026` (văn bản / Word) */
export function formatNgayBanHanhChu(
  isoDate: string | null | undefined,
): string {
  if (!isoDate?.trim()) return NGAY_BAN_HANH_TRONG;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return NGAY_BAN_HANH_TRONG;
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
