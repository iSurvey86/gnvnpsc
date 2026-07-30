-- Loại hình dự án (bắt buộc khi lưu chính thức — liên quan chi phí sau này)
--   110kV  : dự án 110kV, hệ thống tự đặt, người nhập không phải chọn
--   Trung hạ áp: người nhập bắt buộc chọn CQT (chống quá tải) / SCMBA (sửa chữa MBA) / DMS
-- Chạy trên Supabase SQL Editor sau 016_nhap_va_luu_giao_a.sql

alter table public.du_an
  add column if not exists loai_hinh_du_an text;

-- Dự án 110kV: mặc định loại hình là 110kv
update public.du_an
   set loai_hinh_du_an = '110kv'
 where cap_dien_ap = '110kv'
   and (loai_hinh_du_an is null or loai_hinh_du_an <> '110kv');

alter table public.du_an
  drop constraint if exists du_an_loai_hinh_du_an_check;

alter table public.du_an
  add constraint du_an_loai_hinh_du_an_check
  check (
    loai_hinh_du_an is null
    or loai_hinh_du_an in ('110kv', 'cqt', 'scmba', 'dms')
  );

create index if not exists du_an_loai_hinh_du_an_idx
  on public.du_an (loai_hinh_du_an, phan_he);

comment on column public.du_an.loai_hinh_du_an is
  'Loại hình dự án: 110kv (tự đặt theo cấp điện áp) | cqt | scmba | dms (bắt buộc chọn với trung hạ áp)';
