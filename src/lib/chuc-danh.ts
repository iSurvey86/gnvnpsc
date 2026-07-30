/** Nhận diện cấp quản lý từ chức danh tự do trong danh bạ nhân sự */

function normalize(chucDanh: string | null | undefined): string {
  return (chucDanh ?? "").toLocaleLowerCase("vi");
}

/** Phó Trưởng phòng — phụ trách tổ được phân công, không phải toàn phòng */
export function isPhoPhong(chucDanh: string | null | undefined): boolean {
  const text = normalize(chucDanh);
  return text.includes("phó") && text.includes("phòng");
}

/** Trưởng phòng — phụ trách chung cả 3 tổ */
export function isTruongPhong(chucDanh: string | null | undefined): boolean {
  const text = normalize(chucDanh);
  return text.includes("trưởng phòng") && !isPhoPhong(chucDanh);
}

export function nhanLabelChucDanh(
  vaiTro: string | null | undefined,
  chucDanh: string | null | undefined,
): "Admin" | "Trưởng phòng" | "Phó phòng" | "Nhân viên" {
  if (vaiTro === "admin") return "Admin";
  if (isTruongPhong(chucDanh)) return "Trưởng phòng";
  if (isPhoPhong(chucDanh)) return "Phó phòng";
  return "Nhân viên";
}
