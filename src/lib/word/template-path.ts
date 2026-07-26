import type { CapDienAp, LoaiGiaoXn } from "@/lib/types";
import path from "node:path";

/** Chọn file mẫu Word theo loại QĐ + cấp điện áp dự án. */
export function resolveQdGiaoXnTemplateFile(
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
): string {
  if (loai === "thi_nghiem") {
    return "qd-giao-nhiem-vu-tnhc.docx";
  }
  if (cap === "trung_ha_ap") {
    return "qd-giao-nhiem-vu-tvtk_tha.docx";
  }
  // Mặc định TVTK → mẫu 110 (kể cả khi chưa có cap — caller nên validate)
  return "qd-giao-nhiem-vu-tvtk_110.docx";
}

export function resolveQdGiaoXnTemplatePath(
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
): string {
  return path.join(
    process.cwd(),
    "public",
    "templates",
    resolveQdGiaoXnTemplateFile(loai, cap),
  );
}
