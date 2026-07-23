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
  Sec2["II. Chọn thẻ loại giao"]
  Allow{"Thuộc hướng giao của dự án?"}
  Block["Thẻ khóa — không thuộc hướng"]
  Lap["Bấm Lập trên thẻ TVTK hoặc TN"]
  Form["Điền đơn vị · thời hạn · phạm vi · căn cứ"]
  Valid{"Đủ đơn vị nhận?"}
  Save["Lưu dự thảo QĐ giao Xí nghiệp"]
  Word["Xuất Word — chờ mẫu template"]
  End(["Thẻ cập nhật trạng thái dự thảo"])

  Open --> Info
  Info --> LinkA
  Info --> Sec2 --> Allow
  Allow -->|Không| Block
  Allow -->|Có| Lap --> Form --> Valid
  Valid -->|Thiếu| Form
  Valid -->|Đủ| Save --> End
  Save -.-> Word

  class Open,Info,LinkA,Sec2,Lap,Form userClass
  class Allow,Valid processClass
  class Save,End dbClass
  class Block,Word exportClass
```

## Nội dung màn hình

| Phần | Nội dung |
|------|----------|
| I. Thông tin chung | Mã/tên DA, địa điểm, cấp ĐA, hướng giao; Giao A + trích yếu; quy mô |
| II. Giao nhiệm vụ | Thẻ TVTK (xanh) · Thẻ Thí nghiệm (tím); hiện đơn vị / thời hạn nếu đã lập |

## Phụ lục kỹ thuật

| Mục | Chi tiết |
|-----|----------|
| UI | `GiaoNhiemVuSection.tsx` + `SoanQdGiaoXnForm.tsx` |
| API lưu | `POST /api/qd-giao-xn` |
| Danh mục XN | bảng Xí nghiệp · seed `004_seed_xi_nghiep.sql` |
| Word | chưa gắn — chờ mẫu TVTK / TN |
