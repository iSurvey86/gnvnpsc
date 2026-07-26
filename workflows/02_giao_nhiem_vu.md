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
  LinkA["Bấm số Giao A — mở Review"]
  Sec2["II. Hiện thẻ theo cấp điện áp và hướng giao"]
  Cap{"Đã có cấp điện áp?"}
  NoCap["Cảnh báo — chưa hiện thẻ TVTK"]
  PickCard["Thẻ TVTK 110 hoặc THA + thẻ Thí nghiệm hiệu chỉnh"]
  Allow{"Thuộc hướng giao của dự án?"}
  Block["Thẻ khóa — không thuộc hướng"]
  Lap["Bấm Lập — mở trang soạn QĐ"]
  Form["Trang soạn: đơn vị · thời hạn · phạm vi"]
  Valid{"Đủ đơn vị nhận?"}
  Save["Lưu hoặc Lưu và đóng"]
  Pick["Chọn mẫu Word theo loại và cấp điện áp"]
  Word["Xuất Word từ template"]
  Pdf["Xuất PDF — bản in trình duyệt"]
  End(["Quay lại thẻ giao nhiệm vụ"])

  Open --> Info
  Info --> LinkA
  Info --> Sec2 --> Cap
  Cap -->|Chưa| NoCap
  Cap -->|Có| PickCard --> Allow
  Allow -->|Không| Block
  Allow -->|Có| Lap --> Form --> Valid
  Valid -->|Thiếu| Form
  Valid -->|Đủ| Save --> End
  Form -.-> Pick --> Word
  Form -.-> Pdf

  class Open,Info,LinkA,Sec2,PickCard,Lap,Form userClass
  class Cap,Allow,Valid,Pick processClass
  class Save,End dbClass
  class Block,Word,Pdf,NoCap exportClass
```

## Nội dung màn hình

| Phần | Nội dung |
|------|----------|
| I. Thông tin chung | Mã/tên DA, địa điểm, cấp ĐA, hướng giao; Giao A + trích yếu; quy mô |
| II. Giao nhiệm vụ | Thẻ TVTK theo cấp · Thẻ TN — bấm Lập mở trang soạn |
| Trang soạn | Lưu · Lưu & đóng · Xuất Word · Xuất PDF |

## Phụ lục kỹ thuật

| Mục | Chi tiết |
|-----|----------|
| UI thẻ | `GiaoNhiemVuSection.tsx` |
| UI soạn | `SoanQdGiaoXnEditor.tsx` · route `/du-an/[id]/giao-xn/soan` |
| Lọc thẻ | TVTK theo `du_an.cap_dien_ap`; DB `loai` vẫn `tvtk` \| `thi_nghiem` |
| API | `POST/PATCH /api/qd-giao-xn` · `POST .../export/word` |
| Word | `docxtemplater` + 3 mẫu `public/templates/` |
| PDF | trang in `/soan/in` (Save as PDF trình duyệt) |
