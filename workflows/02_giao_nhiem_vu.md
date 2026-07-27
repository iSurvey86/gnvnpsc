# Workflow — Giao nhiệm vụ theo dự án

> **Màn hình:** Giao nhiệm vụ (mở từ 1 dòng dự án)  
> **Route:** `/du-an/[id]/giao-xn`

## Luồng nghiệp vụ

```mermaid
flowchart TD
  classDef userClass fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#000
  classDef processClass fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#000
  classDef aiClass fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#000
  classDef dbClass fill:#E8F5E9,stroke:#388E3C,stroke-width:2px,color:#000
  classDef exportClass fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#000

  Open(["👤 Mở một dự án từ danh mục"])
  Info["I. Xem thông tin chung"]
  LinkA["Bấm số Giao A — mở file PDF"]
  Sec2["II. Hiện thẻ theo cấp điện áp và hướng giao"]
  Cap{"Đã có cấp điện áp?"}
  NoCap["Cảnh báo — chưa hiện thẻ TVTK"]
  PickCard["Thẻ TVTK 110 hoặc THA + thẻ Thí nghiệm"]
  Allow{"Thuộc hướng giao của dự án?"}
  Block["Thẻ khóa — không thuộc hướng"]
  Lap["Bấm Lập — mở trang soạn QĐ"]
  Form["Trang soạn dạng giấy QĐ"]
  MacDinh["Tự điền căn cứ · PC tỉnh · Xí nghiệp · ngày"]
  Tien{"Loại trung hạ áp?"}
  L1["Tính chi phí L1 và tạm ứng"]
  Valid{"Đủ đơn vị nhận?"}
  Save["Lưu hoặc Lưu và đóng"]
  Pick["Chọn mẫu Word theo loại và cấp"]
  Word["Xuất Word — số QĐ trống thành khoảng trắng"]
  Pdf["Xuất PDF — bản in trình duyệt"]
  End(["Quay lại thẻ giao nhiệm vụ"])

  Open --> Info
  Info --> LinkA
  Info --> Sec2 --> Cap
  Cap -->|Chưa| NoCap
  Cap -->|Có| PickCard --> Allow
  Allow -->|Không| Block
  Allow -->|Có| Lap --> Form --> MacDinh --> Tien
  Tien -->|Có| L1 --> Valid
  Tien -->|Không| Valid
  Valid -->|Thiếu| Form
  Valid -->|Đủ| Save --> End
  Form -.-> Pick --> Word
  Form -.-> Pdf

  class Open,Info,LinkA,Sec2,PickCard,Lap,Form,MacDinh userClass
  class Cap,Allow,Valid,Tien,Pick processClass
  class L1 aiClass
  class Save,End dbClass
  class Block,Word,Pdf,NoCap exportClass
```

## Nội dung màn hình

| Phần | Nội dung |
|------|----------|
| I. Thông tin chung | Mã/tên DA, địa điểm, cấp ĐA, hướng giao; Giao A (PDF); quy mô |
| II. Giao nhiệm vụ | Thẻ TVTK theo cấp · Thẻ TN — bấm Lập mở trang soạn |
| Trang soạn | Giấy QĐ pastel theo loại (110 / THA / TN); Lưu · Word · PDF |

## Quy tắc soạn (đã chốt)

| Mục | Quy tắc |
|-----|---------|
| Thẻ TVTK | Chỉ hiện đúng cấp dự án (110 ẩn THA và ngược lại) |
| Chủ đầu tư | Chỉ «Công ty Điện lực [tỉnh]» — cắt phần «để thực hiện…» |
| Địa điểm trống | Suy từ PC tỉnh / tên dự án khi tải danh mục |
| Số QĐ trống | Xuất Word chèn 10 khoảng trắng |
| TVTK THA — L1 | L1 = TMĐT × 3,3% (triệu); tạm ứng = L1 đổi sang đồng + bằng chữ |
| TVTK 110 | Không tính L1 / tạm ứng |
| Màu trang soạn | 110 xanh dương · THA xanh ngọc · TN hồng đào pastel |

## Phụ lục kỹ thuật

| Mục | Chi tiết |
|-----|----------|
| UI thẻ | `GiaoNhiemVuSection.tsx` |
| UI soạn | `SoanQdGiaoXnEditor.tsx` · banner `QdGiaoXnDocBanner.tsx` |
| Theme | `soan-qd-theme.ts` |
| Mặc định PC/XN | `soan-qd-defaults.ts` |
| Tiền L1 / chữ | `tinh-tien-giao-xn.ts` · `so-tien-bang-chu.ts` |
| Word | `fill-qd-giao-xn.ts` · 3 mẫu `public/templates/` |
| PDF Giao A | `GET /api/giao-a/[id]/pdf` |
| SQL | `008_phu_luc_giao_a.sql` · `009_ten_pc_tinh.sql` |
