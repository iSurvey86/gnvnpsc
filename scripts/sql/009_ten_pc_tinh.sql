-- PC tỉnh / chủ đầu tư từ QĐ Giao A (vd «cho Công ty Điện lực Hà Tĩnh»)
-- Chạy trên Supabase SQL Editor.

alter table public.qd_giao_a
  add column if not exists ten_pc_tinh text;

comment on column public.qd_giao_a.ten_pc_tinh is
  'Công ty Điện lực / PC tỉnh được giao danh mục (chủ đầu tư) — extract từ tiêu đề Giao A';
