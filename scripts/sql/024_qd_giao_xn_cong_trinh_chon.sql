-- CT đã tick khi lưu QĐ giao XN — dùng đếm x/y trên danh sách & theo dõi Giao A
-- Chạy trên Supabase SQL Editor sau 023_an_xn_sap_nhap.sql

alter table public.qd_giao_xn
  add column if not exists cong_trinh_chon jsonb;

comment on column public.qd_giao_xn.cong_trinh_chon is
  'Dòng phụ lục đã chọn khi lưu soạn QĐ giao XN — [{ stt, ct_ten, ... }]';
