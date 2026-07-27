export type ScanStatus = "pending" | "processing" | "done" | "error";
export type LoaiGiaoXn = "tvtk" | "thi_nghiem";
export type TrangThaiQdXn = "nhap" | "trinh_gd" | "da_ban_hanh";
export type CapDienAp = "110kv" | "trung_ha_ap";
/** Hướng giao PCM: TVTK / Thí nghiệm / cả hai */
export type HuongGiao = "tvtk" | "tn" | "tvtk_tn";

/** Một dòng phụ lục Giao A (xuất Word 110 / THA / TN) */
export type PhuLucCongTrinh = {
  stt?: number | string;
  ct_ten?: string;
  ct_quy_mo?: string;
  ct_khu_vuc?: string;
  ct_quy_mo_dz_trung?: string;
  ct_quy_mo_tba?: string;
  ct_quy_mo_dz_ha?: string;
  ct_tmdt?: string;
  ct_tien_do?: string;
  /** THA — đánh dấu cột gói thầu */
  ct_danh_dau_goi?: string;
  ct_danh_dau_tvtk?: string;
  ct_danh_dau_tvgs?: string;
  ct_gia_tri_hd?: string;
  ct_chi_phi_l1?: string;
  /** Thí nghiệm — KHV / TDTM / KHCB */
  ct_khv?: string;
  ct_tdtm?: string;
  ct_khcb?: string;
};

export type PhuLucGiaoA = {
  tong_tmdt?: string | null;
  tong_gia_tri_hd?: string | null;
  tong_chi_phi_l1?: string | null;
  tong_khv?: string | null;
  tong_tdtm?: string | null;
  tong_khcb?: string | null;
  cong_trinh: PhuLucCongTrinh[];
};

export type QdGiaoA = {
  id: string;
  so_qd: string | null;
  ngay_qd: string | null;
  trich_yeu: string | null;
  /** PC tỉnh / chủ đầu tư — «Công ty Điện lực …» từ Giao A */
  ten_pc_tinh?: string | null;
  storage_path: string | null;
  scan_status: ScanStatus;
  scan_raw: unknown;
  scan_error: string | null;
  /** Phụ lục CT từ ScanAI — dùng loop Word 110kV */
  phu_luc: PhuLucGiaoA | null;
  created_at: string;
  updated_at: string;
};

export type DuAn = {
  id: string;
  qd_giao_a_id: string | null;
  ma_du_an: string | null;
  ten_du_an: string;
  dia_diem: string | null;
  quy_mo: string | null;
  goi_cong_viec: string | null;
  ghi_chu: string | null;
  cap_dien_ap: CapDienAp | null;
  huong_giao: HuongGiao | null;
  created_at: string;
  updated_at: string;
};

export type XiNghiep = {
  id: string;
  ma: string | null;
  ten: string;
  phu_hop_tvtk: boolean;
  phu_hop_thi_nghiem: boolean;
  active: boolean;
};

export type QdGiaoXn = {
  id: string;
  du_an_id: string;
  loai: LoaiGiaoXn;
  so_qd_du_thao: string | null;
  ngay_du_thao: string | null;
  xi_nghiep_id: string | null;
  pham_vi: string | null;
  thoi_han: string | null;
  can_cu: string | null;
  trang_thai: TrangThaiQdXn;
  word_storage_path: string | null;
  created_at: string;
};

/** Nhân sự nội bộ (sau đồng bộ HRMS) */
export type VaiTro = "admin" | "user";

export type NhanSu = {
  id: string;
  ma_nv: string | null;
  ho_ten: string;
  email: string;
  don_vi: string | null;
  chuc_danh: string | null;
  dien_thoai: string | null;
  active: boolean;
  auth_user_id: string | null;
  da_cap_dang_nhap: boolean;
  goi_y_doi_mk: boolean;
  vai_tro: VaiTro;
  created_at: string;
  updated_at: string;
};
