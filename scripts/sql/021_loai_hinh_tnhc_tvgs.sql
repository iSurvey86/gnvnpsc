-- Thêm loại hình tnhc (Thí nghiệm) và tvgs (Tư vấn giám sát).
-- Chạy trên Supabase SQL Editor sau 020_loai_hinh_xdm_cai_tao.sql

alter table public.du_an
  drop constraint if exists du_an_loai_hinh_du_an_check;

alter table public.du_an
  add constraint du_an_loai_hinh_du_an_check
  check (
    loai_hinh_du_an is null
    or loai_hinh_du_an in (
      '110kv', 'xdm', 'cai_tao', 'scmba', 'dms', 'tnhc', 'tvgs'
    )
  );

-- Gắn mặc định cho dự án THA chưa chọn loại hình trong phân hệ tương ứng
update public.du_an
   set loai_hinh_du_an = 'tnhc'
 where phan_he = 'thi_nghiem'
   and coalesce(cap_dien_ap, '') <> '110kv'
   and (loai_hinh_du_an is null or loai_hinh_du_an = '110kv');

update public.du_an
   set loai_hinh_du_an = 'tvgs'
 where phan_he = 'tvgs'
   and coalesce(cap_dien_ap, '') <> '110kv'
   and (loai_hinh_du_an is null or loai_hinh_du_an = '110kv');

comment on column public.du_an.loai_hinh_du_an is
  'Loại hình: 110kv | xdm | cai_tao | scmba | dms | tnhc | tvgs';
