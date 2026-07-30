-- Xí nghiệp được giao nhiệm vụ, chọn ngay trên danh mục dự án
-- (thay cột Định hướng giao trên UI — cột huong_giao vẫn giữ trong CSDL để không mất dữ liệu cũ)
-- Chạy trên Supabase SQL Editor

alter table public.du_an
  add column if not exists xi_nghiep_id uuid
  references public.xi_nghiep (id) on delete set null;

create index if not exists du_an_xi_nghiep_id_idx
  on public.du_an (xi_nghiep_id);

comment on column public.du_an.xi_nghiep_id is
  'Xí nghiệp được giao nhiệm vụ (chọn trên bảng danh mục dự án, mỗi dự án 1 Xí nghiệp)';
