## 2026-09-25 — Xuất sơ đồ Mermaid (`export:diagrams`)

**Version:** `0.1.13`

### Đã chốt / đã làm

- Thêm `npm run export:diagrams` — quét khối Mermaid trong `workflows/*.md` → PNG `workflows/diagrams/`.
- DevDependency `@mermaid-js/mermaid-cli`; script [`export-diagrams.mjs`](d:\AIProject\gnvnpsc\scripts\export-diagrams.mjs).
- Đã xuất 4 sơ đồ: `00`–`03`. Code đã push trước đó (`fc96c23`).
- **Không đổi HDSD user** (lệnh dành cho agent/dev; không đổi UX nghiệp vụ).

### File chính

| File | Vai trò |
|------|---------|
| [scripts/export-diagrams.mjs](d:\AIProject\gnvnpsc\scripts\export-diagrams.mjs) | Xuất Mermaid → PNG |
| [package.json](d:\AIProject\gnvnpsc\package.json) | Script `export:diagrams` |
| [workflows/diagrams/](d:\AIProject\gnvnpsc\workflows\diagrams) | PNG + README |
| [workflows/00_tong_quan_toan_du_an.md](d:\AIProject\gnvnpsc\workflows\00_tong_quan_toan_du_an.md) | Ghi chú xuất PNG |

### Việc tiếp

- [ ] SQL `024` (+ `023` nếu chưa) trên Supabase.
- [ ] UAT hub + list + theo dõi cùng một Giao A.
- [ ] TNHC: PCM chốt công thức tiền → implement.
- [ ] (Tùy chọn) ScanAI `\*)` trên quy mô.

### Câu mở phiên sau

> Đọc HANDOFF v0.1.13. Có `npm run export:diagrams` cho workflow Mermaid. Tiếp: SQL 024 / UAT / tiền TNHC.
