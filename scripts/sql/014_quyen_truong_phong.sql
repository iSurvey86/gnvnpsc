-- Quyền Trưởng phòng trên toàn bộ 3 phân hệ
-- Chạy sau 012_phan_he_truy_vet.sql

insert into public.nhan_su_phan_he (
  nhan_su_id,
  phan_he,
  vai_tro_phan_he,
  active
)
select
  ns.id,
  ph.phan_he,
  'manager',
  true
from public.nhan_su ns
cross join (
  values ('tvtk'), ('thi_nghiem'), ('tvgs')
) as ph(phan_he)
where ns.active = true
  and lower(coalesce(ns.chuc_danh, '')) like '%trưởng phòng%'
on conflict (nhan_su_id, phan_he)
do update set
  vai_tro_phan_he = 'manager',
  active = true;

comment on table public.nhan_su_phan_he is
  'Phân công tổ và quyền theo phân hệ. Trưởng phòng có manager trên TV, TN, GS.';
