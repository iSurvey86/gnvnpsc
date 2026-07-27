# HDSD — Giao nhiệm vụ theo dự án

## Mở màn hình

Từ **Quản lý dự án**, mở một dòng dự án → trang **Giao nhiệm vụ**.

## I. Thông tin chung

- Xem mã, tên, địa điểm, cấp điện áp, **hướng giao**.
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

1. Bấm **+ Lập** hoặc **Mở soạn** → trang soạn dạng giấy QĐ (màu pastel khác nhau theo loại).
2. Hệ thống tự điền: căn cứ từ Giao A, chủ đầu tư (PC tỉnh), Xí nghiệp cùng tỉnh, ngày ban hành.
3. Kiểm tra / sửa: số QĐ, năm ĐTXD, phạm vi, thời hạn.
4. **Trung hạ áp:** bảng chi phí lần 01 (L1) và tạm ứng (số + bằng chữ) tự tính từ phụ lục — có thể sửa tay.
5. Thanh nút: **Lưu** · **Lưu & đóng** · **Xuất Word** · **Xuất PDF**.

### Xuất Word / PDF

| Nút | Kết quả |
|-----|---------|
| Xuất Word | Điền mẫu Word theo loại + cấp điện áp, tải `.docx`. Số QĐ để trống sẽ thành khoảng trắng để điền tay sau. |
| Xuất PDF | Mở bản in tóm tắt → Ctrl+P → Save as PDF (văn bản đầy đủ lấy từ Word). |

### Gợi ý thao tác

- Chủ đầu tư chỉ giữ tên «Công ty Điện lực …» (không kèm đoạn «để thực hiện…»).
- Địa điểm trống trên danh mục: mở lại danh mục dự án để hệ thống bổ sung từ tên / PC tỉnh (cần đã chạy SQL cột PC tỉnh nếu dùng).
