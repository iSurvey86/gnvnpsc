# Schema Phase 1 — gnvnpsc

> Nguồn SQL: [001_phase1_schema.sql](d:\AIProject\gnvnpsc\scripts\sql\001_phase1_schema.sql)

## Luồng dữ liệu

QĐ Giao A (PDF) → ScanAI → `qd_giao_a` + `du_an` → soạn `qd_giao_xn` (TVTK | Thí nghiệm) → xuất Word.

## Bảng

| Bảng | Mục đích |
|------|----------|
| `xi_nghiep` | Danh mục Xí nghiệp (chưa có list — seed sau) |
| `qd_giao_a` | Hồ sơ PDF Giao A + trạng thái/kết quả scan |
| `du_an` | Danh mục dự án (từ scan, cho sửa tay) |
| `qd_giao_xn` | Dự thảo QĐ giao XN (`tvtk` / `thi_nghiem`) |

## ScanAI (pair từ Phase 1)

- Model: `gemini-3.5-flash-lite`
- Route stub: `POST /api/scan-pdf`
- Output JSON kỳ vọng (chỉnh khi có mẫu PDF thật):
  - `so_qd`, `ngay_qd`, `trich_yeu`
  - `du_an[]`: `ma_du_an`, `ten_du_an`, `dia_diem`, `quy_mo`, `goi_cong_viec`

## Mẫu Word (đã có file — chưa gắn xuất)

| File | Khi dùng |
|------|----------|
| `public/templates/qd-giao-nhiem-vu-tvtk_110.docx` | TVTK · 110 kV |
| `public/templates/qd-giao-nhiem-vu-tvtk_tha.docx` | TVTK · trung hạ áp |
| `public/templates/qd-giao-nhiem-vu-tnhc.docx` | Thí nghiệm hiệu chỉnh |

## Chưa có (cần bổ sung)

- [ ] Chuẩn hóa placeholder + API/nút xuất Word
- [ ] Auth + storage policies production
