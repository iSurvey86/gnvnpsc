# 2026-08-04 — TVGS tiền/GHĐ đồng, loại hình, mẫu Word, tên tệp xuất

**Version:** `0.1.5`

## Đã chốt / đã làm

- **Loại hình THA:** bỏ CQT; thêm **XDM** · **Cải tạo** (3,3%) + SCMBA/DMS (1,5%). SQL `020`.
- **TNHC / TVGS:** loại hình chỉ **TNHC** / **TVGS** theo phân hệ (mặc định Review). SQL `021`.
- **TVGS tiền:** GHĐ = **1% × TMĐT**; **không tạm ứng**; có **Tiền bằng số / bằng chữ**.
- **Hiển thị GHĐ:** số **đồng** (vd `180.930.000`) trên UI + Word — khớp tiêu đề mẫu «(đồng)».
- **Mẫu Word TVGS:** `qd-giao-nhiem-vu-tvgs.docx`; theme soạn **cyan**; routing buộc `loai=tvgs` theo phân hệ.
- **Tên tệp xuất:** `GNV-[viết tắt XN]-[mã DA]-[yyyyMMdd]-[HHmmss].docx` (giờ VN; `DVDL-SL` → `XNDVSL`).
- **XN Điện Biên** seed (`022` / cập nhật `004`).
- Bảng Quản lý dự án: bỏ cột Loại hình DA + Giao Xí nghiệp; bộ lọc gọn.
- Review: không chọn Xí nghiệp khi quét; Hide Admin nhật ký; thanh tiến trình quét sky→cyan.

## File chính

| File | Vai trò |
|------|---------|
| `scripts/sql/020_loai_hinh_xdm_cai_tao.sql` | CQT → null; check XDM/Cải tạo… |
| `scripts/sql/021_loai_hinh_tnhc_tvgs.sql` | Thêm tnhc/tvgs + backfill |
| `scripts/sql/022_xi_nghiep_dien_bien.sql` | Seed XN Điện Biên |
| `src/lib/tinh-tien-giao-xn.ts` | TVGS 1%; GHĐ/tạm ứng format đồng |
| `src/components/SoanQdGiaoXnEditor.tsx` | UI TVGS, bảng không tạm ứng |
| `src/lib/soan-qd-theme.ts` | Tone `cyan` TVGS |
| `src/lib/word/template-path.ts` | Trỏ `qd-giao-nhiem-vu-tvgs.docx` |
| `public/templates/qd-giao-nhiem-vu-tvgs.docx` | Mẫu Word |
| `src/app/api/qd-giao-xn/[id]/export/word/route.ts` | Tên tệp GNV-… |
| `workflows/02_giao_nhiem_vu.md` · `docs/hdsd/02_giao_nhiem_vu.md` · `docs/templates/TAG_MAP.md` | Tài liệu |

## Việc tiếp

- [ ] Chạy SQL `020` + `021` + `022` (và `018`/`019` nếu chưa) trên Supabase.
- [ ] TNHC: chốt công thức tiền + gắn tag mẫu Word khi có nghiệp vụ.
- [ ] Khi hoàn thiện luồng PDF in, đổi `SHOW_EXPORT_PDF` thành `true`.

## Câu mở phiên sau

> Đọc HANDOFF mới nhất (v0.1.5). TVGS: GHĐ 1% không tạm ứng, số đồng, mẫu `qd-giao-nhiem-vu-tvgs.docx`, tên tệp GNV-…. Chạy SQL 020–022 nếu thiếu. Tiếp: tiền TNHC hoặc kiểm tra xuất Word TVGS trên dữ liệu thật.
