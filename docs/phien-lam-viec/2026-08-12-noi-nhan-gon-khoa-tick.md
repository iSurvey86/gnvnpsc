# 2026-08-12 — Nơi nhận gọn, khóa tick đã giao, ScanAI `\*)`

**Version:** `0.1.10`

### Đã chốt / đã làm

- **Mẫu Word Nơi nhận** (4 loại): gọn *Như Điều 3 · Ban Giám đốc · Lưu VT, KD* — không lặp tên XN. XN nhận vẫn ở thân QĐ / Điều 3.
- **Khóa tick CT đã giao:** đã có sẵn — CT đã **Lưu** QĐ cùng loại bị mờ/khóa. Ảnh «vẫn tick được» khớp khi đợt 1 chưa Lưu, hoặc mở lại cùng dự thảo, hoặc lệch tên CT ↔ DA.
- **`*\)` trên quy mô:** ScanAI khi quét Giao A (không phải xuất Word). User sửa tay trên Review; chưa làm sạch tự động lúc scan.
- Không commit bản Word local làm mất `{danh_xung_gd_xn}` (Tuyên Quang = Bà).

### File chính

| File | Vai trò |
|------|---------|
| [public/templates/*.docx](d:\AIProject\gnvnpsc\public\templates) | Nơi nhận gọn |
| [SoanQdGiaoXnEditor.tsx](d:\AIProject\gnvnpsc\src\components\SoanQdGiaoXnEditor.tsx) · [qd-giao-xn-map.ts](d:\AIProject\gnvnpsc\src\lib\qd-giao-xn-map.ts) | Khóa tick (không đổi code) |
| [HDSD 02](d:\AIProject\gnvnpsc\docs\hdsd\02_giao_nhiem_vu.md) · [workflow 02](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) · [TAG_MAP](d:\AIProject\gnvnpsc\docs\templates\TAG_MAP.md) | Tài liệu |

### Việc tiếp

- [ ] Chạy SQL `023` nếu chưa trên Supabase.
- [ ] Nếu đợt 2 vẫn tick được CT đã Lưu: đối chiếu tên phụ lục với tên DA.
- [ ] (Tùy chọn) Làm sạch `\*)` → `*)` ngay sau scan.
- [ ] TNHC: chốt công thức tiền khi có nghiệp vụ.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất (v0.1.10). Nơi nhận Word đã gọn; khóa tick CT đã Lưu vẫn đúng thiết kế. Tiếp: SQL 023 / lệch tên CT khi khóa không chạy / làm sạch ScanAI `\*)`.
