# 2026-07-28 — Giám sát / tài khoản + chỉnh bảng UX

## Đã chốt / đã làm

- **Giám sát hoạt động:** nhật ký (Admin) + danh sách tài khoản non-admin; SQL `010`; log login/logout/cấp TK.
- **UX tài khoản:** bỏ cột Đơn vị / Đăng nhập; bỏ ghi chú phụ đề & footer đếm TK; sắp mã NV tăng dần; tiêu đề cột căn giữa.
- **Sidebar:** gom footer vào avatar; hiện họ tên; menu Tài khoản / Đăng xuất.
- **Trang Tài khoản:** họ tên + email; bỏ User ID và ghi chú cấp TK mới.
- **Bảng dự án / QĐ giao XN:** đồng bộ font; tách cột Mã / Tên DA + STT trên danh sách QĐ.
- Meta web: «Giao nhiệm vụ cho các Xí nghiệp».

## File chính

| File | Vai trò |
|------|---------|
| `scripts/sql/010_nhat_ky_hoat_dong.sql` | Bảng nhật ký |
| `src/lib/activity-log.ts` | Ghi log |
| `src/components/GiamSatHeThongClient.tsx` | UI giám sát |
| `src/components/SidebarUserFooter.tsx` | Avatar menu |
| `src/app/he-thong/giam-sat/` · `tai-khoan/` | Trang |
| `workflows/03_giam_sat_he_thong.md` | Workflow |
| `docs/hdsd/03_dang_nhap_he_thong.md` | HDSD |

## Việc tiếp

- [ ] Chạy SQL `010` (và `009` nếu chưa) trên Supabase.
- [ ] Lưu field Word bổ sung vào DB; TN × 1,5% (pha sau).
