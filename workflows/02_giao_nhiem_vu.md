# Workflow — Giao nhiệm vụ theo dự án

> **Màn hình:** Quản lý dự án (bảng danh mục) · Giao nhiệm vụ · Soạn quyết định giao Xí nghiệp
> **Route:** `/tvtk`, `/thi-nghiem`, `/tvgs`, `/du-an/[id]/giao-xn`, `/du-an/[id]/sua`

## Luồng nghiệp vụ

```mermaid
flowchart TD
  classDef userClass fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#000
  classDef processClass fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#000
  classDef aiClass fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#000
  classDef dbClass fill:#E8F5E9,stroke:#388E3C,stroke-width:2px,color:#000
  classDef exportClass fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#000

  Hub(["👤 Chọn phân hệ sau đăng nhập"])
  Bang["Bảng Quản lý dự án của phân hệ — chỉ dự án đã lưu"]
  Chon{"Người dùng bấm gì trên dòng dự án?"}
  Sua["Sửa thông tin chung của dự án"]
  ChonXn["Chọn Xí nghiệp ngay trên bảng — có tìm kiếm"]
  MoPdf["Mở tệp PDF Quyết định Giao A"]
  Mo["Mở màn Giao nhiệm vụ"]
  Info["Xem thông tin chung: mã, tên, địa điểm, cấp điện áp, quy mô"]
  Cap{"Đã có cấp điện áp?"}
  NoCap["Nhắc bổ sung cấp điện áp trước khi xuất Word"]
  Cta["Bấm Giao nhiệm vụ"]
  Form["Trang soạn quyết định dạng giấy"]
  MacDinh["Tự điền căn cứ, chủ đầu tư, Xí nghiệp, ngày"]
  Tien{"Thuộc loại trung hạ áp?"}
  L1["Tính chi phí bước 1 và tạm ứng"]
  Valid{"Đủ đơn vị nhận và thông tin bắt buộc?"}
  Save["Lưu quyết định giao Xí nghiệp"]
  Log["Ghi nhật ký người giao nhiệm vụ"]
  Word["Xuất Word theo mẫu — số quyết định trống để ký sau"]
  Xoa{"Cần bỏ quyết định đã soạn?"}
  CheckTt{"Quyết định còn ở trạng thái Nháp?"}
  Chan["Chặn xóa — hạ trạng thái về Nháp trước"]
  XoaXong["Xóa dự thảo, ghi nhật ký người xóa"]
  End(["Về bảng Quản lý dự án — trạng thái đã giao"])

  Hub --> Bang --> Chon
  Chon -->|Biểu tượng sửa| Sua --> Bang
  Chon -->|Ô Xí nghiệp| ChonXn --> Bang
  Chon -->|Số Giao A| MoPdf
  Chon -->|Tên dự án| Mo --> Info --> Cap
  Cap -->|Chưa| NoCap --> Cta
  Cap -->|Có| Cta
  Cta --> Form --> MacDinh --> Tien
  Tien -->|Có| L1 --> Valid
  Tien -->|Không| Valid
  Valid -->|Thiếu| Form
  Valid -->|Đủ| Save --> Log --> End
  Form -.-> Word
  Form --> Xoa
  Xoa -->|Có| CheckTt
  CheckTt -->|Không| Chan --> Form
  CheckTt -->|Còn nháp| XoaXong --> End

  class Hub,Bang,Sua,ChonXn,MoPdf,Mo,Info,Cta,Form,MacDinh userClass
  class Chon,Cap,Tien,Valid,Xoa,CheckTt processClass
  class L1 aiClass
  class Save,Log,End dbClass
  class NoCap,Word,Chan,XoaXong exportClass
```

## Nội dung màn hình

| Phần | Nội dung |
|------|----------|
| Bảng Quản lý dự án | Số thứ tự · Mã dự án · Tên dự án (bấm để giao nhiệm vụ) · Loại · Số/ngày Giao A kèm người quét · Xí nghiệp (chọn trực tiếp) · Trạng thái · Sửa |
| Màn Giao nhiệm vụ | Thông tin chung, trích yếu Giao A, quy mô và một nút hành động duy nhất |
| Trang soạn | Giấy quyết định theo loại (110 kV xanh dương · trung hạ áp xanh ngọc · thí nghiệm vàng cát); Lưu · xuất Word |

## Quy tắc soạn (đã chốt)

| Mục | Quy tắc |
|-----|---------|
| Chỉ dự án đã lưu | Bản quét nháp chưa hiện trên bảng nên không thể giao nhiệm vụ |
| Loại quyết định | Theo phân hệ và cấp điện áp của dự án |
| Chủ đầu tư | Chỉ «Công ty Điện lực [tỉnh]» — cắt phần «để thực hiện…» |
| Địa điểm trống | Suy từ chủ đầu tư / tên dự án khi tải danh mục |
| Số quyết định trống | Xuất Word chèn khoảng trắng để điền tay |
| Tư vấn thiết kế trung hạ áp | Chi phí bước 1 = tổng mức đầu tư × 3,3%; tạm ứng kèm số tiền bằng chữ |
| Tư vấn thiết kế 110 kV | Không tính chi phí bước 1 / tạm ứng |
| Xuất PDF | Tạm ẩn nút; giữ logic để bật lại sau |
| Xóa dự thảo | Nút **Xóa dự thảo** trên trang soạn (chỉ hiện khi đã lưu); chỉ xóa khi còn trạng thái Nháp, đã trình GĐ / đã ban hành thì phải hạ trạng thái trước (Admin được xóa để dọn dữ liệu sai) |
| Xóa dự án | Dự án còn quyết định giao Xí nghiệp thì bị chặn xóa — phải xóa dự thảo quyết định trước |

## Phụ lục kỹ thuật

| Mục | Chi tiết |
|-----|----------|
| Bảng danh mục | `DuAnDashboard.tsx` — nguồn `GET /api/du-an?phan_he=` (lọc `da_luu = true`) |
| UI giao nhiệm vụ | `GiaoNhiemVuSection.tsx` |
| Sửa thông tin chung | `/du-an/[id]/sua` · `SuaDuAnForm.tsx` |
| UI soạn | `SoanQdGiaoXnEditor.tsx` · banner `QdGiaoXnDocBanner.tsx` |
| Xóa dự thảo | `DELETE /api/qd-giao-xn/[id]` — chặn khi `trang_thai <> 'nhap'`, ghi nhật ký `GIAO_XN / DELETE` |
| Theme phân hệ | `phan-he.ts` · `soan-qd-theme.ts` |
| Mặc định chủ đầu tư / XN | `soan-qd-defaults.ts` |
| Tiền bước 1 / số thành chữ | `tinh-tien-giao-xn.ts` · `so-tien-bang-chu.ts` |
| Word | `fill-qd-giao-xn.ts` · mẫu trong `public/templates/` |
| PDF Giao A | `GET /api/giao-a/[id]/pdf` |
| SQL | `008_phu_luc_giao_a.sql` · `009_ten_pc_tinh.sql` · `012_phan_he_truy_vet.sql` |
