-- Hướng giao nhiệm vụ trên danh mục dự án (thay cột gói công việc trên UI)
-- Chạy trên Supabase SQL Editor

alter table public.du_an
  add column if not exists huong_giao text
  check (
    huong_giao is null
    or huong_giao in ('tvtk', 'tn', 'tvtk_tn')
  );

comment on column public.du_an.huong_giao is
  'tvtk = Tư vấn thiết kế; tn = Thí nghiệm; tvtk_tn = cả hai';
