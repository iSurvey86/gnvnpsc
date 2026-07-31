# 2026-07-31 — Map nhiều DA vào một QĐ, PDF ký, tiền tạm ứng, nhật ký Giao XN

**Version:** `0.1.3`

## Đã chốt / đã làm

- **Một QĐ phủ nhiều công trình (phương án A):** lưu quan hệ `qd_giao_xn_du_an`; đồng bộ khi Lưu / Xuất Word / Tải PDF ký theo tên công trình còn lại trên bảng soạn (cùng Giao A + cùng phân hệ). Dashboard hiện «Đã có trong QĐ»; mở soạn đúng QĐ chủ; API chặn lập trùng (409).
- **PDF quyết định đã ký** (SQL 018): upload → Đã giao; xem từ danh mục / màn giao NV.
- **Công thức tiền TVTK trung hạ áp:** GHĐ CQT 3,3% · SCMBA/DMS 1,5% × TMĐT; tạm ứng 15%/16% theo cùng/khác tỉnh.
- **Nhật ký:** CREATE / UPDATE / EXPORT cho QĐ giao XN (trước chỉ DELETE + PDF ký).
- Chỉnh UI soạn (fieldset Điều 2, đóng về home phân hệ, cột TMĐT, v.v.).

## SQL cần chạy (Supabase)

1. `scripts/sql/018_qd_giao_xn_pdf_ky.sql` + bucket `qd-giao-xn` (nếu chưa).
2. `scripts/sql/019_qd_giao_xn_du_an.sql` (bắt buộc cho map).

## File chính

- `src/lib/qd-giao-xn-map.ts`
- `src/app/api/qd-giao-xn/**`
- `src/components/DuAnDashboard.tsx`, `SoanQdGiaoXnEditor.tsx`, `GiaoNhiemVuSection.tsx`
- `workflows/02_giao_nhiem_vu.md`, `docs/hdsd/02_giao_nhiem_vu.md`, `workflows/03_giam_sat_he_thong.md`

## Việc tiếp

- Chạy SQL 018+019; Lưu lại QĐ cũ để backfill map.
- Mẫu Word TN/TVGS; kiểm tra quét 708 nếu cần.
