-- Tách bản nháp (vừa quét, chưa lưu) khỏi dữ liệu chính thức
-- Chạy sau 015_phan_biet_pho_phong.sql
--
-- Nghiệp vụ:
-- - Quét PDF Giao A → tạo bản NHÁP (da_luu = false), chỉ hiện trên màn Review
-- - Bấm Lưu → da_luu = true, dự án mới vào danh mục chính thức
-- - Bấm Hủy bỏ (hoặc rời trang và xác nhận hủy) → xóa sạch bản nháp
-- - Danh mục dự án / dashboard chỉ đọc bản đã lưu

alter table public.qd_giao_a
  add column if not exists da_luu boolean not null default false;

alter table public.du_an
  add column if not exists da_luu boolean not null default false;

-- Dữ liệu đang vận hành coi như đã lưu chính thức
update public.qd_giao_a set da_luu = true where da_luu = false;
update public.du_an set da_luu = true where da_luu = false;

create index if not exists du_an_da_luu_idx
  on public.du_an (da_luu, phan_he);

create index if not exists qd_giao_a_da_luu_idx
  on public.qd_giao_a (da_luu);

comment on column public.qd_giao_a.da_luu is
  'false = bản nháp vừa quét, chưa xác nhận lưu; true = hồ sơ chính thức';

comment on column public.du_an.da_luu is
  'false = dòng nháp trên màn Review; true = dự án chính thức trong danh mục';

-- Kiểm tra
-- select da_luu, count(*) from public.qd_giao_a group by da_luu;
-- select da_luu, count(*) from public.du_an group by da_luu;
