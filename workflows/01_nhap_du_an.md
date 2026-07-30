# Workflow — Nhập dự án từ Giao A (quét → duyệt → lưu / hủy)

> **Màn hình:** Nhập dự án Giao A · Review sau ScanAI
> **Route:** `/tvtk/nhap-du-an`, `/thi-nghiem/nhap-du-an`, `/tvgs/nhap-du-an`, `/giao-a/[id]?phan_he=`

## Luồng nghiệp vụ

```mermaid
flowchart TD
  classDef userClass fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#000
  classDef processClass fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#000
  classDef aiClass fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#000
  classDef dbClass fill:#E8F5E9,stroke:#388E3C,stroke-width:2px,color:#000
  classDef exportClass fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#000

  Start(["👤 Vào phân hệ của tổ mình"])
  Quyen{"Được quyền thao tác trong phân hệ này?"}
  ChiXem["Chỉ xem — không quét, không giao nhiệm vụ"]
  Cta["Bấm Nhập dự án Giao A"]
  Pick["Chọn tệp PDF Quyết định Giao A"]
  Quet["Bấm Quét dữ liệu"]
  Ai["ScanAI nhận dạng danh mục dự án"]
  Fail{"Quét được danh mục dự án?"}
  Err["Hiện lỗi, xóa tệp vừa tải lên — không để lại bản nháp rỗng"]
  Pair{"Số quyết định này tổ khác đã lưu?"}
  HoiPair["Hỏi dùng chung hồ sơ Giao A đã có"]
  Nhap["Tạo bản quét NHÁP cho phân hệ — chưa vào danh mục"]
  Review["Màn Review — sửa mã, tên, địa điểm, quy mô, cấp điện áp, loại hình dự án"]
  ChonXn["Chọn Xí nghiệp dự kiến giao (nếu đã rõ)"]
  Cap{"Cấp điện áp của dự án?"}
  Mac110["Loại hình tự đặt là 110kV — không phải chọn"]
  ChonLoai["Chọn loại hình bắt buộc: CQT / SCMBA / DMS"]
  Quyet{"Người dùng chọn gì?"}
  Trung{"Có dự án trùng tên trong phân hệ?"}
  HoiTrung["Hỏi từng dòng: cập nhật bản cũ hoặc tạo mới"]
  ThieuLoai{"Dự án trung hạ áp đã chọn đủ loại hình?"}
  BaoThieu["Báo thiếu loại hình — không lưu được"]
  Luu["Lưu — danh mục dự án thành chính thức"]
  Huy["Hủy bản quét — xóa danh mục nháp và hồ sơ vừa quét"]
  Roi{"Bấm thoát khi còn bản chưa lưu?"}
  HoiRoi["Hỏi lại: Lưu rồi rời · Hủy rồi rời · Ở lại"]
  Log["Ghi nhật ký người quét, người lưu, người hủy"]
  Done(["Về Quản lý dự án — sẵn sàng giao nhiệm vụ"])

  Start --> Quyen
  Quyen -->|Không| ChiXem
  Quyen -->|Có| Cta --> Pick --> Quet --> Ai --> Fail
  Fail -->|Lỗi| Err --> Pick
  Fail -->|OK| Pair
  Pair -->|Có| HoiPair --> Nhap
  Pair -->|Chưa| Nhap
  Nhap --> Review --> Cap
  Cap -->|110kV| Mac110 --> ChonXn
  Cap -->|Trung hạ áp| ChonLoai --> ChonXn
  ChonXn --> Quyet
  Quyet -->|Lưu| ThieuLoai
  ThieuLoai -->|Thiếu| BaoThieu --> ChonLoai
  ThieuLoai -->|Đủ| Trung
  Trung -->|Có| HoiTrung --> Luu
  Trung -->|Không| Luu
  Quyet -->|Hủy bản quét| Huy --> Log
  Quyet -->|Thoát| Roi
  Roi -->|Còn nháp| HoiRoi
  HoiRoi -->|Lưu rồi rời| ThieuLoai
  HoiRoi -->|Hủy rồi rời| Huy
  HoiRoi -->|Ở lại| Review
  Luu --> Log --> Done

  class Start,Cta,Pick,Quet,Review,ChonXn,ChonLoai,HoiPair,HoiTrung,HoiRoi userClass
  class Quyen,Fail,Pair,Quyet,Trung,Roi,ThieuLoai,Cap processClass
  class Ai aiClass
  class Nhap,Luu,Log,Done,Mac110 dbClass
  class Err,ChiXem,Huy,BaoThieu exportClass
```

## Quy tắc «chưa lưu thì chưa tính»

| Tình huống | Hệ thống làm gì |
|---|---|
| Vừa quét xong | Bản quét là **nháp**: chỉ thấy trên màn Review, không hiện ở Quản lý dự án, không giao nhiệm vụ được |
| Bấm Lưu (Lưu tất cả / Lưu & đóng / Lưu & Quét tiếp) | Mọi dòng **trung hạ áp** phải chọn **loại hình dự án** (CQT / SCMBA / DMS); dòng **110kV** hệ thống tự đặt → danh mục thành chính thức, ghi nhật ký người lưu |
| Bấm Hủy bản quét | Xóa danh mục nháp; nếu hồ sơ Giao A chưa từng được lưu thì xóa luôn hồ sơ và tệp PDF |
| Bấm Về Quản lý dự án khi còn nháp | Hộp thoại 3 lựa chọn: Lưu rồi rời · Hủy bản quét rồi rời · Ở lại tiếp tục sửa |
| Đóng tab / bấm F5 khi còn nháp | Trình duyệt cảnh báo rời trang |
| Quét lại đúng số quyết định mà bản nháp trước bỏ dở | Dọn bản nháp bỏ dở, quét lại từ đầu |
| Quét xong nhưng không đọc được dự án nào | Báo lỗi ngay tại màn nhập, xóa tệp vừa tải lên; **không** tạo bản nháp rỗng |

## Ghi chú nghiệp vụ

- Mỗi tổ (Tư vấn thiết kế · Thí nghiệm · Tư vấn giám sát) quét và duyệt trong phân hệ của mình; vào lạc phân hệ chỉ được xem.
- Một Quyết định Giao A có thể sinh nhiệm vụ cho nhiều tổ: tổ sau dùng chung hồ sơ Giao A đã lưu (không tải lại PDF), chỉ tạo danh mục dự án riêng cho tổ mình.
- **Loại hình dự án** dùng cho chi phí sau này, phụ thuộc cấp điện áp:
  - Dự án **110kV** — loại hình luôn là 110kV, hệ thống tự đặt, người nhập không chọn.
  - Dự án **trung hạ áp** — bắt buộc chọn một trong ba: CQT (chống quá tải) · SCMBA (sửa chữa MBA) · DMS.
  - Đổi cấp điện áp từ 110kV sang trung hạ áp thì phải chọn lại loại hình.
  - Khác với «Loại hình tư vấn» (suy ra từ cấp điện áp / hướng giao).
- Tên dự án được phép trùng giữa các phân hệ; mã dự án mang hậu tố phân hệ để phân biệt.
- Cảnh báo trùng tên chỉ đối chiếu với dự án **đã lưu** trong cùng phân hệ.
- Nếu quyết định không có danh mục riêng mà chỉ có bảng phụ lục công trình, hệ thống lấy tên công trình trong phụ lục làm danh mục dự án.

## Phụ lục kỹ thuật

| Mục | Chi tiết |
|-----|----------|
| Upload + ingest | `POST /api/giao-a/ingest` — tạo bản ghi `da_luu = false` |
| Chốt lưu / hủy nháp | `POST` và `DELETE /api/giao-a/[id]/ban-nhap?phan_he=` |
| Danh mục dự án | `GET /api/du-an` mặc định lọc `da_luu = true` (`gom_ban_nhap=1` để lấy cả nháp) |
| Review UI | `ReviewGiaoAClient.tsx` · nút thoát `ThoatReviewLink.tsx` · guard `roi-trang-guard.ts` |
| Model ScanAI | Gemini Flash-Lite |
| SQL liên quan | `001` schema · `002` cấp ĐA · `003` hướng giao · `012` phân hệ + truy vết · `016` cờ `da_luu` · `017` loại hình dự án |
