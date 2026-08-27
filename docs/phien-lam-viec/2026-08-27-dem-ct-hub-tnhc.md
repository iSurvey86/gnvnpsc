## 2026-08-27 — Đếm CT thống nhất, hub, TNHC số lượng, Hide Admin

**Version:** `0.1.12`

### Đã chốt / đã làm

- **Đếm x/y CT (list + theo dõi):** bỏ fallback «mỗi DA có QĐ = 1 CT đã giao»; thống nhất `ganCtKeysChoQdXn` — tick `cong_trinh_chon` hoặc tối đa 1 CT/QĐ khi dự thảo cũ.
- **Hub chọn phân hệ:** đếm **CT phụ lục** đã/chưa giao (khớp list Giao A), không đếm số bản ghi DA có link QĐ.
- **TNHC:** «Số lượng công trình» **tự đếm** theo tick mục 3 (chỉ đọc).
- **Nhật ký:** checkbox **Hide Admin** mặc định **bật** khi mở trang giám sát.
- **Rà 3 phân hệ:** TVTK/TVGS sẵn UAT; TNHC thiếu **công thức tiền** (chờ PCM chốt nghiệp vụ — xem TAG_MAP).

### File chính

| File | Vai trò |
|------|---------|
| [giao-a-ct-stats.ts](d:\AIProject\gnvnpsc\src\lib\giao-a-ct-stats.ts) | Bỏ fallback đếm theo DA |
| [giao-a/route.ts](d:\AIProject\gnvnpsc\src\app\api\giao-a\route.ts) · [theo-doi/route.ts](d:\AIProject\gnvnpsc\src\app\api\giao-a\[id]\theo-doi\route.ts) | List + theo dõi |
| [hub-phan-he-stats.ts](d:\AIProject\gnvnpsc\src\lib\hub-phan-he-stats.ts) | Hub đã/chưa giao theo CT |
| [SoanQdGiaoXnEditor.tsx](d:\AIProject\gnvnpsc\src\components\SoanQdGiaoXnEditor.tsx) | TNHC số lượng CT |
| [GiamSatHeThongClient.tsx](d:\AIProject\gnvnpsc\src\components\GiamSatHeThongClient.tsx) | Hide Admin mặc định |
| [workflow 02/03](d:\AIProject\gnvnpsc\workflows) · [HDSD 02/03](d:\AIProject\gnvnpsc\docs\hdsd) | Tài liệu |

### Git

- `6cea58e` — đếm CT, TNHC số lượng, Hide Admin
- `57e8d72` — hub đếm CT

### Việc tiếp

- [ ] Chạy SQL `024` (+ `023` nếu chưa) trên Supabase.
- [ ] UAT giao tách CT + hub/list/theo dõi khớp số.
- [ ] TNHC: PCM chốt công thức tiền (TAG_MAP) → code `shouldTinhTienGiao` + UI + Word.
- [ ] (Tùy chọn) Làm sạch ScanAI `\*)` trên quy mô.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất (v0.1.12). Đếm CT thống nhất list/theo dõi/hub; TNHC số lượng tự đếm; Hide Admin mặc định. Tiếp: SQL 024 / UAT / chốt tiền TNHC với PCM.
