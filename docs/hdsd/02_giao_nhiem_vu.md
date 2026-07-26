# HDSD — Giao nhiệm vụ theo dự án

## Mở màn hình

Từ **Quản lý dự án**, mở một dòng dự án (nút / liên kết giao Xí nghiệp) → vào trang **Giao nhiệm vụ**.

## I. Thông tin chung

- Xem mã, tên, địa điểm, cấp điện áp, **hướng giao**.
- **Giao A số**: bấm để mở màn Review của Quyết định Giao A.
- Đọc trích yếu và quy mô (căn đều) để đối chiếu khi soạn giao.

## II. Phần giao nhiệm vụ

Hệ thống có **3 loại thẻ**; mỗi dự án chỉ hiện thẻ **TVTK đúng cấp điện áp** (đã chọn khi nhập / Review Giao A) cùng thẻ Thí nghiệm (nếu thuộc hướng giao):

| # | Thẻ | Khi hiện |
|---|-----|----------|
| 1 | Giao tư vấn thiết kế **110kV** | `cap_dien_ap` = 110 kV |
| 2 | Giao Tư vấn thiết kế **trung, hạ áp** | `cap_dien_ap` = trung hạ áp |
| 3 | Giao Thí nghiệm, **hiệu chỉnh** | Luôn liệt kê; khóa nếu hướng giao không có TN |

- Nếu dự án chỉ đánh dấu một hướng (TVTK hoặc TN), thẻ không thuộc hướng sẽ **khóa**.
- Chưa có cấp điện áp: **không hiện** thẻ TVTK — cần cập nhật ở Review Giao A.
- Đã có dự thảo: thẻ hiện **đơn vị**, **thời hạn**, **trạng thái**.

### Lập dự thảo mới

1. Bấm **+ Lập** (hoặc **Mở soạn** nếu đã có dự thảo) → mở **trang soạn riêng** (không trôi form dưới thẻ).
2. Điền đơn vị, số/ngày, phạm vi, thời hạn, căn cứ (+ ô Word nếu cần).
3. Dùng thanh nút: **Lưu** · **Lưu & đóng** · **Xuất Word** · **Xuất PDF**.

### Xuất Word / PDF

| Nút | Kết quả |
|-----|---------|
| Xuất Word | Điền 1 trong 3 mẫu `public/templates/` (theo loại + cấp ĐA) rồi tải `.docx` |
| Xuất PDF | Mở bản in tóm tắt → Ctrl+P → Save as PDF (văn bản đầy đủ vẫn lấy từ Word) |
