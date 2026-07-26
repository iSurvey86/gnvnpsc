import fs from "node:fs";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import type { CapDienAp, DuAn, LoaiGiaoXn, QdGiaoA, XiNghiep } from "@/lib/types";
import {
  formatNgayBanHanhChu,
  yearFromDateOrDefault,
} from "@/lib/word/format-ngay";
import { resolveQdGiaoXnTemplatePath } from "@/lib/word/template-path";

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
  so_luong_cong_trinh?: string | null;
  ghi_chu_bo_sung?: string | null;
};

function guessTinhFromDiaDiem(dia: string | null | undefined): string {
  if (!dia?.trim()) return "";
  // VD: "…, tỉnh Thanh Hóa" / "tỉnh Thanh Hóa"
  const m = /tỉnh\s+([^,;.]+)/i.exec(dia);
  if (m) return m[1].trim();
  const m2 = /TP\.?\s*([^,;.]+)/i.exec(dia);
  if (m2) return m2[1].trim();
  return "";
}

export function buildWordTagData(opts: {
  duAn: DuAn;
  qdGiaoA: QdGiaoA | null;
  xiNghiep: Pick<XiNghiep, "ten" | "ma"> | null;
  draft: QdGiaoXnExportInput;
}): Record<string, string> {
  const { duAn, qdGiaoA, xiNghiep, draft } = opts;
  const tinh =
    draft.ten_tinh?.trim() ||
    guessTinhFromDiaDiem(duAn.dia_diem) ||
    "";
  const pc =
    draft.ten_pc_tinh?.trim() ||
    (tinh ? `Công ty Điện lực ${tinh}` : "");
  const nam =
    draft.nam_ke_hoach?.trim() ||
    yearFromDateOrDefault(qdGiaoA?.ngay_qd) ||
    yearFromDateOrDefault(draft.ngay_du_thao);

  const empty = "";
  return {
    so_qd: draft.so_qd_du_thao?.trim() || empty,
    ngay_ban_hanh_chu: formatNgayBanHanhChu(draft.ngay_du_thao),
    ten_xi_nghiep: xiNghiep?.ten?.trim() || empty,
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
    tong_tmdt: empty,
    tong_gia_tri_hd: empty,
    tong_chi_phi_l1: empty,
    tong_khv: empty,
    tong_tdtm: empty,
    tong_khcb: empty,
    so_luong_cong_trinh: draft.so_luong_cong_trinh?.trim() || empty,
    ghi_chu_bo_sung: draft.ghi_chu_bo_sung?.trim() || empty,
    ghi_chu_bo_sung_dieu1: draft.ghi_chu_bo_sung?.trim()
      ? `hoặc ĐTXD bổ sung năm ${nam}`
      : empty,
    // Dòng phụ lục mẫu — để trống đến khi có loop
    ct_khu_vuc: empty,
    ct_quy_mo_dz_trung: empty,
    ct_quy_mo_tba: empty,
    ct_quy_mo_dz_ha: empty,
    ct_tmdt: empty,
    ct_tien_do: empty,
    ct_danh_dau_goi: empty,
    ct_gia_tri_hd: empty,
    ct_chi_phi_l1: empty,
    // Tham chiếu nội dung form (không phải tag mẫu, dự phòng)
    pham_vi: draft.pham_vi?.trim() || duAn.quy_mo?.trim() || empty,
    thoi_han: draft.thoi_han?.trim() || empty,
    can_cu: draft.can_cu?.trim() || empty,
    ten_du_an: duAn.ten_du_an,
    ma_du_an: duAn.ma_du_an ?? empty,
  };
}

export function renderQdGiaoXnDocx(opts: {
  loai: LoaiGiaoXn;
  cap: CapDienAp | null | undefined;
  data: Record<string, string>;
}): Buffer {
  const templatePath = resolveQdGiaoXnTemplatePath(opts.loai, opts.cap);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Không tìm thấy mẫu: ${templatePath}`);
  }
  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });
  doc.render(opts.data);
  return doc.toBuffer();
}
