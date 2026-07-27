/** So khớp tên dự án để cảnh báo trùng (không phân biệt hoa thường / khoảng trắng thừa). */

export function normalizeTenDuAn(ten: string | null | undefined): string {
  return (ten ?? "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export type DuAnTrungRef = {
  id: string;
  ten_du_an: string;
  ma_du_an?: string | null;
  qd_giao_a_id?: string | null;
  so_qd?: string | null;
};

/**
 * Với mỗi dòng trong `rows`, tìm dự án khác trong `pool` trùng tên
 * (ngoài danh sách đang nhập / ngoài cùng hồ sơ Giao A hiện tại).
 */
export function findTrungTenByRow<T extends { id: string; ten_du_an: string }>(
  rows: T[],
  pool: DuAnTrungRef[],
  opts?: {
    excludeIds?: Set<string>;
    /** Bỏ qua dự án thuộc cùng QĐ Giao A đang review */
    excludeQdGiaoAId?: string | null;
  },
): Map<string, DuAnTrungRef[]> {
  const skip = opts?.excludeIds ?? new Set(rows.map((r) => r.id));
  const excludeQd = opts?.excludeQdGiaoAId ?? null;
  const byNorm = new Map<string, DuAnTrungRef[]>();
  for (const p of pool) {
    if (skip.has(p.id)) continue;
    if (excludeQd && p.qd_giao_a_id === excludeQd) continue;
    const key = normalizeTenDuAn(p.ten_du_an);
    if (!key) continue;
    const list = byNorm.get(key) ?? [];
    list.push(p);
    byNorm.set(key, list);
  }

  const result = new Map<string, DuAnTrungRef[]>();
  for (const row of rows) {
    const key = normalizeTenDuAn(row.ten_du_an);
    if (!key) continue;
    const hits = byNorm.get(key);
    if (hits?.length) result.set(row.id, hits);
  }
  return result;
}

/** Trùng tên trong cùng danh sách đang nhập */
export function findTrungTenTrongBang<
  T extends { id: string; ten_du_an: string },
>(rows: T[]): Map<string, string[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = normalizeTenDuAn(row.ten_du_an);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const result = new Map<string, string[]>();
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const ids = list.map((r) => r.id);
    for (const r of list) {
      result.set(
        r.id,
        ids.filter((id) => id !== r.id),
      );
    }
  }
  return result;
}
