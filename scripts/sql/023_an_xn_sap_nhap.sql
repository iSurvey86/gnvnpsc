-- Ẩn Xí nghiệp đã sáp nhập (không xóa lịch sử QĐ).
-- Điện Biên → Lai Châu; Lạng Sơn → Cao Bằng.
-- Chạy trên Supabase SQL Editor. An toàn chạy lại.

update public.xi_nghiep
set active = false
where
  ma in ('DVDL-DB', 'DVDL-LS')
  or ten ilike '%Điện Biên%'
  or ten ilike '%Dien Bien%'
  or ten ilike '%Lạng Sơn%'
  or ten ilike '%Lang Son%';
