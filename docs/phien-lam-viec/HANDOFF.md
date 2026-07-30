# HANDOFF — Phiên làm việc (mới nhất ở trên)

> **Máy khác:** `git pull` → đọc block **đầu tiên** dưới đây → tiếp tục chat.  
> **Cuối phiên:** `làm cuối phiên đầy đủ`.

---

## 2026-07-30 — Chuẩn hóa cuối phiên: bump version + bắt buộc workflow/HDSD

**Version:** `0.1.1`

### Đã làm

- Bổ sung bước **(0) bump patch** vào rule «làm cuối phiên đầy đủ» (`npm version patch --no-git-tag-version`).
- Làm rõ «đầy đủ» **bắt buộc** rà/cập nhật `workflows/` + `docs/hdsd/` liên quan phiên; lệnh «cập nhật HANDOFF → commit + push» vẫn nhẹ (không bắt buộc doc).
- **Không đổi workflow/HDSD nghiệp vụ** — phiên này chỉ sửa rule agent.

### File chính

| File | Vai trò |
|------|---------|
| [session-handoff.mdc](d:\AIProject\gnvnpsc\.cursor\rules\session-handoff.mdc) | Quy ước cuối phiên |
| [package.json](d:\AIProject\gnvnpsc\package.json) | Version `0.1.1` |

### Việc tiếp

- [ ] Khi hoàn thiện luồng PDF, đổi `SHOW_EXPORT_PDF` thành `true`.
- [ ] Chạy SQL `010` (và `009` nếu chưa) trên Supabase.
- [ ] Lưu field Word bổ sung vào DB; TN × 1,5% (pha sau).

### Câu mở phiên sau

> Đọc HANDOFF mới nhất (v0.1.1). «làm cuối phiên đầy đủ» đã gồm bump version + workflow/HDSD. Tiếp: PDF / field Word / tiền TN hoặc chạy SQL 010.

---

## 2026-07-30 — Tạm ẩn Xuất PDF · đổi màu trang Thí nghiệm

### Đã làm

- Tạm ẩn nút **Xuất PDF** trên trang soạn; giữ nguyên logic để có thể bật lại sau.
- Cập nhật hướng dẫn tại phần giao nhiệm vụ, chỉ còn **Lưu · Lưu & đóng · Xuất Word**.
- Đổi theme Thí nghiệm từ hồng đào sang **vàng cát trầm**; giảm gradient và bóng đổ, giữ dấu **DỰ THẢO** màu đỏ.

### File chính

| File | Vai trò |
|------|---------|
| [SoanQdGiaoXnEditor.tsx](d:\AIProject\gnvnpsc\src\components\SoanQdGiaoXnEditor.tsx) | Ẩn nút Xuất PDF bằng cờ cấu hình |
| [soan-qd-theme.ts](d:\AIProject\gnvnpsc\src\lib\soan-qd-theme.ts) | Theme TN vàng cát trầm |
| [QdGiaoXnDocBanner.tsx](d:\AIProject\gnvnpsc\src\components\QdGiaoXnDocBanner.tsx) | Banner theo theme mới |
| [workflows/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) | Workflow giao nhiệm vụ |
| [docs/hdsd/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\docs\hdsd\02_giao_nhiem_vu.md) | HDSD trang soạn |

### Việc tiếp

- [ ] Khi hoàn thiện luồng PDF, đổi `SHOW_EXPORT_PDF` thành `true` để hiện lại nút.
- [ ] Chạy SQL `010` (và `009` nếu chưa) trên Supabase.
- [ ] Lưu field Word bổ sung vào DB; TN × 1,5% (pha sau).

### Câu mở phiên sau

> Đọc HANDOFF mới nhất. Kiểm tra trang soạn TN với màu vàng cát trầm và nút PDF đang ẩn. Tiếp: hoàn thiện PDF hoặc field Word / tiền TN.

---

## 2026-07-28 — Giám sát hoạt động · tài khoản · chỉnh bảng UX

### Đã làm

- Giám sát: nhật ký (Admin) + danh sách TK non-admin; SQL `010`; log login/logout/cấp TK.
- UX TK: bỏ cột Đơn vị/Đăng nhập; bỏ ghi chú phụ; sắp mã NV tăng dần; header căn giữa; bỏ footer đếm TK.
- Sidebar avatar → họ tên + menu Tài khoản/Đăng xuất; trang Tài khoản chỉ họ tên + email.
- Bảng danh mục DA / danh sách QĐ giao XN: font đồng bộ; QĐ: STT · Mã · Tên · Loại · Số/ngày · XN · TT.
- Meta web: «Giao nhiệm vụ cho các Xí nghiệp».
- Workflow `03` + HDSD đăng nhập/hệ thống.

### File chính

| File | Vai trò |
|------|---------|
| [010_nhat_ky_hoat_dong.sql](d:\AIProject\gnvnpsc\scripts\sql\010_nhat_ky_hoat_dong.sql) | Bảng nhật ký |
| [activity-log.ts](d:\AIProject\gnvnpsc\src\lib\activity-log.ts) | Logger |
| [GiamSatHeThongClient.tsx](d:\AIProject\gnvnpsc\src\components\GiamSatHeThongClient.tsx) | UI giám sát |
| [SidebarUserFooter.tsx](d:\AIProject\gnvnpsc\src\components\SidebarUserFooter.tsx) | Avatar menu |
| [workflows/03_giam_sat_he_thong.md](d:\AIProject\gnvnpsc\workflows\03_giam_sat_he_thong.md) | Workflow |
| [docs/hdsd/03_dang_nhap_he_thong.md](d:\AIProject\gnvnpsc\docs\hdsd\03_dang_nhap_he_thong.md) | HDSD |

### Việc tiếp

- [ ] Chạy SQL `010` (và `009` nếu chưa) trên Supabase.
- [ ] Lưu field Word bổ sung vào DB; TN × 1,5% (pha sau).

### Câu mở phiên sau

> Đọc HANDOFF mới nhất. Chạy SQL 010 nếu nhật ký trống. F5 Giám sát / Danh sách TK / avatar sidebar. Tiếp: field Word vào DB hoặc tiền TN.

Chi tiết ngày: [2026-07-28-giam-sat-tai-khoan-ux.md](d:\AIProject\gnvnpsc\docs\phien-lam-viec\2026-07-28-giam-sat-tai-khoan-ux.md)

---

## 2026-07-27 — Soạn QĐ form + L1/tạm ứng + PC tỉnh + theme pastel

### Đã làm

- Trang soạn QĐ dạng giấy (banner chung, bố cục Điều 2 hai cột, Năm ĐTXD cạnh Số/Ngày).
- PC tỉnh sạch (chỉ «Công ty Điện lực [tỉnh]»); địa điểm suy từ tên/PC; thẻ TVTK lọc đúng cấp.
- THA: tính L1 3,3% → tạm ứng (đồng + bằng chữ); số QĐ trống = 10 khoảng trắng trên Word.
- Theme pastel: 110 xanh dương · THA xanh ngọc · TN hồng đào.
- Cập nhật workflow / HDSD giao NV; SQL `009_ten_pc_tinh`.

### File chính

| File | Vai trò |
|------|---------|
| [SoanQdGiaoXnEditor.tsx](d:\AIProject\gnvnpsc\src\components\SoanQdGiaoXnEditor.tsx) | Form soạn |
| [soan-qd-theme.ts](d:\AIProject\gnvnpsc\src\lib\soan-qd-theme.ts) | Màu pastel |
| [soan-qd-defaults.ts](d:\AIProject\gnvnpsc\src\lib\soan-qd-defaults.ts) | Căn cứ / PC / XN |
| [tinh-tien-giao-xn.ts](d:\AIProject\gnvnpsc\src\lib\tinh-tien-giao-xn.ts) · [so-tien-bang-chu.ts](d:\AIProject\gnvnpsc\src\lib\so-tien-bang-chu.ts) | L1 + chữ |
| [009_ten_pc_tinh.sql](d:\AIProject\gnvnpsc\scripts\sql\009_ten_pc_tinh.sql) | Cột PC tỉnh |
| [workflows/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) | Workflow |

### Việc tiếp

- [ ] Chạy SQL `009` (và 005–008 nếu môi trường mới) trên Supabase.
- [ ] Lưu field Word bổ sung (tạm ứng…) vào DB.
- [ ] TN × 1,5% (pha sau); PDF chính thức từ Word nếu cần.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất. Chạy SQL 009 nếu chưa. F5 soạn 110 / THA / TN — kiểm tra màu pastel, L1/tạm ứng THA, chủ đầu tư sạch. Tiếp: lưu field Word vào DB hoặc tiền TN.

Chi tiết ngày: [2026-07-27-soan-qd-form-l1-theme.md](d:\AIProject\gnvnpsc\docs\phien-lam-viec\2026-07-27-soan-qd-form-l1-theme.md)

---

## 2026-07-26 — Tag Word + 3 thẻ theo cấp ĐA + trang soạn / xuất file

### Đã làm

- Gán tag **`{ten_bien}`** (chuẩn docxtemplater — một cặp ngoặc) vào 3 mẫu trong `public/templates/`; map tại [docs/templates/TAG_MAP.md](d:\AIProject\gnvnpsc\docs\templates\TAG_MAP.md).
- UI phần II: **3 loại thẻ** (TVTK 110 / TVTK THA / TN hiệu chỉnh); chỉ hiện thẻ TVTK khớp `cap_dien_ap` dự án (đã xác nhận khi nhập Giao A). DB vẫn `loai = tvtk | thi_nghiem`.
- **+ Lập / Mở soạn** → trang riêng `/du-an/[id]/giao-xn/soan` (không form trôi dưới thẻ). Thanh nút: **Lưu** · **Lưu & đóng** · **Xuất Word** · **Xuất PDF**.
- Xuất Word: `docxtemplater` + `pizzip`; API `POST /api/qd-giao-xn/[id]/export/word`; chọn file mẫu theo loại + cấp ĐA.
- Xuất PDF: mở `/soan/in` (bản tóm tắt) → in / Save as PDF trình duyệt.

### File chính

| File | Vai trò |
|------|---------|
| [docs/templates/TAG_MAP.md](d:\AIProject\gnvnpsc\docs\templates\TAG_MAP.md) | Bảng map tag |
| [scripts/tag-word-templates.mjs](d:\AIProject\gnvnpsc\scripts\tag-word-templates.mjs) | Script gắn tag |
| [src/components/GiaoNhiemVuSection.tsx](d:\AIProject\gnvnpsc\src\components\GiaoNhiemVuSection.tsx) | Thẻ theo cấp ĐA → link soạn |
| [src/components/SoanQdGiaoXnEditor.tsx](d:\AIProject\gnvnpsc\src\components\SoanQdGiaoXnEditor.tsx) | Trang soạn + 4 nút |
| [src/lib/word/fill-qd-giao-xn.ts](d:\AIProject\gnvnpsc\src\lib\word\fill-qd-giao-xn.ts) | Điền tag → buffer docx |
| [src/app/api/qd-giao-xn/[id]/export/word/route.ts](d:\AIProject\gnvnpsc\src\app\api\qd-giao-xn\[id]\export\word\route.ts) | API xuất Word |
| [workflows/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) / [docs/hdsd/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\docs\hdsd\02_giao_nhiem_vu.md) | Workflow / HDSD |

### Việc tiếp

- [ ] Cột DB / JSON cho field Word bổ sung (tiền tạm ứng, QĐ thành lập XN, KHV, PC tỉnh…).
- [ ] Bọc dòng phụ lục bằng `{#cong_trinh}` … `{/cong_trinh}` trên mẫu.
- [ ] PDF chính thức từ file Word (nếu nghiệp vụ yêu cầu, không chỉ bản in).
- [ ] Chạy SQL `002` / `003` / `004` nếu chưa; CRUD Xí nghiệp; Auth + storage production.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất. F5 DA có cấp điện áp → Lập → Lưu / Xuất Word kiểm tra tag. Tiếp: lưu field Word vào DB hoặc loop phụ lục.

Chi tiết ngày: [2026-07-26-tag-soan-xuat-word.md](d:\AIProject\gnvnpsc\docs\phien-lam-viec\2026-07-26-tag-soan-xuat-word.md)

---

## 2026-07-25 — Vercel ổn định + mẫu Word vào repo

### Đã làm

- Sửa lỗi deploy: project Vercel cũ 404 (`NOT_FOUND` / `DEPLOYMENT_NOT_FOUND`) sau khi xóa trùng → Import lại repo GitHub, rename project, domain production **`https://gnvnpsc.vercel.app`**.
- Local: `git remote` → `https://github.com/iSurvey86/gnvnpsc.git`, nhánh **`main`** track `origin/main`.
- Cài lại `node_modules` (thiếu `next` binary) → `npm run dev` chạy được.
- Đưa 3 mẫu Word vào [`public/templates/`](d:\AIProject\gnvnpsc\public\templates) — **chưa** gắn xuất file (placeholder dạng `[…]`, form còn thiếu field tiền/KHV/phụ lục).

### File chính

| File | Vai trò |
|------|---------|
| [public/templates/qd-giao-nhiem-vu-tvtk_110.docx](d:\AIProject\gnvnpsc\public\templates\qd-giao-nhiem-vu-tvtk_110.docx) | TVTK + cấp chi phí — 110 kV |
| [public/templates/qd-giao-nhiem-vu-tvtk_tha.docx](d:\AIProject\gnvnpsc\public\templates\qd-giao-nhiem-vu-tvtk_tha.docx) | TVTK + cấp chi phí — trung hạ áp |
| [public/templates/qd-giao-nhiem-vu-tnhc.docx](d:\AIProject\gnvnpsc\public\templates\qd-giao-nhiem-vu-tnhc.docx) | Thí nghiệm hiệu chỉnh |
| [workflows/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) | Workflow — ghi nhận mẫu đã có |
| [docs/hdsd/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\docs\hdsd\02_giao_nhiem_vu.md) | HDSD — trạng thái xuất Word |

### Việc tiếp

- [ ] Chuẩn hóa placeholder Word → tag `{{…}}`; lập map field form / DB / nhập thêm.
- [ ] Thêm lib xuất Word + API + nút Xuất (chọn mẫu theo loại giao + cấp điện áp).
- [ ] Chạy SQL `002` / `003` / `004` trên Supabase nếu chưa.
- [ ] CRUD Xí nghiệp trong Quản lý hệ thống.
- [ ] Auth + storage policies khi đưa production.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất. Mở https://gnvnpsc.vercel.app — F5 danh mục DA. Tiếp: chuẩn hóa 3 mẫu Word rồi gắn xuất file.

Chi tiết ngày: [2026-07-25-vercel-templates.md](d:\AIProject\gnvnpsc\docs\phien-lam-viec\2026-07-25-vercel-templates.md)

---

## 2026-07-23 — UI khuông màu + trang Giao nhiệm vụ (I/II)

### Đã làm

- Trang nhập / Review: khuông màu tách (header slate, upload/QĐ sky, bảng violet, chân amber).
- Trang mở 1 dự án: **I. Thông tin chung** + **II. Phần giao nhiệm vụ** (thẻ TVTK / TN).
- Hướng giao ở cột trái; Giao A số = link sang Review; nội dung dài `justify`.
- Form soạn QĐ nhúng khi bấm **+ Lập**; chọn XN từ danh mục; Word chờ mẫu.
- Tài liệu: `workflows/`, `docs/hdsd/`; commit đầu repo (chưa remote).

### File chính

| File | Vai trò |
|------|---------|
| [src/components/GiaoNhiemVuSection.tsx](d:\AIProject\gnvnpsc\src\components\GiaoNhiemVuSection.tsx) | I + II trang giao NV |
| [src/app/du-an/[id]/giao-xn/page.tsx](d:\AIProject\gnvnpsc\src\app\du-an\[id]\giao-xn\page.tsx) | Route giao NV theo DA |
| [src/app/nhap-du-an/page.tsx](d:\AIProject\gnvnpsc\src\app\nhap-du-an\page.tsx) | Nhập Giao A + khuông màu |
| [workflows/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\workflows\02_giao_nhiem_vu.md) | Workflow giao NV |
| [docs/hdsd/02_giao_nhiem_vu.md](d:\AIProject\gnvnpsc\docs\hdsd\02_giao_nhiem_vu.md) | HDSD giao NV |

### Việc tiếp

- [ ] Chạy SQL còn thiếu trên Supabase: `002` / `003` / `004` (nếu chưa).
- [ ] Thêm **git remote** GitHub + `git push` (Vercel chỉ khi cần deploy).
- [ ] Mẫu Word TVTK / Thí nghiệm → gắn xuất file.
- [ ] CRUD Xí nghiệp trong Quản lý hệ thống.
- [ ] Auth + storage policies khi đưa production.

### Câu mở phiên sau

> Đọc HANDOFF mới nhất. Chạy SQL 002–004 nếu chưa. F5 mở 1 DA — kiểm tra I/II + link Giao A. Tiếp: remote GitHub hoặc mẫu Word.

Chi tiết ngày: [2026-07-23-ui-giao-nhiem-vu.md](d:\AIProject\gnvnpsc\docs\phien-lam-viec\2026-07-23-ui-giao-nhiem-vu.md)

---

## 2026-07-23 — Seed 16 Xí nghiệp + form chỉ chọn danh mục

### Đã làm

- SQL seed 16 XN: [004_seed_xi_nghiep.sql](d:\AIProject\gnvnpsc\scripts\sql\004_seed_xi_nghiep.sql) (upsert theo `ma`).
- Form soạn QĐ giao XN: **chỉ chọn từ danh mục** (bỏ nhập tay XN mới).
- Gợi ý loại giao từ `huong_giao` trên dự án.

### Việc tiếp

- [ ] Chạy SQL `004_seed_xi_nghiep.sql` (+ `003` nếu chưa) trên Supabase.
- [ ] CRUD Xí nghiệp trong Quản lý hệ thống (sau).

### Câu mở phiên sau

> Chạy SQL 004. F5 form Soạn QĐ — dropdown đủ 16 XN.

---

## 2026-07-23 — Ghi chú hướng giao (TVTK/TN) + bỏ Năm header

### Đã làm

- Bỏ cột Gói CV trên Review; cột **Ghi chú** = 3 checkbox (chọn 1): TVTK / TN / TVTK & TN → `huong_giao`.
- Bỏ ô **Năm (Mã DA)** trên header (năm vẫn lấy ngầm từ QĐ khi sinh mã).
- SQL: [003_huong_giao.sql](d:\AIProject\gnvnpsc\scripts\sql\003_huong_giao.sql).

### Việc tiếp

- [ ] Chạy SQL `003_huong_giao.sql` trên Supabase.
- [ ] Logic tiếp theo dựa trên `huong_giao` (soạn QĐ XN…).

### Câu mở phiên sau

> Chạy SQL 003. F5 Review — tick TVTK/TN. Tiếp: gắn hướng giao vào form QĐ XN.

---

### Đã làm

- Branding: `gnvnpsc` / `GIAO NHIỆM VỤ PCM` (header) · footer `HỆ THỐNG` + `Giao nhiệm vụ PCM`.
- Sidebar ghim/bỏ ghim (localStorage).
- Menu **Quản lý hệ thống** → `/he-thong`.
- Lọc + cột **Cấp điện áp** (110 kV / Trung hạ áp); SQL [002_cap_dien_ap.sql](d:\AIProject\gnvnpsc\scripts\sql\002_cap_dien_ap.sql).

### Việc tiếp

- [ ] Chạy SQL `002_cap_dien_ap.sql` trên Supabase (nếu DB đã tạo từ 001 cũ).
- [ ] Thử upload PDF Giao A.
- [ ] Mẫu Word + list Xí nghiệp.

### Câu mở phiên sau

> Đọc HANDOFF. Chạy SQL 002 nếu chưa. F5 xem sidebar pin + lọc cấp ĐA.

---

## 2026-07-23 — Palette teal/mint/rose (tách ksnpsc)

### Đã làm

- Đổi dải màu gnvnpsc: **teal · mint · rose** (không còn navy/amber/cream của ksnpsc).
- Sidebar mint, bảng teal-700, filter teal + rose, CTA teal, badge cyan/rose/violet.

### Câu mở phiên sau

> F5 `/` xem palette mới. Tiếp: thử upload Giao A hoặc mẫu Word.

---

### Đã làm

- Sidebar pastel cream + trang chủ **QUẢN LÝ DỰ ÁN** (KPI / filter xanh-amber / bảng navy).
- CTA **Nhập Dự án (Giao A)** → `/nhap-du-an` (nằm trong luồng danh mục, không menu riêng).
- `/giao-a` → redirect `/nhap-du-an`; `/du-an` → `/`.
- Review `/giao-a/[id]` + soạn QĐ / list QĐ giao XN đồng bộ tông pastel.

### Việc tiếp

- [ ] Thử upload PDF Giao A thật.
- [ ] Mẫu Word + danh sách Xí nghiệp.
- [ ] git remote + commit/push (khi user yêu cầu).

### Câu mở phiên sau

> Đọc HANDOFF UI pastel. F5 `/` — Nhập Giao A từ CTA xanh lá trong Quản lý dự án.

---

## 2026-07-23 — Phase 1 UI (upload → ScanAI → QĐ giao XN)

**Máy / ngữ cảnh:** Supabase đã có URL + SQL + bucket `qd-giao-a` / `qd-giao-xn`; `.env.local` đã điền.

### Đã làm

- Làm sạch `.env.example` (secret chỉ trong `.env.local`).
- API: `POST /api/giao-a/ingest`, CRUD nhẹ `du-an` / `qd-giao-xn` / `xi-nghiep`.
- UI: `/giao-a`, `/giao-a/[id]` review, `/du-an`, `/du-an/[id]/giao-xn`, `/qd-giao-xn`.
- Chưa xuất Word (chưa có mẫu).

### File chính

| File | Vai trò |
|------|---------|
| [src/app/api/giao-a/ingest/route.ts](d:\AIProject\gnvnpsc\src\app\api\giao-a\ingest\route.ts) | Upload + ScanAI + lưu DB |
| [src/app/giao-a/page.tsx](d:\AIProject\gnvnpsc\src\app\giao-a\page.tsx) | Upload Giao A |
| [src/components/ReviewGiaoAClient.tsx](d:\AIProject\gnvnpsc\src\components\ReviewGiaoAClient.tsx) | Review danh mục DA |
| [src/components/SoanQdGiaoXnForm.tsx](d:\AIProject\gnvnpsc\src\components\SoanQdGiaoXnForm.tsx) | Form QĐ giao XN |

### Việc tiếp

- [ ] Thử upload PDF Giao A thật (cần `GEMINI_API_KEY` trong `.env.local`).
- [ ] Bổ sung mẫu Word TVTK / Thí nghiệm + danh sách Xí nghiệp chuẩn.
- [ ] Storage policies (hiện Public, 0 policy) + Auth khi cần.
- [ ] `git remote` + commit/push (khi user yêu cầu).

### Câu mở phiên sau

> Đọc HANDOFF Phase 1 UI. Thử upload Giao A hoặc bổ sung mẫu Word / list Xí nghiệp.

---

## 2026-07-23 — Phase 0 scaffold + schema Phase 1

**Máy / ngữ cảnh:** gnvnpsc — Giao nhiệm vụ PCM (TVTK + Thí nghiệm).

### Đã chốt

- Identity rule + Supabase từ đầu + **pair ScanAI** (không nhập tay-first).
- Mẫu Word / list Xí nghiệp: **chưa có** — chờ user bổ sung.

### Đã làm

- Rule [gnvnpsc-project.mdc](d:\AIProject\gnvnpsc\.cursor\rules\gnvnpsc-project.mdc).
- Next.js 16 (App Router, TS, Tailwind, `src/`) tại root; `git init` (chưa remote).
- Packages: `@supabase/supabase-js`, `@supabase/ssr`, `@google/genai`.
- SQL + doc schema Phase 1; stub `POST /api/scan-pdf` + `parseGiaoAPdf`.
- `.env.example`, README.

### File chính

| File | Vai trò |
|------|---------|
| [scripts/sql/001_phase1_schema.sql](d:\AIProject\gnvnpsc\scripts\sql\001_phase1_schema.sql) | Schema Phase 1 |
| [docs/schema-phase1.md](d:\AIProject\gnvnpsc\docs\schema-phase1.md) | Mô tả schema + ScanAI |
| [src/app/api/scan-pdf/route.ts](d:\AIProject\gnvnpsc\src\app\api\scan-pdf\route.ts) | API ScanAI stub |
| [src/lib/scan-ai/parse-giao-a.ts](d:\AIProject\gnvnpsc\src\lib\scan-ai\parse-giao-a.ts) | Gemini Flash-Lite parse PDF |

### Việc tiếp

- [x] Tạo project Supabase + chạy SQL + điền `.env.local`.
- [ ] `git remote` + commit/push (khi user yêu cầu).
- [ ] Bổ sung mẫu Word TVTK / Thí nghiệm + danh sách Xí nghiệp.
- [x] Phase 1 UI: upload Giao A → review DA → form QĐ giao XN.

### Câu mở phiên sau

> Đọc HANDOFF 2026-07-23 Phase 0. Tiếp: Supabase project + env, hoặc UI upload Giao A / chờ mẫu Word.

---

## 2026-07-23 — Khởi tạo repo gnvnpsc

**Máy / ngữ cảnh:** App giao nhiệm vụ Phòng chuyên môn (TVTK + Thí nghiệm).

### Đã chốt / đã làm

- Tạo folder `D:\AIProject\gnvnpsc`.
- Copy rules Cursor + Mẫu tư vấn từ ksnpsc (không copy code KS).

### Việc tiếp

- [x] `create-next-app` / scaffold (+ git init; remote còn thiếu).
- [x] Chốt schema Phase 1 (SQL + doc; pair ScanAI).
- [ ] Chuẩn bị mẫu Word QĐ TVTK / Thí nghiệm + danh sách Xí nghiệp.

### Câu mở phiên sau

> Đọc HANDOFF khởi tạo. Tiếp scaffold Next.js + schema Phase 1.
