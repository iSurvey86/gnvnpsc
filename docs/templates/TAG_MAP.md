# Map tag mẫu Word QĐ giao Xí nghiệp

> Nguồn mẫu: [`public/templates/`](d:\AIProject\gnvnpsc\public\templates)  
> Script gắn tag: [`scripts/tag-word-templates.mjs`](d:\AIProject\gnvnpsc\scripts\tag-word-templates.mjs)  
> Sửa phụ lục 110: [`scripts/fix-tvtk-110-phu-luc.mjs`](d:\AIProject\gnvnpsc\scripts\fix-tvtk-110-phu-luc.mjs)  
> Sửa phụ lục THA + TN: [`scripts/fix-phu-luc-tha-tnhc.mjs`](d:\AIProject\gnvnpsc\scripts\fix-phu-luc-tha-tnhc.mjs)  
> **Delimiter:** `{` … `}` — chuẩn mặc định [docxtemplater](https://docxtemplater.com/docs/tag-types/) (không dùng `{{ }}`)

## Chọn file mẫu

| Điều kiện | File |
|-----------|------|
| `loai = tvtk` và `cap_dien_ap = 110kv` | `qd-giao-nhiem-vu-tvtk_110.docx` |
| `loai = tvtk` và `cap_dien_ap = trung_ha_ap` | `qd-giao-nhiem-vu-tvtk_tha.docx` |
| `loai = thi_nghiem` | `qd-giao-nhiem-vu-tnhc.docx` |
| `loai = tvgs` | `qd-giao-nhiem-vu-tvgs.docx` |

## Tag dùng chung (header + căn cứ + điều)

| Tag | Ý nghĩa | Nguồn dự kiến |
|-----|---------|---------------|
| `{so_qd}` | Số QĐ dự thảo (trước `/QĐ-NPSC`) | `qd_giao_xn.so_qd_du_thao` |
| `{ngay_ban_hanh_chu}` | Dòng ngày văn bản | từ `ngay_du_thao` |
| `{ten_xi_nghiep}` | Tên Xí nghiệp nhận (thân QĐ + **Nơi nhận**) | `xi_nghiep.ten` đã chọn khi giao |
| `{danh_xung_gd_xn}` | Ông / Bà trước «Giám đốc» (Điều 3) | `danhXungGiamDocXn` — **Tuyên Quang** (và Hà Giang cũ) = Bà; còn lại = Ông |
| `{ten_pc_tinh}` | Công ty Điện lực / PC tỉnh (**Chủ đầu tư** — theo dự án/Giao A) | form / địa điểm |
| `{ten_tinh}` | Tên tỉnh (khi mẫu còn dùng) | form / địa điểm |
| `{ten_du_an}` | Tên dự án (Điều 1) — mẫu 110 | `du_an.ten_du_an` |
| `{nam_ke_hoach}` | Năm ĐTXD / kế hoạch | form / ngày QĐ Giao A |
| `{so_qd_thanh_lap_xn}` / `{ngay_qd_thanh_lap_xn}` | QĐ thành lập XN | form |
| `{so_qd_tam_giao_khv}` / `{ngay_qd_tam_giao_khv}` | QĐ tạm giao KHV | form / Giao A |

## Phụ lục — loop chung (3 mẫu)

Nguồn: `qd_giao_a.phu_luc` (ScanAI khi ingest). SQL: [`008_phu_luc_giao_a.sql`](d:\AIProject\gnvnpsc\scripts\sql\008_phu_luc_giao_a.sql).

Trên mẫu: `{#cong_trinh}` … `{/cong_trinh}`.

| Tag | Ý nghĩa | 110 | THA | TN |
|-----|---------|:---:|:---:|:--:|
| `{stt}` | Số thứ tự | ✓ | ✓ | ✓ |
| `{ct_ten}` | Tên công trình / danh mục | ✓ | ✓ | ✓ |
| `{ct_quy_mo}` | Quy mô (nhiều dòng) | ✓ | ✓ | ✓ |
| `{ct_tmdt}` | TMĐT dòng | ✓ | ✓ | ✓ |
| `{ct_tien_do}` | Tiến độ / thời gian HT | ✓ | ✓ | ✓ |

### Chỉ THA

| Tag | Ý nghĩa |
|-----|---------|
| `{ct_danh_dau_tvtk}` | Đánh dấu cột gói TVTK (vd `X`) |
| `{ct_danh_dau_tvgs}` | Đánh dấu cột gói TVGS |
| `{ct_gia_tri_hd}` | Giá trị HĐ tạm tính — **đồng** (TMĐT × tỷ lệ × 1.000.000) |
| `{ct_chi_phi_l1}` | Cấp chi phí / tạm ứng lần 01 — **đồng** (= **10%** × GHĐ, làm tròn hàng triệu — TVTK THA) |
| `{ct_gia_tri_tam_ung}` | Cùng số với `{ct_chi_phi_l1}` (alias) |
| `{tong_gia_tri_hd}` | Tổng giá trị HĐ — **đồng** |
| `{tong_chi_phi_l1}` | Tổng tạm ứng lần 01 — **đồng** |
| `{tong_gia_tri_tam_ung}` | Cùng số với `{tong_chi_phi_l1}` (alias) |
| `{ten_goi_thau}` | Tên gói thầu (thân QĐ) |
| `{so_tien_tam_ung}` / `{so_tien_tam_ung_chu}` | Tạm ứng tổng (thân QĐ) |

**Quy tắc tính:**

| Loại | Giá trị HĐ | Tạm ứng lần 1 |
|------|------------|---------------|
| TVTK 110kV | Không tính | — |
| TVTK trung hạ áp | XDM/Cải tạo 3,3% · SCMBA/DMS 1,5% × TMĐT | **10%** × GHĐ, làm tròn hàng triệu (lần 2 sau ký HĐ) |
| TVGS (mọi cấp) | **1%** × TMĐT → điền **đồng** (`{ct_gia_tri_hd}` / `{tong_gia_tri_hd}`) | **Không** |
| TNHC | Tính sau | Tính sau |

Code: [`src/lib/tinh-tien-giao-xn.ts`](d:\AIProject\gnvnpsc\src\lib\tinh-tien-giao-xn.ts) · điền Word: [`fill-qd-giao-xn.ts`](d:\AIProject\gnvnpsc\src\lib\word\fill-qd-giao-xn.ts).

### Chỉ Thí nghiệm (TNHC)

| Tag | Ý nghĩa |
|-----|---------|
| `{ct_khv}` | Giá trị KHV dòng |
| `{ct_tdtm}` | TDTM dòng |
| `{ct_khcb}` | KHCB dòng |
| `{tong_tmdt}` / `{tong_khv}` / `{tong_tdtm}` / `{tong_khcb}` | Hàng tổng |
| `{so_luong_cong_trinh}` | Số CT (Điều 1) — auto từ `cong_trinh.length` nếu trống |
| `{ghi_chu_bo_sung}` / `{ghi_chu_bo_sung_dieu1}` | Cụm “bổ sung” |

### Tổng dùng chung

| Tag | Nguồn |
|-----|--------|
| `{tong_tmdt}` | `phu_luc.tong_tmdt` |

## Việc tiếp

1. Form / DB lưu field Word bổ sung (tiền tạm ứng, QĐ thành lập XN…).
2. PDF chính thức từ Word (nếu cần).
3. UI Review Giao A: xem / sửa `phu_luc` trước khi xuất.
4. Thí nghiệm: công thức ×1,5% (khi chốt).
