# HDSD — Giao nhiệm vụ theo Giao A

## Mở hồ sơ

1. Phân hệ → bảng **Giao A** → **Mở** một dòng.
2. Cột **Số công trình** / **Đã giao x/y CT** lấy theo **phụ lục** Giao A (có dự thảo = đã giao; dự thảo mới lưu đúng CT đã tick).
3. Xem thông tin Giao A + bảng công trình theo phụ lục (đã giao = mờ).
4. **Lập giao nhiệm vụ** hoặc **Giao tiếp còn lại** → trang soạn **mới** (CT đã giao khóa, bỏ tick).
5. **Mở soạn** trên quyết định đã lập → tick đúng CT thuộc quyết định đó.

## Lập / soạn quyết định

1. Bấm **Lập** / **Giao tiếp** / **Mở soạn** → trang soạn dạng giấy QĐ (110 xanh dương, THA xanh ngọc, Thí nghiệm vàng cát, **TVGS xanh cyan**).
2. Hệ thống tự điền: căn cứ từ Giao A, **chủ đầu tư** (PC tỉnh — giữ theo dự án), gợi ý Xí nghiệp cùng tỉnh (có thể đổi), ngày ban hành. **Nơi nhận** trên Word: Như Điều 3 · Ban Giám đốc · Lưu VT, KD (không liệt kê lại XN). Tên Xí nghiệp nhận vẫn ở thân QĐ / Điều 3.
3. Kiểm tra / sửa: số QĐ, năm ĐTXD, thời hạn, **Xí nghiệp nhận**. Quy mô chi tiết từng công trình nằm ở phụ lục khi xuất Word (không còn ô phạm vi chung trên form soạn).
4. **Tick công trình** giao lần này:
   - **Giao tiếp còn lại:** CT đã giao → **khóa + bỏ tick**; chỉ chọn phần chưa giao.
   - **Mở soạn:** CT thuộc dự thảo đó được tick sẵn; CT của QĐ khác vẫn khóa.
5. **Tính tiền:**
   - TVTK THA: GHĐ theo loại hình; tạm ứng lần 1 = **10%** × GHĐ (làm tròn hàng triệu); số **đồng**.
   - TVGS: GHĐ **1%** × TMĐT; không tạm ứng; tiền bằng số/chữ.
   - TNHC: tính sau.
6. **Lưu** trước · **Lưu & đóng** · rồi mới **Xuất Word** (nút xuất tắt nếu chưa lưu lần nào) · **Tải PDF đã ký**.
7. **Quay lại** (trang trước) hoặc **Đóng** (về hồ sơ Giao A) → giao tiếp phần còn lại nếu cần.

### Một quyết định phủ nhiều công trình

1. Từ hồ sơ Giao A → **Lập** / **Giao tiếp còn lại** (soạn mới) hoặc **Mở soạn** (sửa dự thảo).
2. Tick công trình giao cho Xí nghiệp đang chọn; đã giao ở QĐ khác bị khóa/mờ.
3. Chia nhiều XN: giao một phần → **Lưu** → quay hồ sơ → **Giao tiếp còn lại**.
4. Cần SQL [019](d:\AIProject\gnvnpsc\scripts\sql\019_qd_giao_xn_du_an.sql) và [024](d:\AIProject\gnvnpsc\scripts\sql\024_qd_giao_xn_cong_trinh_chon.sql) nếu chưa chạy.

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
| Xuất Word | Điền mẫu Word theo loại + cấp điện áp, tải `.docx`. **Phải Lưu dự thảo trước** (nút tắt nếu chưa lưu). Tên tệp: `GNV-[viết tắt XN]-[mã dự án]-[yyyyMMdd]-[HHmmss].docx` (giờ VN). Số QĐ / ngày ban hành để trống → khoảng trắng để điền tay hoặc Doffice. **Điều 3:** `{Ông/Bà} Giám đốc {tên XN}…` — XN **Tuyên Quang** = Bà, XN khác = Ông (TVTK / TVGS / TNHC). |

### Gợi ý thao tác

- Chủ đầu tư chỉ giữ tên «Công ty Điện lực …» (không kèm đoạn «để thực hiện…»).
- Địa điểm trống trên danh mục: mở lại danh mục dự án để hệ thống bổ sung từ tên / PC tỉnh (cần đã chạy SQL cột PC tỉnh nếu dùng).
