import { GoogleGenAI } from "@google/genai";
import { cleanTenPcTinh, extractTenPcTinh, resolveDiaDiem } from "@/lib/soan-qd-defaults";
import type { PhuLucCongTrinh, PhuLucGiaoA } from "@/lib/types";
import type { GiaoAScanResult } from "./types";

const MODEL = "gemini-3.5-flash-lite";

/**
 * Parse PDF QĐ Giao A → JSON danh mục dự án + phụ lục công trình (nếu có).
 * Cần GEMINI_API_KEY.
 */
export async function parseGiaoAPdf(pdfBytes: Buffer): Promise<GiaoAScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64 = pdfBytes.toString("base64");

  const interaction = await ai.interactions.create({
    model: MODEL,
    system_instruction:
      "Bạn trích xuất Quyết định Giao A (kèm phụ lục danh mục công trình nếu có) thành JSON. Chỉ trả JSON hợp lệ, không markdown.",
    input: [
      {
        type: "text",
        text: `Trả JSON đúng schema:
{
  "so_qd": string | null,
  "ngay_qd": "YYYY-MM-DD" | null,
  "trich_yeu": string | null,
  "ten_pc_tinh": string | null,
  "du_an": [{ "ma_du_an", "ten_du_an", "dia_diem", "quy_mo", "goi_cong_viec", "cap_dien_ap": "110kv" | "trung_ha_ap" | null }],
  "phu_luc": {
    "tong_tmdt": string | null,
    "tong_gia_tri_hd": string | null,
    "tong_chi_phi_l1": string | null,
    "tong_khv": string | null,
    "tong_tdtm": string | null,
    "tong_khcb": string | null,
    "cong_trinh": [{
      "stt": number | string,
      "ct_ten": string,
      "ct_quy_mo": string,
      "ct_tmdt": string | null,
      "ct_tien_do": string | null,
      "ct_danh_dau_tvtk": string | null,
      "ct_danh_dau_tvgs": string | null,
      "ct_gia_tri_hd": string | null,
      "ct_chi_phi_l1": string | null,
      "ct_khv": string | null,
      "ct_tdtm": string | null,
      "ct_khcb": string | null
    }]
  } | null
}

Quy tắc:
- ten_pc_tinh: chỉ «Công ty Điện lực [tên tỉnh]» (vd «Công ty Điện lực Hưng Yên») — KHÔNG kèm «để thực hiện…», giai đoạn, đợt, nội dung dự án.
- dia_diem: luôn điền tên tỉnh/thành khi biết được — lấy từ cột địa điểm; hoặc từ «tỉnh …» / «…, tỉnh …» trong tên dự án; hoặc từ «Công ty Điện lực [tỉnh]» / «do … quản lý». Chỉ ghi tên tỉnh (vd "Hà Tĩnh", "Hưng Yên") — không ghi chữ "Tỉnh"/"Thành phố".
- Nếu PDF có bảng/phụ lục danh mục công trình: điền đủ mọi dòng vào phu_luc.cong_trinh (không bỏ sót).
- ct_ten = tên công trình / danh mục đầy đủ.
- ct_quy_mo = toàn bộ cột quy mô (xuống dòng bằng \\n nếu nhiều ý).
- Cột tiền / tiến độ / KHV / TDTM / KHCB / giá trị HĐ / chi phí L1: điền nếu bảng có.
- Đánh dấu gói TVTK/TVGS (ô "X"): ct_danh_dau_tvtk / ct_danh_dau_tvgs.
- tong_* = hàng tổng (nếu có).
- Không có phụ lục → "phu_luc": null.`,
      },
      {
        type: "document",
        data: base64,
        mime_type: "application/pdf",
      },
    ],
    generation_config: {
      thinking_level: "minimal",
    },
  });

  const text = interaction.output_text?.trim();
  if (!text) {
    throw new Error("ScanAI không trả text");
  }

  const parsed = JSON.parse(stripFences(text)) as GiaoAScanResult;
  if (!Array.isArray(parsed.du_an)) {
    parsed.du_an = [];
  }
  parsed.phu_luc = normalizePhuLuc(parsed.phu_luc);

  const phuTen = parsed.phu_luc?.cong_trinh
    ?.map((c) => c.ct_ten)
    .filter(Boolean)
    .join("\n");
  parsed.ten_pc_tinh =
    cleanTenPcTinh(parsed.ten_pc_tinh?.toString()) ||
    extractTenPcTinh(parsed.trich_yeu, phuTen) ||
    null;

  // PDF chỉ có bảng phụ lục (không có danh mục dự án riêng) → lấy từ phụ lục
  if (!parsed.du_an.length && parsed.phu_luc?.cong_trinh?.length) {
    parsed.du_an = parsed.phu_luc.cong_trinh
      .filter((c) => {
        const ten = (c.ct_ten ?? "").trim();
        return ten !== "" && ten !== "—";
      })
      .map((c) => ({
        ten_du_an: (c.ct_ten ?? "").trim(),
        quy_mo: c.ct_quy_mo?.trim() || undefined,
        dia_diem: c.ct_khu_vuc?.trim() || undefined,
      }));
  }

  parsed.du_an = parsed.du_an.map((d) => ({
    ...d,
    dia_diem:
      resolveDiaDiem(d.dia_diem, {
        tenDuAn: d.ten_du_an,
        tenPcTinh: parsed.ten_pc_tinh,
      }) ?? undefined,
  }));

  return parsed;
}

export function normalizePhuLuc(
  raw: PhuLucGiaoA | null | undefined,
): PhuLucGiaoA | null {
  if (!raw || typeof raw !== "object") return null;
  const list = Array.isArray(raw.cong_trinh) ? raw.cong_trinh : [];
  const cong_trinh: PhuLucCongTrinh[] = list
    .map((row, i) => normalizeCongTrinh(row, i))
    .filter((r): r is PhuLucCongTrinh => r != null);
  if (!cong_trinh.length && !raw.tong_tmdt) return null;
  return {
    tong_tmdt: raw.tong_tmdt?.toString().trim() || null,
    tong_gia_tri_hd: raw.tong_gia_tri_hd?.toString().trim() || null,
    tong_chi_phi_l1: raw.tong_chi_phi_l1?.toString().trim() || null,
    tong_khv: raw.tong_khv?.toString().trim() || null,
    tong_tdtm: raw.tong_tdtm?.toString().trim() || null,
    tong_khcb: raw.tong_khcb?.toString().trim() || null,
    cong_trinh,
  };
}

function normalizeCongTrinh(
  row: PhuLucCongTrinh | null | undefined,
  index: number,
): PhuLucCongTrinh | null {
  if (!row || typeof row !== "object") return null;
  const ct_ten = (row.ct_ten ?? "").toString().trim();
  const ct_quy_mo =
    (row.ct_quy_mo ?? "").toString().trim() ||
    buildQuyMoFromParts(row);
  if (!ct_ten && !ct_quy_mo && !row.ct_tmdt && !row.ct_khv) return null;
  const tvtk =
    row.ct_danh_dau_tvtk?.toString().trim() ||
    row.ct_danh_dau_goi?.toString().trim() ||
    "";
  const tvgs = row.ct_danh_dau_tvgs?.toString().trim() || "";
  return {
    stt: row.stt ?? index + 1,
    ct_ten: ct_ten || "—",
    ct_quy_mo: ct_quy_mo || "",
    ct_khu_vuc: row.ct_khu_vuc?.toString().trim() || undefined,
    ct_quy_mo_dz_trung: row.ct_quy_mo_dz_trung?.toString().trim() || undefined,
    ct_quy_mo_tba: row.ct_quy_mo_tba?.toString().trim() || undefined,
    ct_quy_mo_dz_ha: row.ct_quy_mo_dz_ha?.toString().trim() || undefined,
    ct_tmdt: row.ct_tmdt?.toString().trim() || "",
    ct_tien_do: row.ct_tien_do?.toString().trim() || "",
    ct_danh_dau_tvtk: tvtk,
    ct_danh_dau_tvgs: tvgs,
    ct_danh_dau_goi: tvtk,
    ct_gia_tri_hd: row.ct_gia_tri_hd?.toString().trim() || "",
    ct_chi_phi_l1: row.ct_chi_phi_l1?.toString().trim() || "",
    ct_khv: row.ct_khv?.toString().trim() || "",
    ct_tdtm: row.ct_tdtm?.toString().trim() || "",
    ct_khcb: row.ct_khcb?.toString().trim() || "",
  };
}

function buildQuyMoFromParts(row: PhuLucCongTrinh): string {
  const lines: string[] = [];
  if (row.ct_quy_mo_dz_trung?.trim()) {
    lines.push(`- Xây dựng mới ${row.ct_quy_mo_dz_trung.trim()} ĐZ trung thế`);
  }
  if (row.ct_quy_mo_tba?.trim()) {
    lines.push(`- Xây dựng mới ${row.ct_quy_mo_tba.trim()} TBA`);
  }
  if (row.ct_quy_mo_dz_ha?.trim()) {
    lines.push(
      `- Xây dựng mới và cải tạo ${row.ct_quy_mo_dz_ha.trim()} ĐZ hạ thế 0.4kV`,
    );
  }
  return lines.join("\n");
}

function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
