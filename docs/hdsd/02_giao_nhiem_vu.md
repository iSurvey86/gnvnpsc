# HDSD — Giao nhiệm vụ theo dự án

## Mở danh sách QĐ giao Xí nghiệp

Sidebar → **QĐ giao Xí nghiệp**: bảng **STT · Mã dự án · Tên dự án · Loại · Số/Ngày · Xí nghiệp · Trạng thái** (tiêu đề cột căn giữa).

## Mở màn hình

Từ **Quản lý dự án**, mở một dòng dự án → trang **Giao nhiệm vụ**.

## I. Thông tin chung

- Xem mã, tên, địa điểm, cấp điện áp, **loại hình dự án**, **hướng giao**.
- **Giao A số**: bấm để mở **file PDF** Quyết định giao danh mục (tab mới).
- Đọc trích yếu và quy mô để đối chiếu khi soạn.

## II. Phần giao nhiệm vụ

Mỗi dự án chỉ hiện thẻ **TVTK đúng cấp điện áp** cùng thẻ Thí nghiệm (nếu thuộc hướng giao):

| # | Thẻ | Khi hiện |
|---|-----|----------|
| 1 | Giao tư vấn thiết kế **110kV** | Cấp điện áp = 110 kV |
| 2 | Giao Tư vấn thiết kế **trung, hạ áp** | Cấp điện áp = trung hạ áp |
| 3 | Giao Thí nghiệm, **hiệu chỉnh** | Theo hướng giao |

- Thẻ không thuộc hướng giao sẽ **khóa**.
- Chưa có cấp điện áp: cảnh báo — cần cập nhật ở Review Giao A.
- Đã có dự thảo: thẻ hiện đơn vị, thời hạn, trạng thái.

### Lập / soạn quyết định

1. Bấm **+ Lập** hoặc **Mở soạn** → trang soạn dạng giấy QĐ (110 xanh dương, THA xanh ngọc, Thí nghiệm vàng cát trầm).
2. Hệ thống tự điền: căn cứ từ Giao A, chủ đầu tư (PC tỉnh), Xí nghiệp cùng tỉnh, ngày ban hành.
3. Kiểm tra / sửa: số QĐ, năm ĐTXD, phạm vi, thời hạn.
4. **Trung hạ áp:** bảng chi phí lần 01 (L1) và tạm ứng (số + bằng chữ) tự tính từ phụ lục — có thể sửa tay.
5. Thanh nút: **Lưu** · **Lưu & đóng** · **Xuất Word** · **Tải PDF đã ký** (sau khi ký ngoài). Nút **Xuất PDF** đang tạm ẩn.
6. Sau khi **Lưu**: danh mục dự án hiện **Đã có dự thảo** dưới tên Xí nghiệp. Các dự án khác **cùng Giao A** có tên khớp công trình còn lại trên bảng soạn cũng được gắn vào quyết định này (nhãn **Đã có trong QĐ**) — không cần / không được lập quyết định riêng. Nhật ký ghi **Tạo mới** / **Cập nhật** (phân hệ Giao Xí nghiệp).
7. Sau khi **Tải PDF đã ký**: trạng thái **Đã giao**, bỏ dấu Dự thảo; bấm nhãn trên danh mục để xem PDF. Nhật ký ghi cập nhật «Tải PDF đã ký».
8. **Xuất Word** cũng được ghi nhật ký (**Xuất văn bản**). Vì xuất thường lưu trước, có thể thấy hai dòng liền nhau (Cập nhật + Xuất văn bản).

### Một quyết định phủ nhiều công trình

1. Mở **bất kỳ** dự án trong cùng Giao A → soạn quyết định; bảng công trình lấy từ phụ lục (có thể xóa bớt dòng không giao lần này).
2. **Lưu** (hoặc Xuất Word / Tải PDF ký): hệ thống gắn mọi dự án cùng Giao A, cùng phân hệ, trùng tên công trình vào quyết định.
3. Trên bảng Quản lý dự án, các dòng đã gắn hiện **Đã có trong QĐ** (hoặc số QĐ nếu có) thay vì «Chưa lập QĐ».
4. Bấm vào dòng đã gắn → **Mở soạn quyết định** đã lập (không tạo bản nháp mới).
5. Xóa dự thảo quyết định → các dự án đã gắn trở lại «Chưa lập QĐ».
6. Cần chạy SQL [019_qd_giao_xn_du_an.sql](d:\AIProject\gnvnpsc\scripts\sql\019_qd_giao_xn_du_an.sql) trên Supabase trước khi dùng.

### Tải PDF đã ký (chốt luồng)

1. Xuất Word → in / ký ngoài hệ thống → có tệp PDF đã ký.
2. Mở lại trang soạn quyết định → bấm **Tải PDF đã ký** → chọn tệp PDF.
3. Hệ thống lưu tệp và chuyển trạng thái **Đã giao**. Có thể **Xem PDF ký** hoặc **Đổi PDF đã ký** nếu tải lại.
4. Cần chạy SQL [018_qd_giao_xn_pdf_ky.sql](d:\AIProject\gnvnpsc\scripts\sql\018_qd_giao_xn_pdf_ky.sql) và tạo bucket Storage `qd-giao-xn` (nếu chưa có) trên Supabase.

### Xóa dự thảo quyết định

1. Mở lại quyết định cần bỏ → bấm **Xóa dự thảo** trên đầu trang soạn (chỉ hiện khi chưa Đã giao).
2. Chỉ xóa được khi quyết định còn **Nháp / dự thảo**. Quyết định **Đã giao** chỉ Quản trị được xóa để dọn dữ liệu sai.
3. Việc xóa được ghi nhật ký kèm số dự thảo, dự án và trạng thái trước khi xóa.
4. Muốn xóa hẳn dự án thì xóa dự thảo quyết định trước, sau đó xóa dự án ở danh mục.

### Xuất Word

| Nút | Kết quả |
|-----|---------|
| Xuất Word | Điền mẫu Word theo loại + cấp điện áp, tải `.docx`. Số QĐ để trống sẽ thành khoảng trắng để điền tay sau. |

### Gợi ý thao tác

- Chủ đầu tư chỉ giữ tên «Công ty Điện lực …» (không kèm đoạn «để thực hiện…»).
- Địa điểm trống trên danh mục: mở lại danh mục dự án để hệ thống bổ sung từ tên / PC tỉnh (cần đã chạy SQL cột PC tỉnh nếu dùng).
