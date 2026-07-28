# HDSD — Đăng nhập & Quản lý hệ thống

## Đăng nhập

1. Mở hệ thống → nếu chưa đăng nhập sẽ vào màn **Đăng nhập**.
2. Nhập **email** và **mật khẩu** (mặc định khi được cấp login).
3. Sau khi đăng nhập thành công vào **Quản lý dự án**.

### Đăng xuất / Tài khoản (sidebar)

- Bấm **avatar** (cuối sidebar) → hiện **họ tên**.
- Menu: **Tài khoản** · **Đăng xuất**.
- Trang **Tài khoản**: họ và tên · email · đổi mật khẩu (tùy chọn) · đăng xuất.

### Đổi mật khẩu

Vào **Tài khoản** (từ avatar) → form đổi mật khẩu. **Đề nghị** đổi nếu đang dùng mật khẩu mặc định — **không bắt buộc** lần đầu.

## Danh sách tài khoản

- **User thường:** sidebar → **Danh sách tài khoản** (mã NV · họ tên · email · SĐT; sắp theo mã NV tăng dần).
- **Admin:** **Quản lý hệ thống → Giám sát hoạt động** → tab **Danh sách tài khoản**; có thêm nút **Cấp đăng nhập / Đặt lại MK**.

## Nhật ký hoạt động (chỉ Admin)

1. Chạy SQL [010_nhat_ky_hoat_dong.sql](d:\AIProject\gnvnpsc\scripts\sql\010_nhat_ky_hoat_dong.sql) trên Supabase.
2. **Quản lý hệ thống → Giám sát hoạt động → Nhật ký hoạt động**.
3. Lọc theo phân hệ / hành động · làm mới · xuất CSV.
4. Hệ thống ghi tự động: đăng nhập thành công/thất bại, đăng xuất, cấp / đặt lại đăng nhập.

## Nhân sự & cấp login

1. Chạy SQL [005_nhan_su.sql](d:\AIProject\gnvnpsc\scripts\sql\005_nhan_su.sql) trên Supabase (10 email tạm @gmail.com).
2. **Quản lý hệ thống → Nhân sự**.
3. Bấm **Cấp login** (hoặc **Reset MK**) → hệ thống tạo/cập nhật user Auth với mật khẩu mặc định `Gnvnpsc@2026` (hoặc biến `DEFAULT_USER_PASSWORD`).
4. Sau có HRMS: sửa email / import — giữ nút cấp login.

## Quản lý hệ thống

| Mục | Việc làm được |
|-----|----------------|
| Giám sát hoạt động | Nhật ký (Admin) · danh sách tài khoản · cấp / đặt lại MK |
| Nhân sự | Thêm/sửa/ẩn · cấp / reset đăng nhập |
| Danh mục Xí nghiệp | Thêm / sửa / ẩn–hiện; TVTK / TN |
| Tài khoản | Họ tên · email · đổi MK (tùy chọn) · đăng xuất |
| Mẫu Word | Tải 3 mẫu QĐ giao XN |

Ẩn Xí nghiệp / Nhân sự = không dùng cho giao dịch mới (không xóa lịch sử).
