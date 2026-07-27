-- Phụ lục công trình extract từ QĐ Giao A (dùng xuất Word TVTK 110kV)
-- Chạy trên Supabase SQL Editor sau 001.

alter table public.qd_giao_a
  add column if not exists phu_luc jsonb;

comment on column public.qd_giao_a.phu_luc is
  'Phụ lục CT từ Giao A (110/THA/TN): { tong_tmdt, tong_gia_tri_hd, tong_chi_phi_l1, tong_khv, tong_tdtm, tong_khcb, cong_trinh: [{ stt, ct_ten, ct_quy_mo, ct_tmdt, ct_tien_do, ct_danh_dau_tvtk, ct_danh_dau_tvgs, ct_gia_tri_hd, ct_chi_phi_l1, ct_khv, ct_tdtm, ct_khcb }] }';
