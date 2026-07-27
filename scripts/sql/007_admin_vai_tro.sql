-- Vai trò + tài khoản Admin (không thuộc Phòng Kinh doanh)
-- Chạy trên Supabase SQL Editor.

alter table public.nhan_su
  add column if not exists vai_tro text not null default 'user'
    check (vai_tro in ('admin', 'user'));

-- Admin hệ thống (đơn vị Quản trị — tách khỏi danh bạ PKD)
insert into public.nhan_su (
  ma_nv, ho_ten, email, don_vi, chuc_danh, dien_thoai, active, vai_tro
)
values (
  'ADMIN',
  'Quản trị hệ thống',
  'admin@gnvnpsc.local',
  'Quản trị hệ thống',
  'Admin',
  null,
  true,
  'admin'
)
on conflict (email) do update set
  ma_nv = excluded.ma_nv,
  ho_ten = excluded.ho_ten,
  don_vi = excluded.don_vi,
  chuc_danh = excluded.chuc_danh,
  vai_tro = 'admin',
  active = true,
  updated_at = now();

-- Đảm bảo nhân sự PKD còn lại là user (nếu đã seed)
update public.nhan_su
set vai_tro = 'user'
where email <> 'admin@gnvnpsc.local'
  and coalesce(vai_tro, 'user') <> 'admin';
