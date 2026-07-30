/** Phân hệ sau đăng nhập — rẽ nhánh nghiệp vụ */

export type PhanHeCode = "tvtk" | "thi_nghiem" | "tvgs";

export const PHAN_HE = {
  tvtk: {
    code: "tvtk" as const,
    href: "/tvtk",
    title: "Tư vấn thiết kế",
    short: "TVTK",
    desc: "Giao A → danh mục dự án → QĐ giao Xí nghiệp (luồng hiện tại).",
  },
  thi_nghiem: {
    code: "thi_nghiem" as const,
    href: "/thi-nghiem",
    title: "Thí nghiệm",
    short: "TN",
    desc: "Phân hệ thí nghiệm — đang xây dựng.",
  },
  tvgs: {
    code: "tvgs" as const,
    href: "/tvgs",
    title: "Tư vấn giám sát",
    short: "TVGS",
    desc: "Phân hệ tư vấn giám sát — đang xây dựng.",
  },
} as const;

/** Đường dẫn thuộc luồng TVTK (sidebar nghiệp vụ). */
export function isTvtkPath(pathname: string): boolean {
  return (
    pathname === "/tvtk" ||
    pathname.startsWith("/tvtk/") ||
    pathname.startsWith("/du-an") ||
    pathname.startsWith("/qd-giao-xn") ||
    pathname.startsWith("/nhap-du-an") ||
    pathname.startsWith("/giao-a")
  );
}

export function isHubPath(pathname: string): boolean {
  return pathname === "/";
}
