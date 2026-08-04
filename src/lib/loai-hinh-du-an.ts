import type { CapDienAp } from "@/lib/cap-dien-ap";

/**
 * Loại hình dự án:
 * - `110kv` — hệ thống tự đặt cho dự án 110kV, người nhập không chọn
 * - `xdm` / `cai_tao` / `scmba` / `dms` — bắt buộc chọn với dự án trung hạ áp
 */
export type LoaiHinhDuAn =
  | "110kv"
  | "xdm"
  | "cai_tao"
  | "scmba"
  | "dms";

type Option = { value: LoaiHinhDuAn; label: string; short: string };

/** Các loại hình người nhập được chọn (chỉ áp dụng trung hạ áp) */
export const LOAI_HINH_THA_OPTIONS: Option[] = [
  { value: "xdm", label: "XDM — Xây dựng mới", short: "XDM" },
  { value: "cai_tao", label: "Cải tạo", short: "Cải tạo" },
  { value: "scmba", label: "SCMBA — Sửa chữa máy biến áp", short: "SCMBA" },
  { value: "dms", label: "DMS", short: "DMS" },
];

export const LOAI_HINH_110KV: Option = {
  value: "110kv",
  label: "110 kV",
  short: "110kV",
};

/** Toàn bộ loại hình — dùng cho bộ lọc, hiển thị */
export const LOAI_HINH_DU_AN_OPTIONS: Option[] = [
  LOAI_HINH_110KV,
  ...LOAI_HINH_THA_OPTIONS,
];

const VALID = new Set<string>([
  "110kv",
  "xdm",
  "cai_tao",
  "scmba",
  "dms",
]);

export function isLoaiHinhDuAn(v: unknown): v is LoaiHinhDuAn {
  return typeof v === "string" && VALID.has(v);
}

export function parseLoaiHinhDuAn(
  raw: string | null | undefined,
): LoaiHinhDuAn | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  // Dữ liệu cũ CQT → coi như chưa chọn hợp lệ (đã migrate SQL 020)
  if (s === "cqt") return null;
  return isLoaiHinhDuAn(s) ? s : null;
}

/** Dự án 110kV thì loại hình do hệ thống đặt, không cho người nhập chọn */
export function laDuAn110kv(
  capDienAp: CapDienAp | string | null | undefined,
): boolean {
  return capDienAp === "110kv";
}

/**
 * Loại hình cuối cùng theo cấp điện áp:
 * 110kV → luôn `110kv`; trung hạ áp → giữ lựa chọn của người nhập.
 */
export function resolveLoaiHinhDuAn(
  capDienAp: CapDienAp | string | null | undefined,
  chon: string | null | undefined,
): LoaiHinhDuAn | null {
  if (laDuAn110kv(capDienAp)) return "110kv";
  const parsed = parseLoaiHinhDuAn(chon);
  return parsed === "110kv" ? null : parsed;
}

export function labelLoaiHinhDuAn(v: string | null | undefined): string {
  if (v === "cqt") return "CQT (cũ) — cần chọn lại";
  return LOAI_HINH_DU_AN_OPTIONS.find((o) => o.value === v)?.label ?? "—";
}

export function shortLoaiHinhDuAn(v: string | null | undefined): string {
  if (v === "cqt") return "CQT?";
  return LOAI_HINH_DU_AN_OPTIONS.find((o) => o.value === v)?.short ?? "—";
}
