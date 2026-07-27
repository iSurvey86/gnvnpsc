import type { CapDienAp, LoaiGiaoXn, PhuLucCongTrinh } from "@/lib/types";

/** Hệ số chi phí L1 — TVTK trung hạ áp (XD mới & cải tạo) */
export const TY_LE_L1_TVTK_THA = 0.033;

/** Format số triệu đồng kiểu VN: 15.500,123 (làm tròn 3 chữ số thập phân nếu cần) */
export function formatTrieuDong(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "";
  const rounded = Math.round(n * 1000) / 1000;
  const [intPart, decPart] = rounded.toFixed(3).replace(/\.?0+$/, "").split(".");
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart ? `${withDots},${decPart}` : withDots;
}

/**
 * Parse TMĐT nhập / extract (triệu đồng).
 * Hỗ trợ: "15500", "15.500", "15.500,5", "15,5"
 */
export function parseTrieuDong(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : null;
  }
  let s = raw.trim().replace(/\s+/g, "");
  if (!s) return null;

  // Có cả dấu . và , → . là nghìn, , là thập phân (kiểu VN)
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    // Chỉ dấu phẩy → thập phân
    s = s.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    // Chỉ dấu chấm theo nhóm 3 → nghìn
    s = s.replace(/\./g, "");
  }
  // else: "15.5" hoặc số thuần — Number() hiểu được

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function tyLeChiPhiL1(
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
): number | null {
  if (loai === "tvtk" && cap === "trung_ha_ap") return TY_LE_L1_TVTK_THA;
  // 110kV: không tính; TN: pha sau
  return null;
}

export function shouldTinhTienGiao(
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
): boolean {
  return tyLeChiPhiL1(loai, cap) != null;
}

export type DongTinhTien = {
  stt: number | string;
  ct_ten: string;
  ct_tmdt: string;
  ct_tmdt_so: number | null;
  ct_chi_phi_l1: string;
  ct_chi_phi_l1_so: number | null;
  ty_le: number | null;
};

export type KetQuaTinhTien = {
  ty_le: number | null;
  rows: DongTinhTien[];
  tong_tmdt: string;
  tong_tmdt_so: number | null;
  tong_chi_phi_l1: string;
  tong_chi_phi_l1_so: number | null;
};

/**
 * Tính chi phí L1 theo dòng từ phụ lục.
 * 110kV / không áp dụng → rows giữ TMĐT, L1 trống.
 */
export function tinhChiPhiL1TuPhuLuc(opts: {
  loai: LoaiGiaoXn;
  cap: CapDienAp | null | undefined;
  cong_trinh: PhuLucCongTrinh[];
  /** Ghi đè TMĐT theo index (0-based) nếu user sửa trên form */
  tmdtOverrides?: Array<string | null | undefined>;
}): KetQuaTinhTien {
  const ty_le = tyLeChiPhiL1(opts.loai, opts.cap);
  const rows: DongTinhTien[] = opts.cong_trinh.map((r, i) => {
    const override = opts.tmdtOverrides?.[i];
    const tmdtRaw =
      override !== undefined && override !== null && String(override).trim()
        ? String(override)
        : (r.ct_tmdt ?? "").toString();
    const tmdtSo = parseTrieuDong(tmdtRaw);
    let l1So: number | null = null;
    let l1Str = "";
    if (ty_le != null && tmdtSo != null) {
      l1So = tmdtSo * ty_le;
      l1Str = formatTrieuDong(l1So);
    }
    return {
      stt: r.stt ?? i + 1,
      ct_ten: (r.ct_ten ?? "").toString(),
      ct_tmdt: tmdtSo != null ? formatTrieuDong(tmdtSo) : tmdtRaw,
      ct_tmdt_so: tmdtSo,
      ct_chi_phi_l1: l1Str,
      ct_chi_phi_l1_so: l1So,
      ty_le,
    };
  });

  const tongTmdtSo = rows.reduce<number | null>((acc, r) => {
    if (r.ct_tmdt_so == null) return acc;
    return (acc ?? 0) + r.ct_tmdt_so;
  }, null);

  const tongL1So =
    ty_le == null
      ? null
      : rows.reduce<number | null>((acc, r) => {
          if (r.ct_chi_phi_l1_so == null) return acc;
          return (acc ?? 0) + r.ct_chi_phi_l1_so;
        }, null);

  return {
    ty_le,
    rows,
    tong_tmdt: tongTmdtSo != null ? formatTrieuDong(tongTmdtSo) : "",
    tong_tmdt_so: tongTmdtSo,
    tong_chi_phi_l1: tongL1So != null ? formatTrieuDong(tongL1So) : "",
    tong_chi_phi_l1_so: tongL1So,
  };
}
