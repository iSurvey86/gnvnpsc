export type ScanStatus = "pending" | "processing" | "done" | "error";
export type LoaiGiaoXn = "tvtk" | "thi_nghiem";
export type TrangThaiQdXn = "nhap" | "trinh_gd" | "da_ban_hanh";
export type CapDienAp = "110kv" | "trung_ha_ap";
/** Hướng giao PCM: TVTK / Thí nghiệm / cả hai */
export type HuongGiao = "tvtk" | "tn" | "tvtk_tn";

export type QdGiaoA = {
  id: string;
  so_qd: string | null;
  ngay_qd: string | null;
  trich_yeu: string | null;
  storage_path: string | null;
  scan_status: ScanStatus;
  scan_raw: unknown;
  scan_error: string | null;
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
