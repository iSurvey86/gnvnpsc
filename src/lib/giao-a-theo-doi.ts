import type { PhanHeCode } from "@/lib/phan-he";

/** Số QĐ Giao A dạng ngắn để cột bảng (vd 719/QĐ-EVNNPC). */
export function vietTatSoQdGiaoA(soQd: string | null | undefined): string {
  const t = soQd?.trim();
  return t || "—";
}

/** Năm từ ngày QĐ (ISO hoặc yyyy-mm-dd). */
export function namTuNgayQd(ngay: string | null | undefined): string {
  if (!ngay?.trim()) return "—";
  const m = /^(\d{4})/.exec(ngay.trim());
  return m?.[1] ?? "—";
}

export type GiaoAListItem = {
  id: string;
  so_qd: string | null;
  ngay_qd: string | null;
  trich_yeu: string | null;
  scanned_by_ho_ten: string | null;
  storage_path: string | null;
  /** Tổng CT (ưu tiên phụ lục Giao A; không có → số DA) */
  tong_ct: number;
  /**
   * Số đã giao: ưu tiên CT tick trong `cong_trinh_chon`;
   * dự thảo cũ chưa có tick → fallback số DA đã có dự thảo QĐ.
   */
  da_giao_ct: number;
  created_at: string;
};

export type CongTrinhTheoDoi = {
  /** Khóa ổn định (phụ lục: stt+ten) */
  row_key: string;
  du_an_id: string | null;
  ma_du_an: string | null;
  ten_du_an: string;
  stt?: number | string | null;
  dia_diem: string | null;
  cap_dien_ap: string | null;
  loai_hinh_du_an: string | null;
  /** Đã thuộc QĐ giao XN (cùng loại phân hệ) */
  da_giao: boolean;
  qd_giao_xn_id: string | null;
  so_qd_du_thao: string | null;
  xi_nghiep_ten: string | null;
  trang_thai: string | null;
  /** Dự án chủ của QĐ (để mở soạn) */
  qd_owner_du_an_id: string | null;
};

export type QdXnTheoDoi = {
  id: string;
  du_an_id: string;
  loai: string;
  trang_thai: string;
  so_qd_du_thao: string | null;
  pdf_ky_storage_path: string | null;
  xi_nghiep_ten: string | null;
  so_ct: number;
};

export type GiaoATheoDoiPayload = {
  qd: {
    id: string;
    so_qd: string | null;
    ngay_qd: string | null;
    trich_yeu: string | null;
    ten_pc_tinh: string | null;
    storage_path: string | null;
    scanned_by_ho_ten: string | null;
    phu_luc: unknown;
    created_at: string;
  };
  phan_he: PhanHeCode;
  cong_trinh: CongTrinhTheoDoi[];
  qd_giao_xn: QdXnTheoDoi[];
  tong_ct: number;
  da_giao_ct: number;
  /** DA chưa giao — dùng làm owner khi lập QĐ mới */
  du_an_chu_goi_y_id: string | null;
};
