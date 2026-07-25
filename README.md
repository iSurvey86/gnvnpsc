# gnvnpsc — Giao nhiệm vụ Phòng chuyên môn

App nội bộ: nhận **Quyết định Giao A** (PDF) → ScanAI → danh mục dự án → soạn **QĐ trình GĐ giao Xí nghiệp** (Tư vấn thiết kế / Thí nghiệm).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Supabase (Auth / DB / Storage)
- Gemini Flash-Lite (`@google/genai`) — route `POST /api/scan-pdf`

## Chạy local

```bash
cp .env.example .env.local
# điền NEXT_PUBLIC_SUPABASE_* , SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Schema Phase 1

- Doc: [docs/schema-phase1.md](docs/schema-phase1.md)
- SQL: [scripts/sql/001_phase1_schema.sql](scripts/sql/001_phase1_schema.sql) — chạy trên Supabase SQL Editor

## Deploy

- Production: [https://gnvnpsc.vercel.app](https://gnvnpsc.vercel.app)
- Repo: [iSurvey86/gnvnpsc](https://github.com/iSurvey86/gnvnpsc)

## Việc còn thiếu (nghiệp vụ)

- Xuất Word từ mẫu (`public/templates/` — TVTK 110 / TVTK THA / TN hiệu chỉnh; chưa gắn nút)
- Auth + storage policies production

## Tài liệu

- Handoff: [docs/phien-lam-viec/HANDOFF.md](docs/phien-lam-viec/HANDOFF.md)
- Workflow: [workflows/](workflows/)
- HDSD: [docs/hdsd/](docs/hdsd/)
- Schema: [docs/schema-phase1.md](docs/schema-phase1.md)
- SQL: [scripts/sql/](scripts/sql/) (`001`…`004`)
