-- Map nhiều dự án/công trình được phủ bởi một QĐ giao Xí nghiệp.
-- Khi lập QĐ từ một DA, các DA cùng Giao A trùng tên công trình trong bảng soạn
-- được gắn vào QĐ này → bảng ngoài không hiện «Chưa lập QĐ» nữa.

create table if not exists public.qd_giao_xn_du_an (
  id uuid primary key default gen_random_uuid(),
  qd_giao_xn_id uuid not null references public.qd_giao_xn (id) on delete cascade,
  du_an_id uuid not null references public.du_an (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint qd_giao_xn_du_an_unique unique (qd_giao_xn_id, du_an_id)
);

create index if not exists qd_giao_xn_du_an_du_an_idx
  on public.qd_giao_xn_du_an (du_an_id);

create index if not exists qd_giao_xn_du_an_qd_idx
  on public.qd_giao_xn_du_an (qd_giao_xn_id);

comment on table public.qd_giao_xn_du_an is
  'Dự án được phủ bởi QĐ giao XN (khớp tên công trình trong phụ lục / bảng soạn).';
