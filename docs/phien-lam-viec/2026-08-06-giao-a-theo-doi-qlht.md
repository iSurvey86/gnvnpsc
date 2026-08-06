# 2026-08-06 — Danh sách theo Giao A, theo dõi, quyền QLHT & HDSD

**Version:** `0.1.6`

### Đã chốt / đã làm

- **Bảng phân hệ theo Giao A** (không còn một dòng = một CT): STT · Giao A · Người quét · Số công trình · Đã giao (`x/y CT`) · Xóa (icon, **chỉ Admin/Trưởng phòng**).
- **Lọc** Năm / Người quét; bấm số Giao A → trang theo dõi.
- **Trang theo dõi Giao A:** tiêu đề phân hệ trong mục I (IN HOA, căn giữa); cam nhạt quay danh sách; Số CT + Đã giao; Người quét; giao NV từng phần / còn lại.
- **Soạn QĐ:** giữ `return_to` về hồ sơ Giao A.
- **QLHT:** User chỉ xem **Danh sách tài khoản** + **Danh sách Xí nghiệp** (không nhật ký; không cột Thao tác / Thêm mới). Admin đủ 3 mục.
- **Sidebar:** mục **Hướng dẫn sử dụng** (`/huong-dan`) luôn dưới cùng; ghi chú hub: *Danh mục giao A → Giao nhiệm vụ (…)*.

### File chính

| File | Vai trò |
|------|---------|
| [GiaoADashboard.tsx](d:\AIProject\gnvnpsc\src\components\GiaoADashboard.tsx) · [giao-a-theo-doi.ts](d:\AIProject\gnvnpsc\src\lib\giao-a-theo-doi.ts) | Danh sách Giao A |
| [GiaoATheoDoiClient.tsx](d:\AIProject\gnvnpsc\src\components\GiaoATheoDoiClient.tsx) · [theo-doi/](d:\AIProject\gnvnpsc\src\app\giao-a\[id]\theo-doi) | Hồ sơ theo dõi |
| [api/giao-a](d:\AIProject\gnvnpsc\src\app\api\giao-a\route.ts) · [DELETE quyền](d:\AIProject\gnvnpsc\src\app\api\giao-a\[id]\route.ts) | List + xóa Admin/TP |
| [HeThongShell.tsx](d:\AIProject\gnvnpsc\src\components\HeThongShell.tsx) · [AppLayout.tsx](d:\AIProject\gnvnpsc\src\components\AppLayout.tsx) | QLHT + HDSD menu |
| [huong-dan/](d:\AIProject\gnvnpsc\src\app\huong-dan) | Trang HDSD user |
| [HDSD 01/02/03](d:\AIProject\gnvnpsc\docs\hdsd) · [workflow 02](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) | Tài liệu |

### Việc tiếp

- [ ] Chạy SQL `020` + `021` + `022` (và `018`/`019` nếu chưa) trên Supabase.
- [ ] Kiểm tra trên dữ liệu thật: giao từng phần CT theo Giao A · xóa Giao A (Admin/TP).
- [ ] TNHC: chốt công thức tiền + gắn tag mẫu Word khi có nghiệp vụ.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất (v0.1.6). Phân hệ theo Giao A + theo dõi/giao NV từng phần; xóa Giao A chỉ Admin/TP; QLHT user chỉ xem TK/XN; có /huong-dan. Tiếp: SQL 020–022 nếu thiếu hoặc tiền TNHC.
