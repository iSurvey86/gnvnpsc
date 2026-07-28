-- Nhật ký hoạt động người dùng (Admin xem)
-- Chạy trên Supabase SQL Editor.

create table if not exists public.nhat_ky_hoat_dong (
  id bigserial primary key,
  thoi_gian timestamptz not null default now(),
  email text,
  ho_ten text,
  auth_user_id uuid,
  phan_he text not null,
  hanh_dong text not null,
  doi_tuong_id text,
  chi_tiet_ngan text,
  du_lieu_dong jsonb not null default '{}'::jsonb,
  trang_thai text not null default 'Thành công'
);

create index if not exists nhat_ky_hoat_dong_thoi_gian_idx
  on public.nhat_ky_hoat_dong (thoi_gian desc);

create index if not exists nhat_ky_hoat_dong_phan_he_idx
  on public.nhat_ky_hoat_dong (phan_he);

create index if not exists nhat_ky_hoat_dong_hanh_dong_idx
  on public.nhat_ky_hoat_dong (hanh_dong);

comment on table public.nhat_ky_hoat_dong is
  'Nhật ký hoạt động — Admin xem tại /he-thong/giam-sat';
