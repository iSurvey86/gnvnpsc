-- Cập nhật danh sách Nhân sự = Phòng Kinh doanh (thay seed tạm gnvnpsc.*@gmail.com)
-- Chạy trên Supabase SQL Editor nếu đã chạy 005 bản cũ.

alter table public.nhan_su
  add column if not exists dien_thoai text;

-- Gỡ 10 email tạm
delete from public.nhan_su
where email like 'gnvnpsc.%@gmail.com';

insert into public.nhan_su (ma_nv, ho_ten, email, don_vi, chuc_danh, dien_thoai, active)
values
  ('KD01', 'Nguyễn Hải Đăng',       'dangnh@npc.com.vn',              'Phòng Kinh doanh', 'Trưởng phòng Kinh doanh',                         '0962207373', true),
  ('KD02', 'Nguyễn Tiến Đức',       'ducnt.tsbn@gmail.com',           'Phòng Kinh doanh', 'Phó Trưởng phòng Kinh doanh',                     '0878806969 / 0963993735', true),
  ('KD03', 'Lê Văn Hoài',           'hoailv259@gmail.com',            'Phòng Kinh doanh', 'Phó Trưởng phòng Kinh doanh',                     '0963986662', true),
  ('KD04', 'Nguyễn Trung Kiên',     'trungkien43b@gmail.com',         'Phòng Kinh doanh', 'Phó Trưởng phòng Kinh doanh',                     '0934516160', true),
  ('KD05', 'Nguyễn Tiến Việt',      'tienviet2801@gmail.com',         'Phòng Kinh doanh', 'Chuyên viên Kinh doanh và dịch vụ khách hàng',   '0911028899', true),
  ('KD06', 'Nguyễn Hoàng Long',     'longnh.npsc@gmail.com',          'Phòng Kinh doanh', 'Chuyên viên Kinh doanh và dịch vụ khách hàng',   '0976873482', true),
  ('KD07', 'Nguyễn Thị Diệu Linh',  'linhthanganh83@gmail.com',       'Phòng Kinh doanh', 'Chuyên viên Kinh doanh và dịch vụ khách hàng',   '0983190826', true),
  ('KD08', 'Nguyễn Ngọc Khánh',     'kalove1909@gmail.com',           'Phòng Kinh doanh', 'Chuyên viên Kinh doanh và dịch vụ khách hàng',   '0977914867', true),
  ('KD09', 'Hoàng Thị Hồng Điệp',   'hoangdiep@ymail.com',            'Phòng Kinh doanh', 'Chuyên viên quản lý hợp đồng',                   '0982958228', true),
  ('KD10', 'Nguyễn Trọng Đại',      'trongdai69@gmail.com',           'Phòng Kinh doanh', 'Chuyên viên quản lý hợp đồng',                   '0914655108', true),
  ('KD11', 'Nguyễn Tài Hiếu',       'hieunt.npsc@gmail.com',          'Phòng Kinh doanh', 'Chuyên viên quản lý hợp đồng',                   '0973425492 / 0911128456', true),
  ('KD12', 'Vương Văn Đạt',         'datvv.npsc@gmail.com',           'Phòng Kinh doanh', 'Chuyên viên quản lý hợp đồng',                   '0346286133', true),
  ('KD13', 'Hà Thị Thu Hương',      'huongsen3982@gmail.com',         'Phòng Kinh doanh', 'Chuyên viên quản lý hợp đồng',                   '0912060181', true),
  ('KD14', 'Nguyễn Thị Phương Dung','phuongdungnpsc@gmail.com',       'Phòng Kinh doanh', 'Chuyên viên quản lý hợp đồng',                   '0975955836', true),
  ('KD15', 'Đào Thị Diệu Thúy',     'sonthuy@gmail.com',              'Phòng Kinh doanh', 'Chuyên viên quản lý hợp đồng',                   '0988612677', true),
  ('KD16', 'Nguyễn Hà Vinh',        'vinhnguyenlhp21@gmail.com',      'Phòng Kinh doanh', 'Chuyên viên dự toán',                            '0949819635', true),
  ('KD17', 'Nguyễn Mạnh Dũng',      'nguyenmanhdunghn82@gmail.com',   'Phòng Kinh doanh', 'Nhân viên Tư vấn thiết kế',                      '0983094698 / 0386281378', true)
on conflict (email) do update set
  ma_nv = excluded.ma_nv,
  ho_ten = excluded.ho_ten,
  don_vi = excluded.don_vi,
  chuc_danh = excluded.chuc_danh,
  dien_thoai = excluded.dien_thoai,
  active = excluded.active,
  updated_at = now();
