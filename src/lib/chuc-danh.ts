/** Nhận diện cấp quản lý từ chức danh tự do trong danh bạ nhân sự */

function normalize(chucDanh: string | null | undefined): string {
  return (chucDanh ?? "").toLocaleLowerCase("vi");
}

/** Cấp phân quyền nghiệp vụ (không gồm Admin hệ thống) */
export type CapQuanLy = "truong_phong" | "pho_phong" | "nhan_vien";

export const CAP_QUAN_LY_OPTIONS: Array<{ value: CapQuanLy; label: string }> = [
  { value: "truong_phong", label: "Trưởng phòng" },
  { value: "pho_phong", label: "Phó phòng" },
  { value: "nhan_vien", label: "Nhân viên" },
];

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

export function capQuanLyFromChucDanh(
  chucDanh: string | null | undefined,
): CapQuanLy {
  if (isTruongPhong(chucDanh)) return "truong_phong";
  if (isPhoPhong(chucDanh)) return "pho_phong";
  return "nhan_vien";
}

/** Chuẩn hóa chức danh khi Admin chọn cấp từ dropdown */
export function chucDanhFromCapQuanLy(cap: CapQuanLy): string {
  switch (cap) {
    case "truong_phong":
      return "Trưởng phòng Kinh doanh";
    case "pho_phong":
      return "Phó Trưởng phòng Kinh doanh";
    case "nhan_vien":
      return "Nhân viên";
  }
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
