# 2026-07-27 — Soạn QĐ (form + L1 + PC tỉnh + theme pastel)

## Đã chốt / đã làm

- Form soạn QĐ dạng giấy: banner dùng chung, layout Điều 2 (Chủ đầu tư | Xí nghiệp), Năm ĐTXD cùng hàng Số/Ngày.
- Chủ đầu tư chỉ «Công ty Điện lực [tỉnh]»; cắt phần sau «để…».
- Địa điểm trống: suy từ PC tỉnh / tên DA; backfill khi GET danh mục.
- Thẻ giao NV: ẩn TVTK không khớp cấp (110 ẩn THA và ngược lại).
- TVTK THA: L1 = TMĐT × 3,3%; tạm ứng = L1 (đồng) + bằng chữ tự điền.
- Số QĐ trống → xuất Word 10 khoảng trắng.
- Theme pastel theo loại: 110 xanh dương · THA xanh ngọc · TN hồng đào (không xám, không màu chói).
- Font Be Vietnam Pro; Giao A trên bảng → PDF API; cột Loại hình tư vấn trên dashboard.
- SQL `009_ten_pc_tinh.sql` (user chạy trên Supabase nếu chưa).

## File chính

| File | Vai trò |
|------|---------|
| `src/components/SoanQdGiaoXnEditor.tsx` | Trang soạn |
| `src/components/QdGiaoXnDocBanner.tsx` | Banner QĐ |
| `src/lib/soan-qd-theme.ts` | Palette pastel |
| `src/lib/soan-qd-defaults.ts` | Căn cứ / PC tỉnh / XN |
| `src/lib/tinh-tien-giao-xn.ts` | L1 |
| `src/lib/so-tien-bang-chu.ts` | Đọc số tiền |
| `scripts/sql/009_ten_pc_tinh.sql` | Cột ten_pc_tinh |
| `workflows/02_giao_nhiem_vu.md` / `docs/hdsd/02_giao_nhiem_vu.md` | Workflow / HDSD |

## Việc tiếp

- [ ] Chạy SQL `009` (và 005–008 nếu môi trường mới) trên Supabase.
- [ ] Lưu field Word bổ sung (tạm ứng…) vào DB.
- [ ] TN × 1,5% (pha sau).
- [ ] PDF chính thức từ Word (nếu cần).
