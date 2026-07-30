-- Gộp hồ sơ Giao A trùng số QĐ (di sản: mỗi tổ quét riêng 1 bản)
-- Chạy SAU 012_phan_he_truy_vet.sql
--
-- Nguyên tắc gộp:
-- - Giữ hồ sơ CŨ NHẤT (created_at nhỏ nhất) cho mỗi số QĐ
-- - Chuyển toàn bộ du_an của các bản trùng về hồ sơ giữ lại
-- - Xóa các bản trùng (PDF cũ trong Storage thành rác — dọn tay nếu cần)
-- - Sau đó bật unique index để không phát sinh trùng mới
--
-- LƯU Ý: dùng CTE, KHÔNG dùng bảng tạm (SQL Editor của Supabase không giữ
-- bảng tạm giữa các câu lệnh trong cùng script).

-- ---------- BƯỚC 1: XEM TRƯỚC (chạy riêng, không sửa gì) ----------
-- select btrim(so_qd) as so_qd, count(*) as so_ho_so,
--        min(created_at) as ban_giu, max(created_at) as ban_trung
-- from public.qd_giao_a
-- where so_qd is not null and btrim(so_qd) <> ''
-- group by btrim(so_qd)
-- having count(*) > 1
-- order by so_qd;

-- ---------- BƯỚC 2: CHUYỂN DỰ ÁN VỀ HỒ SƠ GIỮ LẠI ----------

with keep as (
  select btrim(so_qd) as so_qd_norm,
         (array_agg(id order by created_at asc, id asc))[1] as keep_id
  from public.qd_giao_a
  where so_qd is not null and btrim(so_qd) <> ''
  group by btrim(so_qd)
  having count(*) > 1
),
dup as (
  select g.id as dup_id, k.keep_id
  from public.qd_giao_a g
  join keep k on btrim(g.so_qd) = k.so_qd_norm
  where g.id <> k.keep_id
)
update public.du_an d
set qd_giao_a_id = dup.keep_id,
    updated_at = now()
from dup
where d.qd_giao_a_id = dup.dup_id;

-- ---------- BƯỚC 3: LẤP TRƯỜNG CÒN TRỐNG TỪ BẢN TRÙNG ----------

with keep as (
  select btrim(so_qd) as so_qd_norm,
         (array_agg(id order by created_at asc, id asc))[1] as keep_id
  from public.qd_giao_a
  where so_qd is not null and btrim(so_qd) <> ''
  group by btrim(so_qd)
  having count(*) > 1
),
dup as (
  select distinct on (k.keep_id)
         k.keep_id,
         g.phu_luc, g.scan_raw, g.ten_pc_tinh, g.trich_yeu,
         g.ngay_qd, g.storage_path
  from public.qd_giao_a g
  join keep k on btrim(g.so_qd) = k.so_qd_norm
  where g.id <> k.keep_id
  order by k.keep_id, g.created_at asc
)
update public.qd_giao_a q
set phu_luc = coalesce(q.phu_luc, dup.phu_luc),
    scan_raw = coalesce(q.scan_raw, dup.scan_raw),
    ten_pc_tinh = coalesce(q.ten_pc_tinh, dup.ten_pc_tinh),
    trich_yeu = coalesce(q.trich_yeu, dup.trich_yeu),
    ngay_qd = coalesce(q.ngay_qd, dup.ngay_qd),
    storage_path = coalesce(q.storage_path, dup.storage_path),
    updated_at = now()
from dup
where q.id = dup.keep_id;

-- ---------- BƯỚC 4: XÓA BẢN TRÙNG ----------

with keep as (
  select btrim(so_qd) as so_qd_norm,
         (array_agg(id order by created_at asc, id asc))[1] as keep_id
  from public.qd_giao_a
  where so_qd is not null and btrim(so_qd) <> ''
  group by btrim(so_qd)
  having count(*) > 1
)
delete from public.qd_giao_a g
using keep k
where btrim(g.so_qd) = k.so_qd_norm
  and g.id <> k.keep_id;

-- ---------- BƯỚC 5: BẬT UNIQUE (1 hồ sơ / số QĐ) ----------

create unique index if not exists qd_giao_a_so_qd_unique
  on public.qd_giao_a (btrim(so_qd))
  where so_qd is not null and btrim(so_qd) <> '';

-- ---------- BƯỚC 6: KIỂM TRA ----------
-- select btrim(so_qd) so_qd, count(*) from public.qd_giao_a
-- where so_qd is not null and btrim(so_qd) <> ''
-- group by btrim(so_qd) having count(*) > 1;   -- phải trả 0 dòng
