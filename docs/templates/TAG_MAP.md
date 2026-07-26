# Map tag mẫu Word QĐ giao Xí nghiệp

> Nguồn mẫu: [`public/templates/`](d:\AIProject\gnvnpsc\public\templates)  
> Script gắn tag: [`scripts/tag-word-templates.mjs`](d:\AIProject\gnvnpsc\scripts\tag-word-templates.mjs)  
> **Delimiter:** `{` … `}` — chuẩn mặc định [docxtemplater](https://docxtemplater.com/docs/tag-types/) (không dùng `{{ }}`)

## Chọn file mẫu

| Điều kiện | File |
|-----------|------|
| `loai = tvtk` và `cap_dien_ap = 110kv` | `qd-giao-nhiem-vu-tvtk_110.docx` |
| `loai = tvtk` và `cap_dien_ap = trung_ha_ap` | `qd-giao-nhiem-vu-tvtk_tha.docx` |
| `loai = thi_nghiem` | `qd-giao-nhiem-vu-tnhc.docx` |

## Tag dùng chung (header + căn cứ + điều)

| Tag | Ý nghĩa | Nguồn dự kiến |
|-----|---------|---------------|
| `{so_qd}` | Số QĐ dự thảo (trước `/QĐ-NPSC`) | `qd_giao_xn.so_qd_du_thao` |
| `{ngay_ban_hanh_chu}` | Dòng ngày văn bản (vd: `ngày 26 tháng 7 năm 2026`) | từ `ngay_du_thao` |
| `{ten_xi_nghiep}` | Tên Xí nghiệp nhận | `xi_nghiep.ten` |
| `{ten_pc_tinh}` | Công ty Điện lực / PC tỉnh | form bổ sung / suy từ địa điểm |
| `{ten_tinh}` | Tên tỉnh (nơi nhận) | form / địa điểm |
| `{nam_ke_hoach}` | Năm ĐTXD / kế hoạch | form (vd 2027) |
| `{so_qd_thanh_lap_xn}` | Số QĐ thành lập XN | danh mục XN bổ sung / form |
| `{ngay_qd_thanh_lap_xn}` | Ngày QĐ thành lập XN | danh mục XN / form |
| `{so_qd_tam_giao_khv}` | Số QĐ tạm giao KHV / duyệt DM | form / căn cứ Giao A |
| `{ngay_qd_tam_giao_khv}` | Ngày QĐ tạm giao KHV | form |

## Chỉ mẫu TVTK (110 + THA)

| Tag | Ý nghĩa |
|-----|---------|
| `{ten_goi_thau}` | Khảo sát, TVTK / Tư vấn giám sát |
| `{so_tien_tam_ung}` | Tạm ứng lần 1 — bằng số |
| `{so_tien_tam_ung_chu}` | Tạm ứng lần 1 — bằng chữ |
| `{tong_tmdt}` | Tổng TMĐT phụ lục |

### Dòng công trình mẫu (phụ lục — sẽ loop sau)

| Tag | Ý nghĩa |
|-----|---------|
| `{ct_khu_vuc}` | Khu vực / huyện |
| `{ct_quy_mo_dz_trung}` | Quy mô ĐZ trung thế |
| `{ct_quy_mo_tba}` | Quy mô TBA |
| `{ct_quy_mo_dz_ha}` | Quy mô ĐZ hạ thế |
| `{ct_tmdt}` | TMĐT công trình |
| `{ct_tien_do}` | Tiến độ HT / đóng điện |

### Thêm ở mẫu THA

| Tag | Ý nghĩa |
|-----|---------|
| `{tong_gia_tri_hd}` | Tổng giá trị HĐ phụ lục |
| `{tong_chi_phi_l1}` | Tổng chi phí lần 1 |
| `{ct_danh_dau_goi}` | Đánh dấu cột TVTK/TVGS (vd `X`) |
| `{ct_gia_tri_hd}` | Giá trị HĐ dòng CT |
| `{ct_chi_phi_l1}` | Chi phí L1 dòng CT |

## Chỉ mẫu Thí nghiệm (TNHC)

| Tag | Ý nghĩa |
|-----|---------|
| `{so_luong_cong_trinh}` | Số lượng công trình |
| `{ghi_chu_bo_sung}` | Chữ “bổ sung” (hoặc để trống) |
| `{ghi_chu_bo_sung_dieu1}` | Cụm Điều 1 (vd `hoặc ĐTXD bổ sung năm …`) |
| `{tong_tmdt}` | Tổng TMĐT |
| `{tong_khv}` | Tổng cột KHV |
| `{tong_tdtm}` | Tổng TDTM |
| `{tong_khcb}` | Tổng KHCB |

## Việc tiếp (xuất Word)

1. Bổ sung field form / DB cho các tag chưa có trong `qd_giao_xn` (tiền, KHV, PC tỉnh…).
2. Bọc dòng phụ lục bằng `{#cong_trinh}` … `{/cong_trinh}` (docxtemplater).
3. API xuất: chọn file theo bảng trên → điền tag → tải `.docx`.
