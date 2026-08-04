/** Phân hệ sau đăng nhập — cấu hình nghiệp vụ + theme UI */

export type PhanHeCode = "tvtk" | "thi_nghiem" | "tvgs";

export type VaiTroPhanHe = "viewer" | "scanner" | "assigner" | "manager";

/** Hậu tố mã dự án theo phân hệ */
export const PHAN_HE_MA_SUFFIX: Record<PhanHeCode, "TV" | "TN" | "GS"> = {
  tvtk: "TV",
  thi_nghiem: "TN",
  tvgs: "GS",
};

export type PhanHeTheme = {
  /** Nhãn ngắn trên header bảng */
  label: string;
  /** Classes Tailwind — tông nhận diện phân hệ */
  primary: string;
  primaryText: string;
  headerBg: string;
  headerText: string;
  border: string;
  softBg: string;
  softText: string;
  rowOdd: string;
  rowEven: string;
  rowHover: string;
  chip: string;
  btnPrimary: string;
  btnOutline: string;
  filterBorder: string;
  filterBg: string;
  searchBorder: string;
  searchBg: string;
  footerBg: string;
  footerText: string;
  hubBar: string;
  hubBox: string;
  hubLabel: string;
  hubTitle: string;
  hubDesc: string;
  hubCta: string;
  hubArrow: string;
};

export type PhanHeConfig = {
  code: PhanHeCode;
  href: string;
  title: string;
  titleFull: string;
  short: string;
  desc: string;
  maSuffix: "TV" | "TN" | "GS";
  /** Loại QĐ giao XN mặc định khi soạn trong phân hệ */
  defaultLoaiGiao: "tvtk" | "thi_nghiem" | "tvgs";
  homeAfterSave: string;
  nhapDuAnHref: string;
  theme: PhanHeTheme;
};

const themeTvtk: PhanHeTheme = {
  label: "teal",
  primary: "bg-teal-700",
  primaryText: "text-teal-800",
  headerBg: "bg-teal-700",
  headerText: "text-white",
  border: "border-teal-200",
  softBg: "bg-teal-50",
  softText: "text-teal-800",
  rowOdd: "odd:bg-white",
  rowEven: "even:bg-[#eef8f5]",
  /** Hover/focus — cam nhạt (không dùng xanh) */
  rowHover: "hover:bg-[#fff3e8] focus-within:bg-[#fff3e8]",
  chip: "bg-teal-50 text-teal-800",
  btnPrimary:
    "border-2 border-teal-500 bg-teal-50 text-teal-800 hover:bg-teal-100",
  btnOutline:
    "border border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
  filterBorder: "border-rose-200",
  filterBg: "bg-rose-50/80",
  searchBorder: "border-teal-200",
  searchBg: "bg-teal-50/80",
  footerBg: "bg-[#ecfdf5]",
  footerText: "text-teal-800/70",
  hubBar: "bg-sky-500",
  hubBox:
    "border-sky-200 bg-gradient-to-br from-sky-50 via-sky-50/70 to-cyan-50",
  hubLabel: "text-sky-600",
  hubTitle: "text-sky-950",
  hubDesc: "text-sky-800/75",
  hubCta: "text-sky-700",
  hubArrow: "text-sky-300 group-hover:text-sky-500",
};

const themeTn: PhanHeTheme = {
  label: "indigo",
  primary: "bg-indigo-700",
  primaryText: "text-indigo-800",
  headerBg: "bg-indigo-700",
  headerText: "text-white",
  border: "border-indigo-200",
  softBg: "bg-indigo-50",
  softText: "text-indigo-800",
  rowOdd: "odd:bg-white",
  rowEven: "even:bg-[#eef0fb]",
  rowHover: "hover:bg-[#e0e4f8]",
  chip: "bg-indigo-50 text-indigo-800",
  btnPrimary:
    "border-2 border-indigo-500 bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
  btnOutline:
    "border border-indigo-200 bg-white text-indigo-800 hover:bg-indigo-50",
  filterBorder: "border-violet-200",
  filterBg: "bg-violet-50/80",
  searchBorder: "border-indigo-200",
  searchBg: "bg-indigo-50/80",
  footerBg: "bg-[#eef2ff]",
  footerText: "text-indigo-800/70",
  hubBar: "bg-indigo-500",
  hubBox:
    "border-indigo-200 bg-gradient-to-br from-indigo-50 via-indigo-50/70 to-violet-50",
  hubLabel: "text-indigo-600",
  hubTitle: "text-indigo-950",
  hubDesc: "text-indigo-800/75",
  hubCta: "text-indigo-700",
  hubArrow: "text-indigo-300 group-hover:text-indigo-500",
};

const themeTvgs: PhanHeTheme = {
  label: "amber",
  primary: "bg-amber-700",
  primaryText: "text-amber-900",
  /** Tiêu đề bảng: xanh nhạt (không chóe, không xám) */
  headerBg: "bg-sky-100",
  headerText: "text-sky-950",
  border: "border-amber-200",
  softBg: "bg-amber-50",
  softText: "text-amber-900",
  rowOdd: "odd:bg-white",
  rowEven: "even:bg-[#fbf6ee]",
  rowHover: "hover:bg-[#f5ecda]",
  chip: "bg-amber-50 text-amber-900",
  btnPrimary:
    "border-2 border-amber-500 bg-amber-50 text-amber-900 hover:bg-amber-100",
  btnOutline:
    "border border-amber-200 bg-white text-amber-900 hover:bg-amber-50",
  filterBorder: "border-orange-200",
  filterBg: "bg-orange-50/80",
  searchBorder: "border-amber-200",
  searchBg: "bg-amber-50/80",
  footerBg: "bg-[#fffbeb]",
  footerText: "text-amber-900/70",
  hubBar: "bg-amber-500",
  hubBox:
    "border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50/70 to-orange-50",
  hubLabel: "text-amber-700",
  hubTitle: "text-amber-950",
  hubDesc: "text-amber-900/70",
  hubCta: "text-amber-700",
  hubArrow: "text-amber-300 group-hover:text-amber-500",
};

export const PHAN_HE: Record<PhanHeCode, PhanHeConfig> = {
  tvtk: {
    code: "tvtk",
    href: "/tvtk",
    title: "Tư vấn thiết kế",
    titleFull: "Giao nhiệm vụ tư vấn thiết kế",
    short: "TVTK",
    desc: "Giao A → danh mục dự án → QĐ giao Xí nghiệp (TVTK).",
    maSuffix: "TV",
    defaultLoaiGiao: "tvtk",
    homeAfterSave: "/tvtk",
    nhapDuAnHref: "/tvtk/nhap-du-an",
    theme: themeTvtk,
  },
  thi_nghiem: {
    code: "thi_nghiem",
    href: "/thi-nghiem",
    title: "Thí nghiệm hiệu chỉnh",
    titleFull: "Giao nhiệm vụ thí nghiệm hiệu chỉnh",
    short: "TN",
    desc: "Giao A → danh mục dự án → QĐ giao Xí nghiệp (TN).",
    maSuffix: "TN",
    defaultLoaiGiao: "thi_nghiem",
    homeAfterSave: "/thi-nghiem",
    nhapDuAnHref: "/thi-nghiem/nhap-du-an",
    theme: themeTn,
  },
  tvgs: {
    code: "tvgs",
    href: "/tvgs",
    title: "Tư vấn giám sát",
    titleFull: "Giao nhiệm vụ tư vấn giám sát",
    short: "TVGS",
    desc: "Giao A → danh mục dự án → QĐ giao Xí nghiệp (TVGS).",
    maSuffix: "GS",
    defaultLoaiGiao: "tvgs",
    homeAfterSave: "/tvgs",
    nhapDuAnHref: "/tvgs/nhap-du-an",
    theme: themeTvgs,
  },
};

export function isPhanHeCode(v: unknown): v is PhanHeCode {
  return v === "tvtk" || v === "thi_nghiem" || v === "tvgs";
}

export function parsePhanHe(
  v: string | null | undefined,
  fallback: PhanHeCode = "tvtk",
): PhanHeCode {
  return isPhanHeCode(v) ? v : fallback;
}

/** Đường dẫn thuộc luồng TVTK (sidebar nghiệp vụ). */
export function isTvtkPath(pathname: string): boolean {
  return (
    pathname === "/tvtk" ||
    pathname.startsWith("/tvtk/") ||
    (pathname.startsWith("/du-an") && !pathname.includes("?")) ||
    pathname.startsWith("/qd-giao-xn") ||
    pathname === "/nhap-du-an" ||
    pathname.startsWith("/giao-a")
  );
}

export function isThiNghiemPath(pathname: string): boolean {
  return pathname === "/thi-nghiem" || pathname.startsWith("/thi-nghiem/");
}

export function isTvgsPath(pathname: string): boolean {
  return pathname === "/tvgs" || pathname.startsWith("/tvgs/");
}

export function resolvePhanHeFromPath(pathname: string): PhanHeCode | null {
  if (isThiNghiemPath(pathname)) return "thi_nghiem";
  if (isTvgsPath(pathname)) return "tvgs";
  if (isTvtkPath(pathname) || pathname === "/tvtk") return "tvtk";
  return null;
}

export function isHubPath(pathname: string): boolean {
  return pathname === "/";
}

/** Quyền ghi (quét / sửa / giao) — manager ⊇ assigner ⊇ scanner */
export function canWriteVaiTro(v: VaiTroPhanHe | null | undefined): boolean {
  return v === "scanner" || v === "assigner" || v === "manager";
}

export function canAssignVaiTro(v: VaiTroPhanHe | null | undefined): boolean {
  return v === "assigner" || v === "manager";
}
