import fs from "node:fs";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import type {
  CapDienAp,
  DuAn,
  LoaiGiaoXn,
  LoaiHinhDuAn,
  PhuLucCongTrinh,
  PhuLucGiaoA,
  QdGiaoA,
  XiNghiep,
} from "@/lib/types";
import {
  laCungDiaBanTinh,
  tinhChiPhiL1TuPhuLuc,
} from "@/lib/tinh-tien-giao-xn";
import { danhXungGiamDocXn } from "@/lib/danh-xung-gd-xn";
import { resolveLoaiHinhDuAn } from "@/lib/loai-hinh-du-an";
import {
  extractTenPcTinh,
  cleanTenPcTinh,
  tinhFromTenPcTinh,
} from "@/lib/soan-qd-defaults";
import {
  formatNgayBanHanhChu,
  yearFromDateOrDefault,
} from "@/lib/word/format-ngay";
import { resolveQdGiaoXnTemplatePath } from "@/lib/word/template-path";
import { soQdForWord } from "@/lib/soan-qd-theme";

export type QdGiaoXnExportInput = {
  loai: LoaiGiaoXn;
  so_qd_du_thao: string | null;
  ngay_du_thao: string | null;
  pham_vi: string | null;
  thoi_han: string | null;
  can_cu: string | null;
  /** Field bổ sung (chưa có cột DB) — truyền từ form khi có */
  ten_pc_tinh?: string | null;
  ten_tinh?: string | null;
  nam_ke_hoach?: string | null;
  so_qd_thanh_lap_xn?: string | null;
  ngay_qd_thanh_lap_xn?: string | null;
  so_qd_tam_giao_khv?: string | null;
  ngay_qd_tam_giao_khv?: string | null;
  ten_goi_thau?: string | null;
  so_tien_tam_ung?: string | null;
  so_tien_tam_ung_chu?: string | null;
  /** TVGS: tổng GHĐ bằng số (đồng) / bằng chữ */
  so_tien_hd?: string | null;
  so_tien_hd_chu?: string | null;
  so_luong_cong_trinh?: string | null;
  ghi_chu_bo_sung?: string | null;
  /** Ghi đè TMĐT (triệu đồng) theo thứ tự dòng phụ lục */
  tmdt_overrides?: Array<string | null | undefined>;
  /** Danh sách công trình đã chỉnh (vd. sau khi xóa dòng trên form soạn) */
  cong_trinh?: PhuLucCongTrinh[];
};

/** Giá trị tag docxtemplater (scalar hoặc mảng loop) */
export type WordTagValue =
  | string
  | number
  | Array<Record<string, string | number>>;

function guessTinhFromDiaDiem(dia: string | null | undefined): string {
  if (!dia?.trim()) return "";
  const m = /tỉnh\s+([^,;.]+)/i.exec(dia);
  if (m) return m[1].trim();
  const m2 = /TP\.?\s*([^,;.]+)/i.exec(dia);
  if (m2) return m2[1].trim();
  return "";
}

function readPhuLuc(qdGiaoA: QdGiaoA | null): PhuLucGiaoA | null {
  if (!qdGiaoA?.phu_luc) return null;
  const pl = qdGiaoA.phu_luc as PhuLucGiaoA;
  if (!Array.isArray(pl.cong_trinh) || !pl.cong_trinh.length) return null;
  return pl;
}

function mapCongTrinhRows(
  rows: PhuLucCongTrinh[],
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
  tmdtOverrides?: Array<string | null | undefined>,
  opts?: {
    loaiHinhDuAn?: LoaiHinhDuAn | null;
    cungDiaBan?: boolean;
  },
): {
  cong_trinh: Array<Record<string, string | number>>;
  tong_tmdt: string;
  tong_chi_phi_l1: string;
  tong_gia_tri_hd: string;
  tong_gia_tri_tam_ung: string;
} {
  const tinh = tinhChiPhiL1TuPhuLuc({
    loai,
    cap,
    cong_trinh: rows,
    tmdtOverrides,
    loaiHinhDuAn: opts?.loaiHinhDuAn,
    cungDiaBan: opts?.cungDiaBan,
  });

  const cong_trinh = rows.map((r, i) => {
    const tvtk =
      (r.ct_danh_dau_tvtk ?? r.ct_danh_dau_goi ?? "").toString();
    const tvgs = (r.ct_danh_dau_tvgs ?? "").toString();
    const calc = tinh.rows[i];
    const tmdt = calc?.ct_tmdt || (r.ct_tmdt ?? "").toString();
    const ghd = calc?.ct_gia_tri_hd || "";
    const tu = calc?.ct_gia_tri_tam_ung || calc?.ct_chi_phi_l1 || "";
    return {
      stt: r.stt ?? i + 1,
      ct_ten: (r.ct_ten ?? "").toString(),
      ct_quy_mo: (r.ct_quy_mo ?? "").toString(),
      ct_khu_vuc: (r.ct_khu_vuc ?? "").toString(),
      ct_quy_mo_dz_trung: (r.ct_quy_mo_dz_trung ?? "").toString(),
      ct_quy_mo_tba: (r.ct_quy_mo_tba ?? "").toString(),
      ct_quy_mo_dz_ha: (r.ct_quy_mo_dz_ha ?? "").toString(),
      ct_tmdt: tmdt,
      ct_tien_do: (r.ct_tien_do ?? "").toString(),
      ct_danh_dau_goi: tvtk,
      ct_danh_dau_tvtk: tvtk,
      ct_danh_dau_tvgs: tvgs,
      ct_gia_tri_hd: ghd || (r.ct_gia_tri_hd ?? "").toString(),
      /** Cột phụ lục «cấp chi phí lần 01» = tạm ứng lần 1 (không phải GHĐ) */
      ct_chi_phi_l1: tu || (r.ct_chi_phi_l1 ?? "").toString(),
      ct_gia_tri_tam_ung: tu,
      ct_khv: (r.ct_khv ?? "").toString(),
      ct_tdtm: (r.ct_tdtm ?? "").toString(),
      ct_khcb: (r.ct_khcb ?? "").toString(),
    };
  });

  return {
    cong_trinh,
    tong_tmdt: tinh.tong_tmdt,
    tong_chi_phi_l1: tinh.tong_chi_phi_l1,
    tong_gia_tri_hd: tinh.tong_gia_tri_hd,
    tong_gia_tri_tam_ung: tinh.tong_gia_tri_tam_ung,
  };
}

export function buildWordTagData(opts: {
  duAn: DuAn;
  qdGiaoA: QdGiaoA | null;
  xiNghiep: Pick<XiNghiep, "ten" | "ma"> | null;
  draft: QdGiaoXnExportInput;
}): Record<string, WordTagValue> {
  const { duAn, qdGiaoA, xiNghiep, draft } = opts;
  const phuTen = (qdGiaoA?.phu_luc as PhuLucGiaoA | null)?.cong_trinh
    ?.map((c) => c.ct_ten)
    .filter(Boolean)
    .join("\n");
  const pcFromGiaoA =
    cleanTenPcTinh(qdGiaoA?.ten_pc_tinh) ||
    extractTenPcTinh(qdGiaoA?.trich_yeu, phuTen);
  const tinh =
    draft.ten_tinh?.trim() ||
    tinhFromTenPcTinh(pcFromGiaoA) ||
    guessTinhFromDiaDiem(duAn.dia_diem) ||
    "";
  const pc =
    cleanTenPcTinh(draft.ten_pc_tinh) ||
    pcFromGiaoA ||
    (tinh ? `Công ty Điện lực ${tinh}` : "");
  const nam =
    draft.nam_ke_hoach?.trim() ||
    yearFromDateOrDefault(qdGiaoA?.ngay_qd) ||
    yearFromDateOrDefault(draft.ngay_du_thao);

  const empty = "";
  const phuLuc = readPhuLuc(qdGiaoA);
  const rowsNguon =
    draft.cong_trinh != null
      ? draft.cong_trinh
      : (phuLuc?.cong_trinh ?? []);
  const loaiHinh = resolveLoaiHinhDuAn(
    duAn.cap_dien_ap,
    duAn.loai_hinh_du_an,
  );
  const cungDiaBan = laCungDiaBanTinh({
    tenPcTinh: draft.ten_pc_tinh,
    tenXiNghiep: xiNghiep?.ten,
    diaDiemDuAn: duAn.dia_diem,
  });
  const mapped = rowsNguon.length
    ? mapCongTrinhRows(
        rowsNguon,
        draft.loai,
        duAn.cap_dien_ap,
        draft.tmdt_overrides,
        { loaiHinhDuAn: loaiHinh, cungDiaBan },
      )
    : null;
  const cong_trinh = mapped?.cong_trinh ?? [];

  return {
    so_qd: soQdForWord(draft.so_qd_du_thao),
    ngay_ban_hanh_chu: formatNgayBanHanhChu(draft.ngay_du_thao),
    ten_xi_nghiep: xiNghiep?.ten?.trim() || empty,
    danh_xung_gd_xn: danhXungGiamDocXn(xiNghiep?.ten),
    ten_pc_tinh: pc,
    ten_tinh: tinh,
    nam_ke_hoach: nam,
    so_qd_thanh_lap_xn: draft.so_qd_thanh_lap_xn?.trim() || empty,
    ngay_qd_thanh_lap_xn: draft.ngay_qd_thanh_lap_xn?.trim() || empty,
    so_qd_tam_giao_khv:
      draft.so_qd_tam_giao_khv?.trim() || qdGiaoA?.so_qd?.trim() || empty,
    ngay_qd_tam_giao_khv:
      draft.ngay_qd_tam_giao_khv?.trim() ||
      formatNgayBanHanhChu(qdGiaoA?.ngay_qd).replace(/^ngày /, "") ||
      empty,
    ten_goi_thau:
      draft.ten_goi_thau?.trim() ||
      (draft.loai === "tvtk"
        ? "Khảo sát, tư vấn thiết kế"
        : "Thí nghiệm hiệu chỉnh"),
    so_tien_tam_ung: draft.so_tien_tam_ung?.trim() || empty,
    so_tien_tam_ung_chu: draft.so_tien_tam_ung_chu?.trim() || empty,
    so_tien_hd: draft.so_tien_hd?.trim() || empty,
    so_tien_hd_chu: draft.so_tien_hd_chu?.trim() || empty,
    tong_tmdt:
      mapped?.tong_tmdt ||
      phuLuc?.tong_tmdt?.toString().trim() ||
      empty,
    tong_gia_tri_hd:
      mapped?.tong_gia_tri_hd ||
      phuLuc?.tong_gia_tri_hd?.toString().trim() ||
      empty,
    tong_chi_phi_l1:
      mapped?.tong_chi_phi_l1 ||
      phuLuc?.tong_chi_phi_l1?.toString().trim() ||
      empty,
    tong_gia_tri_tam_ung: mapped?.tong_gia_tri_tam_ung || empty,
    tong_khv: phuLuc?.tong_khv?.toString().trim() || empty,
    tong_tdtm: phuLuc?.tong_tdtm?.toString().trim() || empty,
    tong_khcb: phuLuc?.tong_khcb?.toString().trim() || empty,
    so_luong_cong_trinh:
      draft.so_luong_cong_trinh?.trim() ||
      (cong_trinh.length ? String(cong_trinh.length) : empty),
    ghi_chu_bo_sung: draft.ghi_chu_bo_sung?.trim() || empty,
    ghi_chu_bo_sung_dieu1: draft.ghi_chu_bo_sung?.trim()
      ? `hoặc ĐTXD bổ sung năm ${nam}`
      : empty,
    cong_trinh,
    ct_khu_vuc: empty,
    ct_quy_mo_dz_trung: empty,
    ct_quy_mo_tba: empty,
    ct_quy_mo_dz_ha: empty,
    ct_tmdt: empty,
    ct_tien_do: empty,
    ct_danh_dau_goi: empty,
    ct_gia_tri_hd: empty,
    ct_chi_phi_l1: empty,
    pham_vi: draft.pham_vi?.trim() || empty,
    thoi_han: draft.thoi_han?.trim() || empty,
    can_cu: draft.can_cu?.trim() || empty,
    ten_du_an: duAn.ten_du_an,
    ma_du_an: duAn.ma_du_an ?? empty,
  };
}

export function renderQdGiaoXnDocx(opts: {
  loai: LoaiGiaoXn;
  cap: CapDienAp | null | undefined;
  data: Record<string, WordTagValue>;
}): Buffer {
  const templatePath = resolveQdGiaoXnTemplatePath(opts.loai, opts.cap);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Không tìm thấy mẫu: ${templatePath}`);
  }
  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  for (const name of Object.keys(zip.files)) {
    if (name.includes("\\")) {
      const fixed = name.replace(/\\/g, "/");
      if (!zip.files[fixed]) {
        zip.file(fixed, zip.file(name)!.asUint8Array());
      }
      zip.remove(name);
    }
  }
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });
  doc.render(opts.data);
  return doc.toBuffer();
}
