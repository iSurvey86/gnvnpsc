import { normalizeTenDuAn } from "@/lib/du-an-trung";
import type { PhuLucCongTrinh, PhuLucGiaoA } from "@/lib/types";

/** Dòng phụ lục có tên công trình. */
export function parsePhuLucCongTrinh(phuLuc: unknown): PhuLucCongTrinh[] {
  if (!phuLuc || typeof phuLuc !== "object") return [];
  const pl = phuLuc as PhuLucGiaoA;
  if (!Array.isArray(pl.cong_trinh)) return [];
  return pl.cong_trinh.filter((r) => Boolean(r?.ct_ten?.trim()));
}

/** Tập khóa tên chuẩn hóa từ `cong_trinh_chon` hoặc payload soạn. */
export function tenKeysTuCongTrinhChon(rows: unknown): Set<string> {
  const keys = new Set<string>();
  if (!Array.isArray(rows)) return keys;
  for (const r of rows) {
    const ten =
      typeof r === "string" ? r : (r as PhuLucCongTrinh | null)?.ct_ten;
    const k = normalizeTenDuAn(ten);
    if (k) keys.add(k);
  }
  return keys;
}

export type CtAssignInfo = {
  qdId: string;
  ownerId: string;
  soQd: string | null;
  xn: string | null;
  trangThai: string | null;
};

/** Gom tên CT → QĐ giao XN (từ `cong_trinh_chon` đã lưu). */
export function mapCtDaGiaoTuQdXn(
  qds: Array<{
    id: string;
    du_an_id: string;
    so_qd_du_thao: string | null;
    trang_thai?: string | null;
    cong_trinh_chon: unknown;
    xi_nghiep_ten?: string | null;
  }>,
): Map<string, CtAssignInfo> {
  const out = new Map<string, CtAssignInfo>();
  for (const q of qds) {
    const keys = tenKeysTuCongTrinhChon(q.cong_trinh_chon);
    const info: CtAssignInfo = {
      qdId: q.id,
      ownerId: q.du_an_id,
      soQd: q.so_qd_du_thao,
      xn: q.xi_nghiep_ten ?? null,
      trangThai: q.trang_thai ?? null,
    };
    for (const k of keys) {
      out.set(k, info);
    }
  }
  return out;
}

/**
 * Đếm tổng / đã giao theo phụ lục.
 * - Có phụ lục: mẫu số = số dòng phụ lục; tử số = số dòng khớp `daGiaoKeys`
 *   (từ `cong_trinh_chon` hoặc `ganCtKeysChoQdXn` — tối đa 1 CT/QĐ khi chưa tick).
 * - Không có phụ lục: đếm theo số khóa đã giao / tổng dự án fallback.
 */
export function demCtPhuLuc(opts: {
  phuLuc: unknown;
  daGiaoKeys: Set<string>;
  fallbackTong?: number;
}): { tong_ct: number; da_giao_ct: number } {
  const rows = parsePhuLucCongTrinh(opts.phuLuc);
  if (!rows.length) {
    return {
      tong_ct: opts.fallbackTong ?? 0,
      da_giao_ct: opts.daGiaoKeys.size,
    };
  }
  let daGiao = 0;
  for (const r of rows) {
    const k = normalizeTenDuAn(r.ct_ten);
    if (k && opts.daGiaoKeys.has(k)) daGiao += 1;
  }
  return { tong_ct: rows.length, da_giao_ct: daGiao };
}

/** Số CT giao theo từng QĐ (từ map phụ lục → QĐ). */
export function demSoCtTheoQd(
  assignMap: Map<string, CtQdAssign>,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const a of assignMap.values()) {
    out.set(a.qdId, (out.get(a.qdId) ?? 0) + 1);
  }
  return out;
}

export function rowKeyPhuLuc(row: PhuLucCongTrinh, index: number): string {
  const stt = row.stt != null ? String(row.stt) : String(index + 1);
  const k = normalizeTenDuAn(row.ct_ten) || `idx-${index}`;
  return `${stt}:${k}`;
}

export type CtQdAssign = {
  qdId: string;
  ownerId: string;
  soQd: string | null;
  xn: string | null;
  tenHienThi: string;
};

/**
 * Gán khóa CT phụ lục → QĐ.
 * Ưu tiên `cong_trinh_chon`; QĐ chưa có tick → fallback khớp tên DA / lần lượt
 * (cùng quy tắc đếm «dự thảo = đã giao»).
 */
export function ganCtKeysChoQdXn(opts: {
  phuLucRows: PhuLucCongTrinh[];
  duAns: Array<{ id: string; ten_du_an: string }>;
  qds: Array<{
    id: string;
    du_an_id: string;
    so_qd_du_thao: string | null;
    cong_trinh_chon: unknown;
    xi_nghiep_ten: string | null;
  }>;
}): Map<string, CtQdAssign> {
  const out = new Map<string, CtQdAssign>();
  const taken = new Set<string>();

  for (const q of opts.qds) {
    const keys = tenKeysTuCongTrinhChon(q.cong_trinh_chon);
    for (const k of keys) {
      if (taken.has(k)) continue;
      taken.add(k);
      out.set(k, {
        qdId: q.id,
        ownerId: q.du_an_id,
        soQd: q.so_qd_du_thao,
        xn: q.xi_nghiep_ten,
        tenHienThi: tenHienThiTuChon(q.cong_trinh_chon, k),
      });
    }
  }

  const qdsThieuChon = opts.qds.filter(
    (q) => tenKeysTuCongTrinhChon(q.cong_trinh_chon).size === 0,
  );
  if (!qdsThieuChon.length || !opts.phuLucRows.length) return out;

  const daById = new Map(opts.duAns.map((d) => [d.id, d]));
  const rowKeys = opts.phuLucRows.map((r) => normalizeTenDuAn(r.ct_ten));

  for (const q of qdsThieuChon) {
    const da = daById.get(q.du_an_id);
    const daKey = da ? normalizeTenDuAn(da.ten_du_an) : "";
    let assigned = false;
    if (daKey) {
      for (let i = 0; i < rowKeys.length; i++) {
        const k = rowKeys[i];
        if (!k || taken.has(k) || k !== daKey) continue;
        taken.add(k);
        out.set(k, {
          qdId: q.id,
          ownerId: q.du_an_id,
          soQd: q.so_qd_du_thao,
          xn: q.xi_nghiep_ten,
          tenHienThi: opts.phuLucRows[i]?.ct_ten?.trim() || k,
        });
        assigned = true;
        break;
      }
    }
    if (assigned) continue;
    for (let i = 0; i < rowKeys.length; i++) {
      const k = rowKeys[i];
      if (!k || taken.has(k)) continue;
      taken.add(k);
      out.set(k, {
        qdId: q.id,
        ownerId: q.du_an_id,
        soQd: q.so_qd_du_thao,
        xn: q.xi_nghiep_ten,
        tenHienThi: opts.phuLucRows[i]?.ct_ten?.trim() || k,
      });
      break;
    }
  }

  return out;
}

function tenHienThiTuChon(chon: unknown, key: string): string {
  if (!Array.isArray(chon)) return key;
  for (const r of chon) {
    const ten =
      typeof r === "string" ? r : (r as PhuLucCongTrinh | null)?.ct_ten;
    if (normalizeTenDuAn(ten) === key) return (ten ?? key).trim();
  }
  return key;
}
