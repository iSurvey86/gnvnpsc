# Workflow — Giao nhiệm vụ theo Giao A

> **Màn hình:** Danh sách Giao A · Theo dõi Giao A · Soạn quyết định giao Xí nghiệp
> **Route:** `/tvtk`, `/thi-nghiem`, `/tvgs`, `/giao-a/[id]/theo-doi`, `/du-an/[id]/giao-xn/soan`

## Luồng nghiệp vụ

```mermaid
flowchart TD
  classDef userClass fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#000
  classDef processClass fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#000
  classDef aiClass fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#000
  classDef dbClass fill:#E8F5E9,stroke:#388E3C,stroke-width:2px,color:#000
  classDef exportClass fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#000

  Hub(["👤 Chọn phân hệ sau đăng nhập"])
  Bang["Bảng theo dõi theo Quyết định Giao A"]
  Mo["Mở hồ sơ Giao A — thông tin chung + tiến độ"]
  XemCt["Xem danh sách công trình — đã giao bị mờ"]
  Lap{"Lập mới hay mở quyết định đã có?"}
  SoanMoi["Soạn — tick công trình còn lại, chọn Xí nghiệp"]
  SoanCu["Mở soạn quyết định đã lập"]
  Valid{"Đủ đơn vị nhận và thông tin bắt buộc?"}
  Save["Lưu — gắn công trình đã tick vào quyết định"]
  Word["Xuất Word / tải PDF đã ký"]
  Tiep{"Còn công trình chưa giao?"}
  Quay["Quay hồ sơ Giao A — giao tiếp phần còn lại"]
  Xong(["✅ Đã giao hết công trình của Giao A"])

  Hub --> Bang
  Bang --> Mo
  Mo --> XemCt
  XemCt --> Lap
  Lap -->|Lập / giao tiếp| SoanMoi
  Lap -->|Mở soạn| SoanCu
  SoanMoi --> Valid
  SoanCu --> Valid
  Valid -->|Thiếu| SoanMoi
  Valid -->|Đủ| Save
  Save --> Word
  Word --> Tiep
  Tiep -->|Còn| Quay
  Quay --> XemCt
  Tiep -->|Hết| Xong

  class Hub,Xong userClass
  class Bang,Mo,XemCt,SoanMoi,SoanCu,Save,Quay processClass
  class Valid,Lap,Tiep aiClass
  class Word exportClass
```

## Một quyết định — nhiều công trình

Từ hồ sơ Giao A: **Lập giao** / **Giao tiếp còn lại** → trang soạn liệt kê phụ lục, **tick** công trình chưa giao (đã giao bị khóa/mờ). Lưu / Xuất Word / PDF ký gắn các dự án khớp tên đã tick. Chia nhiều Xí nghiệp: giao một phần → lưu → quay hồ sơ → giao phần còn lại.
## Nội dung màn hình

| Phần | Nội dung |
|------|----------|
| Bảng Giao A | STT · Số Giao A + ngày · Người quét · Số công trình · Đã giao (x/y CT) · Xóa (icon, chỉ Admin/Trưởng phòng); bấm số Giao A để mở theo dõi |
| Xóa hồ sơ Giao A | Chỉ Admin / Trưởng phòng; quét sai → báo Trưởng phòng xóa || Hồ sơ Giao A | Thông tin chung + bảng CT (đã giao mờ) + quyết định đã lập + nút giao |
| Trang soạn | Giấy quyết định; tick CT; Lưu · Word · PDF ký; đóng về hồ sơ Giao A |

## Quy tắc soạn (đã chốt)

| Mục | Quy tắc |
|-----|---------|
| Chỉ dự án đã lưu | Bản quét nháp chưa hiện trên bảng nên không thể giao nhiệm vụ |
| Loại quyết định | Theo phân hệ và cấp điện áp của dự án |
| Chủ đầu tư | Chỉ «Công ty Điện lực [tỉnh]» — cắt phần «để thực hiện…» |
| Địa điểm trống | Suy từ chủ đầu tư / tên dự án khi tải danh mục |
| Số quyết định trống | Xuất Word chèn khoảng trắng để điền tay / Doffice |
| Ngày ban hành trống | Xuất Word: «ngày … tháng … năm …» thành khoảng trắng (không dấu chấm) để Doffice điền |
| Danh xưng Giám đốc XN (Điều 3) | Xí nghiệp DVĐL **Hà Giang** → Bà; các Xí nghiệp khác → Ông |
| Tư vấn thiết kế trung hạ áp | Chi phí bước 1 / GHĐ theo loại hình (XDM·Cải tạo 3,3% · SCMBA·DMS 1,5%); tạm ứng 15%/16% theo địa bàn; số tiền **đồng** |
| Tư vấn thiết kế 110 kV | Không tính chi phí bước 1 / tạm ứng |
| Tư vấn giám sát | Giá trị HĐ = TMĐT × **1%** → hiển thị/xuất **đồng**; không tạm ứng; tiền bằng số/chữ; mẫu `qd-giao-nhiem-vu-tvgs.docx` |
| Thí nghiệm | Tính sau |
| Tên tệp Word | `GNV-[viết tắt XN]-[mã DA]-[yyyyMMdd]-[HHmmss].docx` |
| Xuất PDF | Tạm ẩn nút; giữ logic để bật lại sau |
| Tải PDF đã ký | Nút trên trang soạn — lưu tệp, chuyển «Đã giao», bỏ dấu Dự thảo |
| Xóa dự thảo | Chỉ khi còn Nháp; đã giao thì chỉ Admin được xóa để dọn dữ liệu sai |
| Xóa dự án | Dự án còn quyết định giao Xí nghiệp thì bị chặn xóa — phải xóa dự thảo quyết định trước |
| Một QĐ nhiều công trình | Tick chọn công trình giao lần này; map theo tên đã tick; chặn lập trùng; xóa QĐ gỡ map |

## Phụ lục kỹ thuật

| Mục | Chi tiết |
|-----|----------|
| Hub chọn phân hệ | `page.tsx` · `hub-phan-he-stats.ts` |
| Bảng danh mục | `GiaoADashboard.tsx` — `GET /api/giao-a?phan_he=` |
| Theo dõi Giao A | `GiaoATheoDoiClient.tsx` · `/giao-a/[id]/theo-doi` · `GET .../theo-doi` |
| UI soạn | `SoanQdGiaoXnEditor.tsx` · `return_to` về hồ sơ Giao A |
| Map nhiều DA | `qd-giao-xn-map.ts` · bảng `qd_giao_xn_du_an` · SQL `019` |
| Danh xưng GD XN | `danh-xung-gd-xn.ts` · tag `{danh_xung_gd_xn}` |
| Xóa dự thảo | `DELETE /api/qd-giao-xn/[id]` — chặn khi `trang_thai <> 'nhap'`, ghi nhật ký `GIAO_XN / DELETE` |
| PDF đã ký | `POST/GET /api/qd-giao-xn/[id]/pdf-ky` · SQL `018_qd_giao_xn_pdf_ky.sql` · bucket `qd-giao-xn` |
| Theme phân hệ | `phan-he.ts` · `soan-qd-theme.ts` |
| Mặc định chủ đầu tư / XN | `soan-qd-defaults.ts` |
| Tiền bước 1 / số thành chữ | `tinh-tien-giao-xn.ts` · `so-tien-bang-chu.ts` |
| Word | `fill-qd-giao-xn.ts` · `format-ngay.ts` · `template-path.ts` · mẫu `public/templates/` (gồm `qd-giao-nhiem-vu-tvgs.docx`) |
| PDF Giao A | `GET /api/giao-a/[id]/pdf` |
| SQL | `008` · `009` · `012` · `018` · `019` · `020_loai_hinh_xdm_cai_tao.sql` · `021_loai_hinh_tnhc_tvgs.sql` · `022_xi_nghiep_dien_bien.sql` |
