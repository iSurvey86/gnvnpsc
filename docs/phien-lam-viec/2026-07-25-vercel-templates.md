# 2026-07-25 — Vercel ổn định + mẫu Word vào repo

## Đã chốt / đã làm

- Xóa project Vercel trùng / hỏng (`*-1s2o`, `DEPLOYMENT_NOT_FOUND`) → Import lại từ GitHub → rename + domain **`gnvnpsc.vercel.app`**.
- Local: gắn `origin` → [iSurvey86/gnvnpsc](https://github.com/iSurvey86/gnvnpsc), nhánh **`main`** track `origin/main`.
- Cài lại `node_modules` (thiếu binary Next) → `npm run dev` OK.
- Sao chép 3 mẫu Word vào `public/templates/` (chưa gắn nút xuất).

## File chính

| File | Vai trò |
|------|---------|
| `public/templates/qd-giao-nhiem-vu-tvtk_110.docx` | Mẫu QĐ TVTK + cấp CP — 110 kV |
| `public/templates/qd-giao-nhiem-vu-tvtk_tha.docx` | Mẫu QĐ TVTK + cấp CP — trung hạ áp |
| `public/templates/qd-giao-nhiem-vu-tnhc.docx` | Mẫu QĐ Thí nghiệm hiệu chỉnh |

## Việc tiếp

- [ ] Chuẩn hóa placeholder Word → tag máy đọc (`{{…}}`); map field form/DB.
- [ ] Lib xuất Word + API + nút Xuất (chọn mẫu theo `loai` + `cap_dien_ap`).
- [ ] SQL 002–004 trên Supabase nếu chưa.
- [ ] CRUD Xí nghiệp; Auth + storage policies production.

## Câu mở phiên sau

> Đọc HANDOFF mới nhất. Production: https://gnvnpsc.vercel.app. Tiếp: chuẩn hóa tag 3 mẫu Word rồi gắn xuất file.
