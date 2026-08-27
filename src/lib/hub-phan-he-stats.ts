import {
  demCtPhuLuc,
  ganCtKeysChoQdXn,
  parsePhuLucCongTrinh,
} from "@/lib/giao-a-ct-stats";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHAN_HE, type PhanHeCode } from "@/lib/phan-he";

export type HubPhanHeStats = {
  tong: number;
  daGiao: number;
  chuaGiao: number;
};

const EMPTY: HubPhanHeStats = { tong: 0, daGiao: 0, chuaGiao: 0 };

function oneXn(
  v: { ten: string } | { ten: string }[] | null | undefined,
): string | null {
  if (!v) return null;
  const x = Array.isArray(v) ? v[0] : v;
  return x?.ten?.trim() || null;
}

type QdRow = {
  id: string;
  du_an_id: string;
  so_qd_du_thao: string | null;
  cong_trinh_chon: unknown;
  xi_nghiep_ten: string | null;
};

/**
 * Thống kê hub theo phân hệ — cùng quy tắc đếm CT như danh sách Giao A:
 * gom theo Giao A → `ganCtKeysChoQdXn` / phụ lục; dự án lẻ (không Giao A) đếm 1/1.
 */
export async function loadHubPhanHeStats(): Promise<
  Record<PhanHeCode, HubPhanHeStats>
> {
  const out: Record<PhanHeCode, HubPhanHeStats> = {
    tvtk: { ...EMPTY },
    thi_nghiem: { ...EMPTY },
    tvgs: { ...EMPTY },
  };

  const supabase = createAdminClient();

  const { data: duAns, error: daErr } = await supabase
    .from("du_an")
    .select("id, phan_he, qd_giao_a_id, ten_du_an")
    .eq("da_luu", true);
  if (daErr) throw new Error(daErr.message);

  const rows = (duAns ?? []) as Array<{
    id: string;
    phan_he: string;
    qd_giao_a_id: string | null;
    ten_du_an: string;
  }>;
  if (!rows.length) return out;

  const ids = rows.map((r) => r.id);
  const phanHeByDa = new Map(rows.map((r) => [r.id, r.phan_he]));

  const giaoAIds = [
    ...new Set(
      rows.map((r) => r.qd_giao_a_id).filter((id): id is string => Boolean(id)),
    ),
  ];

  const phuLucByGiaoA = new Map<string, unknown>();
  if (giaoAIds.length) {
    const { data: qdRows, error: plErr } = await supabase
      .from("qd_giao_a")
      .select("id, phu_luc")
      .in("id", giaoAIds);
    if (plErr) throw new Error(plErr.message);
    for (const q of qdRows ?? []) {
      phuLucByGiaoA.set(q.id as string, q.phu_luc);
    }
  }

  const { data: qdXns, error: qxErr } = await supabase
    .from("qd_giao_xn")
    .select(
      "id, du_an_id, phan_he, loai, cong_trinh_chon, so_qd_du_thao, xi_nghiep:xi_nghiep_id ( ten )",
    )
    .in("du_an_id", ids);
  if (qxErr) throw new Error(qxErr.message);

  const assignedStandalone = new Set<string>();
  for (const q of qdXns ?? []) {
    assignedStandalone.add(q.du_an_id as string);
  }

  const { data: mapped, error: mapErr } = await supabase
    .from("qd_giao_xn_du_an")
    .select("du_an_id")
    .in("du_an_id", ids);
  if (!mapErr) {
    for (const r of mapped ?? []) {
      if (r.du_an_id) assignedStandalone.add(r.du_an_id as string);
    }
  }

  const qdsByGiaoAKey = new Map<string, QdRow[]>();
  const qdSeenByGiaoAKey = new Map<string, Set<string>>();

  for (const q of qdXns ?? []) {
    const daId = q.du_an_id as string;
    const giaoAId = rows.find((r) => r.id === daId)?.qd_giao_a_id;
    if (!giaoAId) continue;

    const phanHe = (q.phan_he as string | null) ?? phanHeByDa.get(daId);
    if (!phanHe || !(phanHe in out)) continue;
    const code = phanHe as PhanHeCode;
    if (q.loai !== PHAN_HE[code].defaultLoaiGiao) continue;
    if (q.phan_he && q.phan_he !== phanHe) continue;

    const key = `${giaoAId}:${phanHe}`;
    let seen = qdSeenByGiaoAKey.get(key);
    if (!seen) {
      seen = new Set();
      qdSeenByGiaoAKey.set(key, seen);
    }
    const qid = q.id as string;
    if (seen.has(qid)) continue;
    seen.add(qid);

    let bucket = qdsByGiaoAKey.get(key);
    if (!bucket) {
      bucket = [];
      qdsByGiaoAKey.set(key, bucket);
    }
    bucket.push({
      id: qid,
      du_an_id: daId,
      so_qd_du_thao: q.so_qd_du_thao as string | null,
      cong_trinh_chon: q.cong_trinh_chon,
      xi_nghiep_ten: oneXn(
        q.xi_nghiep as { ten: string } | { ten: string }[] | null,
      ),
    });
  }

  const byGiaoAKey = new Map<
    string,
    { phanHe: PhanHeCode; giaoAId: string; duAns: Array<{ id: string; ten_du_an: string }> }
  >();

  for (const r of rows) {
    const code = r.phan_he as PhanHeCode;
    if (!(code in out)) continue;

    if (!r.qd_giao_a_id) {
      out[code].tong += 1;
      if (assignedStandalone.has(r.id)) out[code].daGiao += 1;
      else out[code].chuaGiao += 1;
      continue;
    }

    const key = `${r.qd_giao_a_id}:${code}`;
    const cur = byGiaoAKey.get(key);
    const da = { id: r.id, ten_du_an: r.ten_du_an };
    if (cur) {
      cur.duAns.push(da);
    } else {
      byGiaoAKey.set(key, {
        phanHe: code,
        giaoAId: r.qd_giao_a_id,
        duAns: [da],
      });
    }
  }

  for (const { phanHe, giaoAId, duAns: daList } of byGiaoAKey.values()) {
    const key = `${giaoAId}:${phanHe}`;
    const phuLuc = phuLucByGiaoA.get(giaoAId);
    const phuLucRows = parsePhuLucCongTrinh(phuLuc);
    const qds = qdsByGiaoAKey.get(key) ?? [];
    const assignMap = ganCtKeysChoQdXn({
      phuLucRows,
      duAns: daList,
      qds,
    });
    const { tong_ct, da_giao_ct } = demCtPhuLuc({
      phuLuc,
      daGiaoKeys: new Set(assignMap.keys()),
      fallbackTong: daList.length,
    });
    out[phanHe].tong += tong_ct;
    out[phanHe].daGiao += da_giao_ct;
    out[phanHe].chuaGiao += Math.max(0, tong_ct - da_giao_ct);
  }

  return out;
}
