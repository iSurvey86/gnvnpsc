import type { CapDienAp, HuongGiao } from "@/lib/types";

/** Loại hình tư vấn trên danh mục / giao nhiệm vụ */
export type LoaiHinhTuVan = "tvtk_110" | "tvtk_tha" | "tnhc";

export const LOAI_HINH_TU_VAN_OPTIONS: Array<{
  value: LoaiHinhTuVan;
  label: string;
}> = [
  { value: "tvtk_110", label: "TVTK 110kV" },
  { value: "tvtk_tha", label: "TVTK THA" },
  { value: "tnhc", label: "TNHC" },
];

export function labelLoaiHinhTuVan(v: LoaiHinhTuVan): string {
  return LOAI_HINH_TU_VAN_OPTIONS.find((o) => o.value === v)?.label ?? "—";
}

/** Nhãn ngắn trên bảng danh mục (cột hẹp) */
export function shortLoaiHinhTuVan(v: LoaiHinhTuVan): string {
  if (v === "tvtk_110") return "110kV";
  if (v === "tvtk_tha") return "THA";
  if (v === "tnhc") return "TN";
  return "—";
}

/**
 * Suy loại hình từ hướng giao + cấp điện áp.
 * - TNHC khi hướng TN / TVTK&TN
 * - TVTK 110kV / TVTK THA khi hướng TVTK (hoặc chưa chọn hướng nhưng đã có cấp)
 */
export function resolveLoaiHinhTuVan(
  huong: HuongGiao | null | undefined,
  cap: CapDienAp | null | undefined,
): LoaiHinhTuVan[] {
  const out: LoaiHinhTuVan[] = [];
  const wantTn = huong === "tn" || huong === "tvtk_tn";
  const wantTvtk =
    huong === "tvtk" || huong === "tvtk_tn" || (!huong && Boolean(cap));

  if (wantTvtk) {
    if (cap === "110kv") out.push("tvtk_110");
    else if (cap === "trung_ha_ap") out.push("tvtk_tha");
  }
  if (wantTn) out.push("tnhc");
  return out;
}

export function badgeClassLoaiHinh(v: LoaiHinhTuVan): string {
  if (v === "tvtk_110") return "bg-sky-50 text-sky-800";
  if (v === "tvtk_tha") return "bg-emerald-50 text-emerald-800";
  return "bg-violet-50 text-violet-800";
}
