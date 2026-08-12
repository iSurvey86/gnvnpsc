# 2026-08-12 (b) — Đếm CT phụ lục + khóa tick giao phần còn lại

**Version:** `0.1.11`

### Đã chốt / đã làm

- **Đếm x/y CT:** mẫu số = dòng phụ lục Giao A; tử số = CT đã tick khi Lưu (`cong_trinh_chon`); dự thảo cũ → fallback «có dự thảo = đã giao».
- **SQL `024`:** cột `qd_giao_xn.cong_trinh_chon` (jsonb).
- **Giao tiếp còn lại** (`moi=1`): soạn mới — CT đã giao **bỏ tick + khóa**; **Mở soạn** mới tick CT của dự thảo đó.
- **Xuất Word:** chỉ sau khi đã Lưu (nút tắt nếu chưa có dự thảo).
- Nút **Quay lại** (trang trước) trên soạn; **Đóng** về hồ sơ Giao A.

### File chính

| File | Vai trò |
|------|---------|
| [024_qd_giao_xn_cong_trinh_chon.sql](d:\AIProject\gnvnpsc\scripts\sql\024_qd_giao_xn_cong_trinh_chon.sql) | Cột lưu CT đã tick |
| [giao-a-ct-stats.ts](d:\AIProject\gnvnpsc\src\lib\giao-a-ct-stats.ts) | Đếm / gán CT phụ lục |
| [giao-a/route.ts](d:\AIProject\gnvnpsc\src\app\api\giao-a\route.ts) · [theo-doi](d:\AIProject\gnvnpsc\src\app\api\giao-a\[id]\theo-doi\route.ts) | List + theo dõi |
| [SoanQdGiaoXnEditor.tsx](d:\AIProject\gnvnpsc\src\components\SoanQdGiaoXnEditor.tsx) · [GiaoATheoDoiClient.tsx](d:\AIProject\gnvnpsc\src\components\GiaoATheoDoiClient.tsx) | UI soạn / theo dõi |
| [qd-giao-xn-map.ts](d:\AIProject\gnvnpsc\src\lib\qd-giao-xn-map.ts) | Khóa tick + fallback |
| [HDSD 01/02](d:\AIProject\gnvnpsc\docs\hdsd) · [workflow 02](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) | Tài liệu |

### Việc tiếp

- [ ] Chạy SQL `024` (+ `023` nếu chưa) trên Supabase.
- [ ] Thử Giao A 1 DA / nhiều CT: giao tiếp còn lại → khóa đúng; Mở soạn → tick đúng.
- [ ] (Tùy chọn) Làm sạch ScanAI `\*)` trên quy mô.
- [ ] TNHC: chốt công thức tiền khi có nghiệp vụ.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất (v0.1.11). Đếm CT theo phụ lục; Giao tiếp còn lại vs Mở soạn đã tách; Xuất Word sau Lưu. Tiếp: SQL 024 nếu thiếu / kiểm tra giao tách CT / TNHC.
