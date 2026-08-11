import {
  chucDanhFromCapQuanLy,
  type CapQuanLy,
} from "@/lib/chuc-danh";

/** Cookie chế độ Admin «Xem với quyền» — không đổi phân quyền DB */
export const VIEW_AS_COOKIE = "gnvnpsc_view_as";

export type ViewAsCap = CapQuanLy;

export type ViewAsPreset = {
  id: ViewAsCap;
  ma_nv: string;
  ho_ten: string;
  label: string;
  chuc_danh: string;
  mo_ta: string;
};

/** Persona cố định — giả lập cả 3 tổ TV / TN / GS */
export const VIEW_AS_PRESETS: ViewAsPreset[] = [
  {
    id: "truong_phong",
    ma_nv: "TEST_TP",
    ho_ten: "Test_TruongPhong",
    label: "Trưởng phòng",
    chuc_danh: chucDanhFromCapQuanLy("truong_phong"),
    mo_ta: "Trưởng phòng — cả 3 tổ",
  },
  {
    id: "pho_phong",
    ma_nv: "TEST_PP",
    ho_ten: "Test_PhoPhong",
    label: "Phó phòng",
    chuc_danh: chucDanhFromCapQuanLy("pho_phong"),
    mo_ta: "Phó phòng — cả 3 tổ",
  },
  {
    id: "nhan_vien",
    ma_nv: "TEST_NV",
    ho_ten: "Test_NhanVien",
    label: "Nhân viên",
    chuc_danh: chucDanhFromCapQuanLy("nhan_vien"),
    mo_ta: "Nhân viên — cả 3 tổ",
  },
];

export function parseViewAsCap(
  value: string | null | undefined,
): ViewAsCap | null {
  if (
    value === "truong_phong" ||
    value === "pho_phong" ||
    value === "nhan_vien"
  ) {
    return value;
  }
  return null;
}

export function getViewAsPreset(cap: ViewAsCap): ViewAsPreset {
  const found = VIEW_AS_PRESETS.find((p) => p.id === cap);
  if (!found) {
    throw new Error(`Persona xem quyền không hợp lệ: ${cap}`);
  }
  return found;
}

export function viewAsCookieOptions(maxAgeSec = 60 * 60 * 12) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSec,
  };
}
