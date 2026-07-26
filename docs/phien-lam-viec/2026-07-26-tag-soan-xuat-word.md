# 2026-07-26 — Tag Word + 3 thẻ theo cấp ĐA + trang soạn / xuất file

## Đã chốt / đã làm

- Gán tag `{…}` (delimiter docxtemplater mặc định, không `{{ }}`) vào 3 mẫu Word.
- UI 3 loại thẻ; chỉ hiện TVTK khớp `cap_dien_ap` của dự án (cách A).
- **+ Lập** mở trang soạn riêng: Lưu · Lưu & đóng · Xuất Word · Xuất PDF.
- Xuất Word: `docxtemplater` + chọn mẫu theo `loai` + cấp điện áp.
- PDF: bản in tóm tắt trình duyệt (Save as PDF); văn bản đủ vẫn lấy Word.

## File chính

| File | Vai trò |
|------|---------|
| `docs/templates/TAG_MAP.md` | Map tag mẫu |
| `scripts/tag-word-templates.mjs` | Script gắn tag |
| `src/components/SoanQdGiaoXnEditor.tsx` | Trang soạn QĐ |
| `src/lib/word/*` | Fill + chọn template |
| `src/app/api/qd-giao-xn/[id]/export/word` | API xuất Word |

## Việc tiếp

- [ ] Lưu field Word bổ sung vào DB (tiền, KHV, PC tỉnh…).
- [ ] Loop phụ lục `{#cong_trinh}` trên mẫu.
- [ ] PDF chính thức từ Word (nếu cần, không chỉ bản in).
- [ ] SQL 002–004 / CRUD XN / Auth production.

## Câu mở phiên sau

> Đọc HANDOFF. F5 mở DA có cấp ĐA → Lập → Lưu / Xuất Word. Tiếp: cột DB cho field Word hoặc loop phụ lục.
