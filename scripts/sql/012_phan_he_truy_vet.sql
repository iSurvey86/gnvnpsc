-- Phân hệ + truy vết actor + quyền theo tổ
-- Chạy trên Supabase SQL Editor sau 011_du_an_xi_nghiep.sql
--
-- Chốt nghiệp vụ:
-- - 1 hồ sơ qd_giao_a / PDF dùng chung giữa các tổ
-- - du_an / qd_giao_xn gắn phan_he (tvtk | thi_nghiem | tvgs)
-- - Trùng tên dự án giữa phân hệ: cho phép
-- - Trong cùng phân hệ: vẫn nên cảnh báo trùng (app)

-- ========== 1) Phân hệ trên hồ sơ Giao A / dự án / QĐ ==========

alter table public.qd_giao_a
  add column if not exists scanned_by uuid,
  add column if not exists scanned_by_email text,
  add column if not exists scanned_by_ho_ten text,
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid;

comment on column public.qd_giao_a.scanned_by is
  'Auth user quét PDF lần đầu (hồ sơ dùng chung)';

alter table public.du_an
  add column if not exists phan_he text not null default 'tvtk'
    check (phan_he in ('tvtk', 'thi_nghiem', 'tvgs')),
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid,
  add column if not exists assigned_by uuid,
  add column if not exists assigned_at timestamptz;

create index if not exists du_an_phan_he_idx on public.du_an (phan_he);
create index if not exists du_an_phan_he_qd_idx
  on public.du_an (qd_giao_a_id, phan_he);

comment on column public.du_an.phan_he is
  'Phân hệ sở hữu bản ghi dự án (mỗi tổ một dòng, trùng tên cross-PH được phép)';

-- Mở loai QĐ thêm tvgs; gắn phan_he
alter table public.qd_giao_xn
  drop constraint if exists qd_giao_xn_loai_check;

alter table public.qd_giao_xn
  add constraint qd_giao_xn_loai_check
  check (loai in ('tvtk', 'thi_nghiem', 'tvgs'));

alter table public.qd_giao_xn
  add column if not exists phan_he text not null default 'tvtk'
    check (phan_he in ('tvtk', 'thi_nghiem', 'tvgs')),
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid,
  add column if not exists exported_by uuid,
  add column if not exists exported_at timestamptz;

create index if not exists qd_giao_xn_phan_he_idx on public.qd_giao_xn (phan_he);

-- Backfill phan_he từ loai
update public.qd_giao_xn
set phan_he = case
  when loai = 'thi_nghiem' then 'thi_nghiem'
  when loai = 'tvgs' then 'tvgs'
  else 'tvtk'
end
where phan_he is null or phan_he = 'tvtk' and loai <> 'tvtk';

update public.qd_giao_xn
set phan_he = 'thi_nghiem'
where loai = 'thi_nghiem' and phan_he <> 'thi_nghiem';

-- ========== 2) Xí nghiệp phù hợp TVGS ==========

alter table public.xi_nghiep
  add column if not exists phu_hop_tvgs boolean not null default true;

-- ========== 3) Index tra cứu số QĐ Giao A (pair) ==========
-- KHÔNG unique ở đây: dữ liệu cũ có thể đang trùng số QĐ (mỗi tổ quét riêng).
-- Sau khi gộp trùng bằng 013_gop_giao_a_trung.sql mới bật unique.

create index if not exists qd_giao_a_so_qd_idx
  on public.qd_giao_a (so_qd)
  where so_qd is not null and btrim(so_qd) <> '';

-- ========== 4) Quyền nhân sự theo phân hệ ==========

create table if not exists public.nhan_su_phan_he (
  id uuid primary key default gen_random_uuid(),
  nhan_su_id uuid not null references public.nhan_su (id) on delete cascade,
  phan_he text not null check (phan_he in ('tvtk', 'thi_nghiem', 'tvgs')),
  -- viewer | scanner | assigner | manager
  vai_tro_phan_he text not null default 'assigner'
    check (vai_tro_phan_he in ('viewer', 'scanner', 'assigner', 'manager')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (nhan_su_id, phan_he)
);

create index if not exists nhan_su_phan_he_ns_idx
  on public.nhan_su_phan_he (nhan_su_id);

comment on table public.nhan_su_phan_he is
  'Phân công tổ: nhân viên/phó phòng được quyền trên phân hệ nào. '
  'Chưa có dòng → app mặc định ghi TVTK, xem các phân hệ khác (tương thích giai).';

-- Seed: mọi user hiện tại được assigner trên TVTK (không khóa vận hành hiện tại)
insert into public.nhan_su_phan_he (nhan_su_id, phan_he, vai_tro_phan_he)
select ns.id, 'tvtk', 'assigner'
from public.nhan_su ns
where ns.active = true
  and coalesce(ns.vai_tro, 'user') <> 'admin'
on conflict (nhan_su_id, phan_he) do nothing;
