/** Kết quả extract QĐ Giao A (ScanAI) — chỉnh khi có mẫu PDF thật */
export type GiaoADuAnExtract = {
  ma_du_an?: string;
  ten_du_an: string;
  dia_diem?: string;
  quy_mo?: string;
  goi_cong_viec?: string;
  /** "110kv" | "trung_ha_ap" hoặc mô tả tự do — server sẽ normalize */
  cap_dien_ap?: string;
};

export type GiaoAScanResult = {
  so_qd?: string;
  ngay_qd?: string;
  trich_yeu?: string;
  du_an: GiaoADuAnExtract[];
};

export type LoaiGiaoXn = "tvtk" | "thi_nghiem";
