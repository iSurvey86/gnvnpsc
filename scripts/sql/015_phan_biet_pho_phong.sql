-- Phân biệt Phó phòng với Trưởng phòng
-- Chạy sau 014_quyen_truong_phong.sql
--
-- 014 đã cấp quyền cả 3 phân hệ cho mọi chức danh chứa 'trưởng phòng',
-- nên 'Phó Trưởng phòng' bị cấp thừa. Phó phòng chỉ phụ trách tổ được giao.
--
-- Mặc định đưa Phó phòng về tổ Tư vấn thiết kế (giữ nguyên quyền như seed 012);
-- Admin vào Quản lý nhân sự → Sửa để gán lại tổ đúng cho từng người.

-- Bỏ quyền Thí nghiệm / TVGS đã cấp thừa cho Phó phòng
update public.nhan_su_phan_he nsp
set active = false
from public.nhan_su ns
where ns.id = nsp.nhan_su_id
  and lower(coalesce(ns.chuc_danh, '')) like '%phó%'
  and lower(coalesce(ns.chuc_danh, '')) like '%phòng%'
  and coalesce(ns.vai_tro, 'user') <> 'admin'
  and nsp.phan_he in ('thi_nghiem', 'tvgs');

-- Phó phòng phụ trách tổ: quyền quản lý trên tổ còn hiệu lực
update public.nhan_su_phan_he nsp
set vai_tro_phan_he = 'manager',
    active = true
from public.nhan_su ns
where ns.id = nsp.nhan_su_id
  and lower(coalesce(ns.chuc_danh, '')) like '%phó%'
  and lower(coalesce(ns.chuc_danh, '')) like '%phòng%'
  and coalesce(ns.vai_tro, 'user') <> 'admin'
  and nsp.phan_he = 'tvtk';

-- Kiểm tra
-- select ns.ma_nv, ns.ho_ten, ns.chuc_danh, nsp.phan_he, nsp.vai_tro_phan_he, nsp.active
-- from public.nhan_su ns
-- left join public.nhan_su_phan_he nsp on nsp.nhan_su_id = ns.id
-- order by ns.ma_nv, nsp.phan_he;
