import { normalizeTenDuAn } from "@/lib/du-an-trung";

function khongDau(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Danh xưng Giám đốc Xí nghiệp trên Điều 3 mẫu Word.
 * Xí nghiệp DVĐL Tuyên Quang: Giám đốc nữ → Bà; các XN khác → Ông.
 * (Giữ nhận diện «Hà Giang» nếu còn dữ liệu cũ sau sáp nhập.)
 */
export function danhXungGiamDocXn(
  tenXiNghiep: string | null | undefined,
): "Ông" | "Bà" {
  const k = khongDau(normalizeTenDuAn(tenXiNghiep));
  if (k.includes("tuyen quang") || k.includes("ha giang")) return "Bà";
  return "Ông";
}
