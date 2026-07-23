-- Thêm cấp điện áp cho danh mục dự án (110 kV / Trung hạ áp)
-- Chạy trên Supabase SQL Editor sau 001_phase1_schema.sql

alter table public.du_an
  add column if not exists cap_dien_ap text
  check (cap_dien_ap is null or cap_dien_ap in ('110kv', 'trung_ha_ap'));

create index if not exists du_an_cap_dien_ap_idx on public.du_an (cap_dien_ap);
