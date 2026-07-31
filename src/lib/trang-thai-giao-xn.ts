import type { TrangThaiQdXn } from "@/lib/types";

/** Nhãn trên danh mục dự án / thẻ giao nhiệm vụ */
export function labelTrangThaiGiaoXn(
  tt: TrangThaiQdXn | string | null | undefined,
): string {
  if (tt === "da_ban_hanh") return "Đã giao";
  if (tt === "trinh_gd") return "Đã có dự thảo";
  if (tt === "nhap") return "Đã có dự thảo";
  return "Đã có dự thảo";
}

export function laDaGiaoXn(
  tt: TrangThaiQdXn | string | null | undefined,
): boolean {
  return tt === "da_ban_hanh";
}
