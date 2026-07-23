# Workflow — Nhập dự án từ Giao A

> **Màn hình:** Nhập thông tin dự án mới · Review sau ScanAI  
> **Route:** `/nhap-du-an`, `/giao-a/[id]`

## Luồng nghiệp vụ

```mermaid
flowchart TD
  classDef userClass fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#000
  classDef processClass fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#000
  classDef aiClass fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,color:#000
  classDef dbClass fill:#E8F5E9,stroke:#388E3C,stroke-width:2px,color:#000
  classDef exportClass fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px,color:#000

  Start(["👤 Mở Quản lý dự án"])
  Cta["Bấm Nhập dự án Giao A"]
  Pick["Chọn tệp PDF Quyết định Giao A"]
  Scan{"Đã chọn PDF?"}
  Quet["Bấm Quét dữ liệu"]
  Ai["ScanAI nhận dạng danh mục dự án"]
  Fail{"Quét thành công?"}
  Err["Hiện lỗi — chọn lại hoặc thử lại"]
  Review["Màn Review — chỉnh bảng dự án"]
  Huong["Tick hướng giao TVTK / TN / cả hai"]
  Save["Lưu tất cả vào CSDL"]
  Done(["Về Quản lý dự án hoặc mở giao nhiệm vụ"])

  Start --> Cta --> Pick --> Scan
  Scan -->|Chưa| Pick
  Scan -->|Có| Quet --> Ai --> Fail
  Fail -->|Lỗi| Err --> Pick
  Fail -->|OK| Review --> Huong --> Save --> Done

  class Start,Cta,Pick,Quet,Review,Huong userClass
  class Scan,Fail processClass
  class Ai aiClass
  class Save,Done dbClass
  class Err exportClass
```

## Ghi chú

- Bảng trống sẵn trên màn nhập; sau quét chuyển sang Review để sửa.
- Mã dự án sinh theo quy ước tỉnh–năm–cấp–viết tắt (hiện dưới tên DA).
- Cột Ghi chú trên Review = hướng giao (chọn một).

## Phụ lục kỹ thuật

| Mục | Chi tiết |
|-----|----------|
| Upload + ingest | `POST /api/giao-a/ingest` |
| Review UI | `ReviewGiaoAClient.tsx` |
| Model ScanAI | Gemini Flash-Lite |
| SQL liên quan | `001` schema · `002` cấp ĐA · `003` hướng giao |
