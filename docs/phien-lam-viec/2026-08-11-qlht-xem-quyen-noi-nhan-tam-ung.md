# 2026-08-11 — QLHT phân quyền/xem quyền, Nơi nhận, danh xưng TQ, tạm ứng 10%

**Version:** `0.1.8`

### Đã chốt / đã làm

- **Danh sách tài khoản:** ẩn Admin; panel slide **Phân quyền** (dropdown TP / PP / NV + tổ).
- **Xem với quyền (Admin):** sidebar persona Test_TP / PP / NV — cả 3 tổ, thao tác thật; banner teal thoát chế độ.
- **XN:** ẩn Điện Biên / Lạng Sơn (SQL `023`); seed `004`/`022` đồng bộ.
- **Word Nơi nhận:** THA/TVGS theo `{ten_xi_nghiep}` (XN giao); **Chủ đầu tư** giữ PC tỉnh dự án.
- **Danh xưng Điều 3:** **Tuyên Quang** = Bà (mọi mẫu gồm TNHC); tag `{danh_xung_gd_xn}`.
- **Tạm ứng lần 1 (TVTK THA):** **10%** × GHĐ, làm tròn hàng triệu (bỏ 15%/16% địa bàn).

### File chính

| File | Vai trò |
|------|---------|
| [NhanSuAdminClient.tsx](d:\AIProject\gnvnpsc\src\components\NhanSuAdminClient.tsx) · [chuc-danh.ts](d:\AIProject\gnvnpsc\src\lib\chuc-danh.ts) | Phân quyền slide |
| [view-as.ts](d:\AIProject\gnvnpsc\src\lib\view-as.ts) · [ViewAsSidebarMenu](d:\AIProject\gnvnpsc\src\components\ViewAsSidebarMenu.tsx) · [session.ts](d:\AIProject\gnvnpsc\src\lib\session.ts) | Xem với quyền |
| [023_an_xn_sap_nhap.sql](d:\AIProject\gnvnpsc\scripts\sql\023_an_xn_sap_nhap.sql) · mẫu Word | XN + Nơi nhận |
| [danh-xung-gd-xn.ts](d:\AIProject\gnvnpsc\src\lib\danh-xung-gd-xn.ts) | Ông/Bà TQ |
| [tinh-tien-giao-xn.ts](d:\AIProject\gnvnpsc\src\lib\tinh-tien-giao-xn.ts) | Tạm ứng 10% |
| [HDSD 02/03](d:\AIProject\gnvnpsc\docs\hdsd) · [workflow 02/03](d:\AIProject\gnvnpsc\workflows) | Tài liệu |

### Việc tiếp

- [ ] Chạy SQL `023` (ẩn XN sáp nhập) + `020`/`021` nếu chưa trên Supabase.
- [ ] Xuất Word thử: TQ → Bà; Nơi nhận = XN giao khác tỉnh; tạm ứng 10% làm tròn triệu.
- [ ] TNHC: chốt công thức tiền khi có nghiệp vụ.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất (v0.1.8). QLHT: phân quyền slide + Xem với quyền; Nơi nhận theo XN giao; TQ = Bà; tạm ứng L1 = 10% GHĐ. Tiếp: chạy SQL 023 nếu thiếu hoặc kiểm tra xuất Word.
