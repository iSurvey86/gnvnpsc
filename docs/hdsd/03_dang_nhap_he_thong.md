# HDSD — Đăng nhập & Quản lý hệ thống

## Đăng nhập

1. Mở hệ thống → nếu chưa đăng nhập sẽ vào màn **Đăng nhập**.
2. Nhập **email** và **mật khẩu** (mặc định khi được cấp login).
3. Sau khi đăng nhập thành công vào **Quản lý dự án**.

### Đăng xuất

- Sidebar (cuối menu) → **Đăng xuất**, hoặc
- **Quản lý hệ thống** → **Tài khoản** → Đăng xuất.

### Đổi mật khẩu

Vào **Tài khoản** → form đổi mật khẩu. **Đề nghị** đổi nếu đang dùng mật khẩu mặc định — **không bắt buộc** lần đầu.

## Nhân sự & cấp login

1. Chạy SQL [005_nhan_su.sql](d:\AIProject\gnvnpsc\scripts\sql\005_nhan_su.sql) trên Supabase (10 email tạm @gmail.com).
2. **Quản lý hệ thống → Nhân sự**.
3. Bấm **Cấp login** (hoặc **Reset MK**) → hệ thống tạo/cập nhật user Auth với mật khẩu mặc định `Gnvnpsc@2026` (hoặc biến `DEFAULT_USER_PASSWORD`).
4. Sau có HRMS: sửa email / import — giữ nút cấp login.

## Quản lý hệ thống

| Mục | Việc làm được |
|-----|----------------|
| Nhân sự | Thêm/sửa/ẩn · cấp / reset đăng nhập |
| Danh mục Xí nghiệp | Thêm / sửa / ẩn–hiện; TVTK / TN |
| Tài khoản | Xem phiên · đổi MK (tùy chọn) · đăng xuất |
| Mẫu Word | Tải 3 mẫu QĐ giao XN |

Ẩn Xí nghiệp / Nhân sự = không dùng cho giao dịch mới (không xóa lịch sử).
