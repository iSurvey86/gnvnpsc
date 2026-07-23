-- Phase 1 — schema gnvnpsc (Giao A → danh mục DA → QĐ giao Xí nghiệp)
-- Chạy trên Supabase SQL Editor khi đã tạo project.

-- Danh mục Xí nghiệp (seed thủ công khi có list)
create table if not exists public.xi_nghiep (
  id uuid primary key default gen_random_uuid(),
  ma text unique,
  ten text not null,
  phu_hop_tvtk boolean not null default true,
  phu_hop_thi_nghiem boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Hồ sơ QĐ Giao A (file PDF + kết quả ScanAI)
create table if not exists public.qd_giao_a (
  id uuid primary key default gen_random_uuid(),
  so_qd text,
  ngay_qd date,
  trich_yeu text,
  storage_path text,
  scan_status text not null default 'pending'
    check (scan_status in ('pending', 'processing', 'done', 'error')),
  scan_raw jsonb,
  scan_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Danh mục dự án (extract từ Giao A hoặc chỉnh tay sau scan)
create table if not exists public.du_an (
  id uuid primary key default gen_random_uuid(),
  qd_giao_a_id uuid references public.qd_giao_a (id) on delete set null,
  ma_du_an text,
  ten_du_an text not null,
  dia_diem text,
  quy_mo text,
  goi_cong_viec text,
  ghi_chu text,
  cap_dien_ap text check (cap_dien_ap is null or cap_dien_ap in ('110kv', 'trung_ha_ap')),
  huong_giao text check (huong_giao is null or huong_giao in ('tvtk', 'tn', 'tvtk_tn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists du_an_qd_giao_a_idx on public.du_an (qd_giao_a_id);

-- Quyết định trình GĐ giao Xí nghiệp
create table if not exists public.qd_giao_xn (
  id uuid primary key default gen_random_uuid(),
  du_an_id uuid not null references public.du_an (id) on delete restrict,
  loai text not null check (loai in ('tvtk', 'thi_nghiem')),
  so_qd_du_thao text,
  ngay_du_thao date,
  xi_nghiep_id uuid references public.xi_nghiep (id),
  pham_vi text,
  thoi_han text,
  can_cu text,
  trang_thai text not null default 'nhap'
    check (trang_thai in ('nhap', 'trinh_gd', 'da_ban_hanh')),
  word_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists qd_giao_xn_du_an_idx on public.qd_giao_xn (du_an_id);
create index if not exists qd_giao_xn_loai_idx on public.qd_giao_xn (loai);

-- Storage bucket gợi ý (tạo thủ công trên Dashboard hoặc Storage API):
--   qd-giao-a   — PDF gốc
--   qd-giao-xn  — Word xuất
