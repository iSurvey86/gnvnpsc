-- Loại hình trung hạ áp: bỏ CQT; thêm XDM (xây dựng mới), Cải tạo.
-- Chạy trên Supabase SQL Editor sau 019_qd_giao_xn_du_an.sql
-- Dự án đã gắn CQT → đặt null để người dùng chọn lại (XDM / Cải tạo / SCMBA / DMS).

update public.du_an
   set loai_hinh_du_an = null
 where loai_hinh_du_an = 'cqt';

alter table public.du_an
  drop constraint if exists du_an_loai_hinh_du_an_check;

alter table public.du_an
  add constraint du_an_loai_hinh_du_an_check
  check (
    loai_hinh_du_an is null
    or loai_hinh_du_an in ('110kv', 'xdm', 'cai_tao', 'scmba', 'dms')
  );

comment on column public.du_an.loai_hinh_du_an is
  'Loại hình dự án: 110kv (tự đặt theo cấp điện áp) | xdm | cai_tao | scmba | dms (bắt buộc chọn với trung hạ áp)';
