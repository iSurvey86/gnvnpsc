# 2026-07-23 — UI khuông màu + trang Giao nhiệm vụ (I/II)

## Đã làm

- Trang nhập / Review: khuông màu tách (header slate, upload/QĐ sky, bảng violet, chân amber).
- Trang mở 1 dự án: **I. Thông tin chung** + **II. Phần giao nhiệm vụ** (thẻ TVTK / TN).
- Hướng giao ở cột trái; Giao A số = link sang Review; nội dung dài `justify`.
- Form soạn QĐ nhúng khi bấm **+ Lập**; chọn XN từ danh mục; Word chờ mẫu.
- Tài liệu: `workflows/`, `docs/hdsd/`; commit đầu repo (chưa remote).

## File chính

| File | Vai trò |
|------|---------|
| [src/components/GiaoNhiemVuSection.tsx](d:\AIProject\gnvnpsc\src\components\GiaoNhiemVuSection.tsx) | I + II trang giao NV |
| [src/app/du-an/[id]/giao-xn/page.tsx](d:\AIProject\gnvnpsc\src\app\du-an\[id]\giao-xn\page.tsx) | Route giao NV theo DA |
| [src/app/nhap-du-an/page.tsx](d:\AIProject\gnvnpsc\src\app\nhap-du-an\page.tsx) | Nhập Giao A + khuông màu |
| [workflows/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) | Workflow giao NV |
| [docs/hdsd/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\docs\hdsd\02_giao_nhiem_vu.md) | HDSD giao NV |

## Việc tiếp

- [ ] Chạy SQL còn thiếu trên Supabase: `002` / `003` / `004` (nếu chưa).
- [ ] Thêm **git remote** GitHub + `git push` (Vercel chỉ khi cần deploy).
- [ ] Mẫu Word TVTK / Thí nghiệm → gắn xuất file.
- [ ] CRUD Xí nghiệp trong Quản lý hệ thống.
- [ ] Auth + storage policies khi đưa production.

## Câu mở phiên sau

> Đọc HANDOFF mới nhất. Chạy SQL 002–004 nếu chưa. F5 mở 1 DA — kiểm tra I/II + link Giao A. Tiếp: remote GitHub hoặc mẫu Word.
