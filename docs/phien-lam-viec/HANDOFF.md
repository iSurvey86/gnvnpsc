# HANDOFF — Phiên làm việc (mới nhất ở trên)

> **Máy khác:** `git pull` → đọc block **đầu tiên** dưới đây → tiếp tục chat.  
> **Cuối phiên:** `làm cuối phiên đầy đủ`.

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
