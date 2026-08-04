# HDSD — Đăng nhập & Quản lý hệ thống

## Đăng nhập

1. Mở hệ thống → nếu chưa đăng nhập sẽ vào màn **Đăng nhập**.
2. Nhập **email** và **mật khẩu** (mặc định khi được cấp login).
3. Sau khi đăng nhập thành công vào trang **chọn phân hệ** — Tư vấn thiết kế · Thí nghiệm hiệu chỉnh · Tư vấn giám sát. Mỗi thẻ hiện **Đã giao nhiệm vụ** / **Chưa giao nhiệm vụ** (dự án đã lưu; đã giao = đã có quyết định giao Xí nghiệp, kể cả được phủ trong QĐ chung). Chọn phân hệ của tổ mình để vào Quản lý dự án.

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

1. Chạy SQL [010_nhat_ky_hoat_dong.sql](d:\AIProject\gnvnpsc\scripts\sql\010_nhat_ky_hoat_dong.sql) và [012_phan_he_truy_vet.sql](d:\AIProject\gnvnpsc\scripts\sql\012_phan_he_truy_vet.sql) trên Supabase.
2. Vào **Quản lý hệ thống** — mở sẵn **Giám sát hoạt động**.
3. Lọc theo phân hệ / hành động · tích **Hide Admin** để chỉ xem thao tác non-admin · làm mới · xuất CSV.
4. Hệ thống ghi tự động: đăng nhập thành công/thất bại, đăng xuất, cấp / đặt lại đăng nhập, quét Giao A, lưu / hủy bản quét, thêm–sửa–xóa dự án, xóa dự thảo quyết định giao Xí nghiệp, sửa nhân sự và Xí nghiệp.
5. Cột **Chi tiết** ghi rõ bằng tiếng Việt: người thực hiện, tổ, số quyết định, số dự án, mã đối tượng đầy đủ.

## Quản lý nhân sự & cấp login

1. Chạy SQL [005_nhan_su.sql](d:\AIProject\gnvnpsc\scripts\sql\005_nhan_su.sql) trên Supabase, sau đó [014_quyen_truong_phong.sql](d:\AIProject\gnvnpsc\scripts\sql\014_quyen_truong_phong.sql) và [015_phan_biet_pho_phong.sql](d:\AIProject\gnvnpsc\scripts\sql\015_phan_biet_pho_phong.sql).
2. **Quản lý hệ thống → Quản lý nhân sự**.
3. Bấm **+ Thêm mới** để thêm người; bấm biểu tượng bút chì để **sửa ngay tại dòng** (gồm cột **Tổ**: TV / TN / GS).
4. Bấm biểu tượng chìa khóa để **cấp đăng nhập / đặt lại mật khẩu** — mật khẩu mặc định `Gnvnpsc@2026` (hoặc biến `DEFAULT_USER_PASSWORD`).
5. Trưởng phòng xem và sửa được **cả ba phân hệ**; nhân viên và Phó phòng theo tổ được phân công, vào phân hệ khác chỉ xem.

## Quản lý hệ thống

| Mục | Việc làm được |
|-----|----------------|
| Giám sát hoạt động | Nhật ký hoạt động (Admin) · danh sách tài khoản · cấp / đặt lại mật khẩu |
| Quản lý nhân sự | Thêm / sửa tại dòng · gán Tổ · cấp / đặt lại đăng nhập |
| Danh sách Xí nghiệp | Thêm / sửa / ẩn–hiện; đánh dấu phù hợp Tư vấn thiết kế · Thí nghiệm · Tư vấn giám sát |
| Tài khoản | Họ tên · email · đổi MK (tùy chọn) · đăng xuất |

Ẩn Xí nghiệp / Nhân sự = không dùng cho giao dịch mới (không xóa lịch sử).
