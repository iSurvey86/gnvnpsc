# 2026-08-07 — Word tạm ứng L1, form soạn gọn, Sửa Giao A

**Version:** `0.1.7`

### Đã chốt / đã làm

- **Word phụ lục THA:** `{ct_chi_phi_l1}` / `{tong_chi_phi_l1}` = **tạm ứng** 15%/16% × GHĐ (không còn copy giá trị HĐ).
- **Form soạn QĐ:** bỏ khối **Phạm vi / nội dung giao**; không đổ quy mô 1 CT vào `{pham_vi}`.
- **Banner tiêu đề soạn:** bỏ «Công ty…» / «Quyết định»; dòng «Về việc giao nhiệm vụ… cho» in hoa, đậm, «cho» không xuống dòng một mình.
- **Danh sách Giao A:** icon **Sửa** (mọi user có quyền ghi PH → Review bổ sung cấp điện áp / loại hình…); **Xóa** vẫn Admin/Trưởng phòng.

### File chính

| File | Vai trò |
|------|---------|
| [tinh-tien-giao-xn.ts](d:\AIProject\gnvnpsc\src\lib\tinh-tien-giao-xn.ts) · [fill-qd-giao-xn.ts](d:\AIProject\gnvnpsc\src\lib\word\fill-qd-giao-xn.ts) · [TAG_MAP](d:\AIProject\gnvnpsc\docs\templates\TAG_MAP.md) | Tạm ứng L1 Word |
| [SoanQdGiaoXnEditor.tsx](d:\AIProject\gnvnpsc\src\components\SoanQdGiaoXnEditor.tsx) · [QdGiaoXnDocBanner.tsx](d:\AIProject\gnvnpsc\src\components\QdGiaoXnDocBanner.tsx) | Form soạn + banner |
| [GiaoADashboard.tsx](d:\AIProject\gnvnpsc\src\components\GiaoADashboard.tsx) · [giao-a/[id]/page.tsx](d:\AIProject\gnvnpsc\src\app\giao-a\[id]\page.tsx) | Sửa Giao A |
| [HDSD 01/02](d:\AIProject\gnvnpsc\docs\hdsd) · [workflow 02](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) | Tài liệu |

### Việc tiếp

- [ ] Chạy SQL `020` + `021` + `022` (và `018`/`019` nếu chưa) trên Supabase.
- [ ] Kiểm tra xuất Word THA: cột cấp chi phí lần 01 = tạm ứng (không bằng GHĐ).
- [ ] TNHC: chốt công thức tiền + gắn tag mẫu Word khi có nghiệp vụ.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất (v0.1.7). Word tạm ứng L1 đã khớp UI; soạn bỏ phạm vi; Sửa Giao A trên danh sách để bổ sung cấp điện áp. Tiếp: SQL 020–022 nếu thiếu hoặc tiền TNHC.
