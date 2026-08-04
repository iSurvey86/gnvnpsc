import type {
  CapDienAp,
  LoaiGiaoXn,
  LoaiHinhDuAn,
  PhuLucCongTrinh,
} from "@/lib/types";
import { removeVietnameseTones } from "@/lib/ma-du-an";
import {
  tinhFromDiaDiem,
  tinhFromTenPcTinh,
} from "@/lib/soan-qd-defaults";

/** XDM / Cải tạo — giá trị HĐ = 3,3% × TMĐT */
export const TY_LE_GHD_XDM_CAI_TAO = 0.033;
/** SCMBA / DMS — giá trị HĐ = 1,5% × TMĐT */
export const TY_LE_GHD_SCMBA_DMS = 0.015;

/** Alias — giữ tương thích import cũ */
export const TY_LE_GHD_CQT = TY_LE_GHD_XDM_CAI_TAO;
export const TY_LE_L1_TVTK_THA = TY_LE_GHD_XDM_CAI_TAO;

/** Cùng tỉnh (Chủ đầu tư ↔ Xí nghiệp) → tạm ứng 15% × GHĐ */
export const TY_LE_TAM_UNG_CUNG_TINH = 0.15;
/** Khác tỉnh → tạm ứng 16% × GHĐ */
export const TY_LE_TAM_UNG_KHAC_TINH = 0.16;

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

  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Tỷ lệ Giá trị hợp đồng theo loại hình dự án (chỉ THA). */
export function tyLeGiaTriHopDong(
  loaiHinh: LoaiHinhDuAn | string | null | undefined,
): number | null {
  if (loaiHinh === "xdm" || loaiHinh === "cai_tao" || loaiHinh === "cqt")
    return TY_LE_GHD_XDM_CAI_TAO;
  if (loaiHinh === "scmba" || loaiHinh === "dms") return TY_LE_GHD_SCMBA_DMS;
  return null;
}

/**
 * @deprecated Dùng tyLeGiaTriHopDong(loaiHinh) — mặc định XDM/Cải tạo 3,3% khi chưa biết loại hình.
 */
export function tyLeChiPhiL1(
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
  loaiHinh?: LoaiHinhDuAn | null,
): number | null {
  if (loai !== "tvtk" || cap !== "trung_ha_ap") return null;
  return tyLeGiaTriHopDong(loaiHinh) ?? TY_LE_GHD_XDM_CAI_TAO;
}

export function shouldTinhTienGiao(
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
): boolean {
  return loai === "tvtk" && cap === "trung_ha_ap";
}

export function tyLeTamUngTheoDiaBan(cungDiaBan: boolean): number {
  return cungDiaBan ? TY_LE_TAM_UNG_CUNG_TINH : TY_LE_TAM_UNG_KHAC_TINH;
}

/**
 * Cùng địa bàn tỉnh: tên tỉnh từ Chủ đầu tư (PC) có trong tên Xí nghiệp.
 * Không suy ra được → coi là khác địa bàn (16%).
 */
export function laCungDiaBanTinh(opts: {
  tenPcTinh?: string | null;
  tenXiNghiep?: string | null;
  diaDiemDuAn?: string | null;
}): boolean {
  const tinh =
    tinhFromTenPcTinh(opts.tenPcTinh) || tinhFromDiaDiem(opts.diaDiemDuAn);
  const tenXn = opts.tenXiNghiep?.trim();
  if (!tinh || !tenXn) return false;
  const tinhKey = removeVietnameseTones(tinh).toLowerCase().trim();
  if (!tinhKey) return false;
  const xnKey = removeVietnameseTones(tenXn).toLowerCase();
  return xnKey.includes(tinhKey);
}

export type DongTinhTien = {
  stt: number | string;
  ct_ten: string;
  ct_tmdt: string;
  ct_tmdt_so: number | null;
  /** Giá trị hợp đồng (= L1 / chi phí lần 01) */
  ct_chi_phi_l1: string;
  ct_chi_phi_l1_so: number | null;
  ct_gia_tri_hd: string;
  ct_gia_tri_hd_so: number | null;
  ct_gia_tri_tam_ung: string;
  ct_gia_tri_tam_ung_so: number | null;
  ty_le: number | null;
  ty_le_tam_ung: number | null;
};

export type KetQuaTinhTien = {
  ty_le: number | null;
  ty_le_tam_ung: number | null;
  cung_dia_ban: boolean;
  rows: DongTinhTien[];
  tong_tmdt: string;
  tong_tmdt_so: number | null;
  tong_chi_phi_l1: string;
  tong_chi_phi_l1_so: number | null;
  tong_gia_tri_hd: string;
  tong_gia_tri_hd_so: number | null;
  tong_gia_tri_tam_ung: string;
  tong_gia_tri_tam_ung_so: number | null;
};

/**
 * Tính Giá trị HĐ + tạm ứng theo dòng từ phụ lục (TVTK THA).
 * - GHĐ: XDM/Cải tạo 3,3% × TMĐT; SCMBA/DMS 1,5% × TMĐT
 * - Tạm ứng: cùng tỉnh 15% × GHĐ; khác tỉnh 16% × GHĐ
 */
export function tinhChiPhiL1TuPhuLuc(opts: {
  loai: LoaiGiaoXn;
  cap: CapDienAp | null | undefined;
  cong_trinh: PhuLucCongTrinh[];
  tmdtOverrides?: Array<string | null | undefined>;
  loaiHinhDuAn?: LoaiHinhDuAn | null;
  cungDiaBan?: boolean;
}): KetQuaTinhTien {
  const apDung = shouldTinhTienGiao(opts.loai, opts.cap);
  const ty_le = apDung
    ? (tyLeGiaTriHopDong(opts.loaiHinhDuAn) ?? TY_LE_GHD_CQT)
    : null;
  const cung_dia_ban = Boolean(opts.cungDiaBan);
  const ty_le_tam_ung =
    ty_le != null ? tyLeTamUngTheoDiaBan(cung_dia_ban) : null;

  const rows: DongTinhTien[] = opts.cong_trinh.map((r, i) => {
    const override = opts.tmdtOverrides?.[i];
    const tmdtRaw =
      override !== undefined && override !== null && String(override).trim()
        ? String(override)
        : (r.ct_tmdt ?? "").toString();
    const tmdtSo = parseTrieuDong(tmdtRaw);
    let ghdSo: number | null = null;
    let ghdStr = "";
    let tuSo: number | null = null;
    let tuStr = "";
    if (ty_le != null && tmdtSo != null) {
      ghdSo = tmdtSo * ty_le;
      ghdStr = formatTrieuDong(ghdSo);
      if (ty_le_tam_ung != null) {
        tuSo = ghdSo * ty_le_tam_ung;
        tuStr = formatTrieuDong(tuSo);
      }
    }
    return {
      stt: r.stt ?? i + 1,
      ct_ten: (r.ct_ten ?? "").toString(),
      ct_tmdt: tmdtSo != null ? formatTrieuDong(tmdtSo) : tmdtRaw,
      ct_tmdt_so: tmdtSo,
      ct_chi_phi_l1: ghdStr,
      ct_chi_phi_l1_so: ghdSo,
      ct_gia_tri_hd: ghdStr,
      ct_gia_tri_hd_so: ghdSo,
      ct_gia_tri_tam_ung: tuStr,
      ct_gia_tri_tam_ung_so: tuSo,
      ty_le,
      ty_le_tam_ung,
    };
  });

  const tongTmdtSo = rows.reduce<number | null>((acc, r) => {
    if (r.ct_tmdt_so == null) return acc;
    return (acc ?? 0) + r.ct_tmdt_so;
  }, null);

  const tongGhdSo =
    ty_le == null
      ? null
      : rows.reduce<number | null>((acc, r) => {
          if (r.ct_gia_tri_hd_so == null) return acc;
          return (acc ?? 0) + r.ct_gia_tri_hd_so;
        }, null);

  const tongTuSo =
    ty_le_tam_ung == null
      ? null
      : rows.reduce<number | null>((acc, r) => {
          if (r.ct_gia_tri_tam_ung_so == null) return acc;
          return (acc ?? 0) + r.ct_gia_tri_tam_ung_so;
        }, null);

  return {
    ty_le,
    ty_le_tam_ung,
    cung_dia_ban,
    rows,
    tong_tmdt: tongTmdtSo != null ? formatTrieuDong(tongTmdtSo) : "",
    tong_tmdt_so: tongTmdtSo,
    tong_chi_phi_l1: tongGhdSo != null ? formatTrieuDong(tongGhdSo) : "",
    tong_chi_phi_l1_so: tongGhdSo,
    tong_gia_tri_hd: tongGhdSo != null ? formatTrieuDong(tongGhdSo) : "",
    tong_gia_tri_hd_so: tongGhdSo,
    tong_gia_tri_tam_ung: tongTuSo != null ? formatTrieuDong(tongTuSo) : "",
    tong_gia_tri_tam_ung_so: tongTuSo,
  };
}
