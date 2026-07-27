import { normalizeDiaDiem } from "@/lib/dia-diem";
import {
  guessTinhNameFromText,
  matchProvinceAtStart,
  removeVietnameseTones,
} from "@/lib/ma-du-an";
import type { QdGiaoA, XiNghiep } from "@/lib/types";
import { formatNgayBanHanhChu } from "@/lib/word/format-ngay";

/**
 * Căn cứ mặc định — viết đầy đủ (không viết tắt «QĐ»), kèm trích yếu nếu có.
 * Số văn bản giữ nguyên (vd 1256/QĐ-EVNNPC).
 */
export function buildDefaultCanCuGiaoDanhMuc(
  qd: Pick<QdGiaoA, "so_qd" | "ngay_qd" | "trich_yeu"> | null | undefined,
): string {
  if (!qd?.so_qd?.trim()) return "";
  const so = qd.so_qd.trim();
  let text = `Căn cứ Quyết định giao danh mục số ${so}`;
  if (qd.ngay_qd?.trim()) {
    text += ` ${formatNgayBanHanhChu(qd.ngay_qd)}`;
  }
  const ty = qd.trich_yeu?.trim();
  if (ty) {
    const veViec = ty.replace(/^về\s+việc\s+/i, "").trim();
    if (veViec) text += ` về việc ${veViec}`;
  }
  if (!text.endsWith(".")) text += ".";
  return text;
}

/** Tên tỉnh từ địa điểm dự án / Giao A (đã bỏ tiền tố Tỉnh/TP). */
export function tinhFromDiaDiem(
  dia: string | null | undefined,
): string | null {
  return normalizeDiaDiem(dia);
}

/**
 * Chuẩn hóa «Chủ đầu tư»: chỉ «Công ty Điện lực [tỉnh]»,
 * cắt phần «để thực hiện…», giai đoạn, đợt…
 */
export function cleanTenPcTinh(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;
  let s = raw.trim().replace(/\s+/g, " ");

  const start = s.search(/Công\s*ty\s+Điện\s*lực/i);
  if (start >= 0) s = s.slice(start);

  // Cắt nối tiếp nghiệp vụ
  s = s.replace(
    /\s+(?:để|nhằm|nhằm\s+mục\s+đích|về\s+việc|thực\s+hiện|giai\s+đoạn|đợt|trong\s+giai|theo\s+quyết)\b[\s\S]*$/i,
    "",
  );
  s = s.replace(/\s*\([^)]*$/g, "").replace(/\s*\(.*$/g, "");

  const after = s.replace(/^Công\s*ty\s+Điện\s*lực\s+/i, "");
  const tinh = matchProvinceAtStart(after);
  if (tinh) return `Công ty Điện lực ${tinh}`;

  // Fallback: tối đa 3 từ sau «Điện lực» (tên tỉnh)
  const m = s.match(
    /^(Công\s*ty\s+Điện\s*lực\s+(?:Thành\s*phố\s+|TP\.?\s*)?[A-ZÀ-ỸĐ][\p{L}'.]*(?:\s+[A-ZÀ-ỸĐ][\p{L}'.]*){0,2})/u,
  );
  if (m?.[1]) {
    return m[1]
      .replace(/\s+/g, " ")
      .replace(/[,”"')]+$/g, "")
      .trim();
  }

  const cleaned = s
    .replace(/\s+/g, " ")
    .replace(/\s+(và|cho|do|về|năm)\s*$/i, "")
    .replace(/[)”"]+$/g, "")
    .trim();
  return cleaned.length >= 18 ? cleaned : null;
}

/**
 * Trích «Công ty Điện lực …» từ tiêu đề / trích yếu / tên danh mục Giao A.
 * Pattern thường gặp: «… giao cho / cho Công ty Điện lực Hà Tĩnh»
 * hoặc «do Công ty Điện lực … quản lý».
 */
export function extractTenPcTinh(
  ...sources: Array<string | null | undefined>
): string | null {
  const text = sources
    .filter((s): s is string => Boolean(s?.trim()))
    .join("\n");
  if (!text) return null;

  const patterns: RegExp[] = [
    /(?:tạm\s+)?giao\s+cho\s+(Công\s*ty\s+Điện\s*lực[^,\n.;]+)/i,
    /(?:^|[\s,;])cho\s+(Công\s*ty\s+Điện\s*lực[^,\n.;]+)/i,
    /do\s+(Công\s*ty\s+Điện\s*lực[^,\n.;]+?)\s+quản\s*lý/i,
    /(Công\s*ty\s+Điện\s*lực\s+[A-ZÀ-ỸĐ][^,\n.;]{1,80})/i,
  ];

  for (const re of patterns) {
    const m = text.match(re);
    const cleaned = cleanTenPcTinh(m?.[1]);
    if (cleaned) return cleaned;
  }
  return null;
}

/** Lấy tên tỉnh từ «Công ty Điện lực Hà Tĩnh» → «Hà Tĩnh» */
export function tinhFromTenPcTinh(
  tenPc: string | null | undefined,
): string | null {
  const cleaned = cleanTenPcTinh(tenPc) || tenPc?.trim();
  if (!cleaned) return null;
  const m = cleaned.match(/Công\s*ty\s+Điện\s*lực\s+(.+)$/i);
  if (!m?.[1]) return null;
  return matchProvinceAtStart(m[1]) || normalizeDiaDiem(m[1].trim());
}

/**
 * Địa điểm hiển thị / lưu DB: cột có sẵn → suy từ PC tỉnh →
 * «Công ty Điện lực …» trong tên → khớp đúng 1 tỉnh trong chuỗi.
 */
export function resolveDiaDiem(
  diaDiem: string | null | undefined,
  opts?: {
    tenDuAn?: string | null;
    tenPcTinh?: string | null;
  },
): string | null {
  return (
    normalizeDiaDiem(diaDiem) ||
    tinhFromTenPcTinh(opts?.tenPcTinh) ||
    tinhFromTenPcTinh(extractTenPcTinh(opts?.tenDuAn)) ||
    guessTinhNameFromText(opts?.tenDuAn, opts?.tenPcTinh)
  );
}

/**
 * Mặc định Xí nghiệp cùng tỉnh — ưu tiên từ PC tỉnh Giao A, rồi địa điểm DA.
 */
export function matchXiNghiepByTinh(
  list: XiNghiep[],
  diaDiem: string | null | undefined,
  tenPcTinh?: string | null,
): XiNghiep | null {
  const tinh =
    tinhFromTenPcTinh(tenPcTinh) || tinhFromDiaDiem(diaDiem);
  if (!tinh || !list.length) return null;

  const tinhKey = removeVietnameseTones(tinh).toLowerCase().trim();
  if (!tinhKey) return null;

  const scored = list
    .map((x) => {
      const tenKey = removeVietnameseTones(x.ten).toLowerCase();
      const maKey = removeVietnameseTones(x.ma ?? "").toLowerCase();
      if (!tenKey.includes(tinhKey) && !maKey.includes(tinhKey)) {
        return { x, score: 0 };
      }
      let score = 10;
      if (/dvdl|dien luc/.test(tenKey) || maKey.startsWith("dvdl")) score += 5;
      if (tenKey.includes(`dvdl ${tinhKey}`) || tenKey.endsWith(tinhKey)) {
        score += 3;
      }
      return { x, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.x ?? null;
}

/** PC tỉnh mặc định: extract từ Giao A, không thì suy từ địa điểm. */
export function defaultTenPcTinh(opts: {
  ten_pc_tinh?: string | null;
  trich_yeu?: string | null;
  phu_luc_ten?: string | null;
  dia_diem?: string | null;
}): string {
  const fromDoc =
    cleanTenPcTinh(opts.ten_pc_tinh) ||
    extractTenPcTinh(opts.trich_yeu, opts.phu_luc_ten);
  if (fromDoc) return fromDoc;
  const tinh = tinhFromDiaDiem(opts.dia_diem);
  return tinh ? `Công ty Điện lực ${tinh}` : "";
}
