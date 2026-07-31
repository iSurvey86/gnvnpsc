-- PDF quyết định đã ký (chốt luồng giao Xí nghiệp)
-- Chạy trên Supabase SQL Editor sau 017_loai_hinh_du_an.sql
-- Bucket Storage: qd-giao-xn (tạo tay trên Dashboard nếu chưa có; public = false)

alter table public.qd_giao_xn
  add column if not exists pdf_ky_storage_path text;

alter table public.qd_giao_xn
  add column if not exists pdf_ky_at timestamptz;

alter table public.qd_giao_xn
  add column if not exists pdf_ky_by uuid;

comment on column public.qd_giao_xn.pdf_ky_storage_path is
  'Đường dẫn PDF quyết định đã ký trên bucket qd-giao-xn — khi có thì trang_thai = da_ban_hanh (Đã giao)';
comment on column public.qd_giao_xn.pdf_ky_at is
  'Thời điểm tải lên PDF đã ký';
comment on column public.qd_giao_xn.pdf_ky_by is
  'Người tải PDF đã ký (auth.users)';

-- Bucket (idempotent nếu Supabase cho phép insert)
insert into storage.buckets (id, name, public)
values ('qd-giao-xn', 'qd-giao-xn', false)
on conflict (id) do nothing;
