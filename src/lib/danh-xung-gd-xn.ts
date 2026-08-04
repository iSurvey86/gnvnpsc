import { normalizeTenDuAn } from "@/lib/du-an-trung";

function khongDau(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Danh xưng Giám đốc Xí nghiệp trên Điều 3 mẫu Word.
 * Hiện chỉ Xí nghiệp DVĐL Hà Giang là nữ (Bà); các XN khác là Ông.
 */
export function danhXungGiamDocXn(
  tenXiNghiep: string | null | undefined,
): "Ông" | "Bà" {
  const k = khongDau(normalizeTenDuAn(tenXiNghiep));
  if (k.includes("ha giang")) return "Bà";
  return "Ông";
}
