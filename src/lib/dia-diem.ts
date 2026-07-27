/** Chuẩn hóa địa điểm hiển thị: bỏ tiền tố Tỉnh / TP / Thành phố. */

export function normalizeDiaDiem(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  let s = raw.trim().replace(/\s+/g, " ");
  if (!s) return null;

  s = s
    .replace(/^(tỉnh|tinh)\s+/i, "")
    .replace(/^(thành\s*phố|thanh\s*pho|tp\.?)\s*/i, "")
    .trim();

  return s || null;
}
