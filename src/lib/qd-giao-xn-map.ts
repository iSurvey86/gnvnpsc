import { normalizeTenDuAn } from "@/lib/du-an-trung";
import {
  ganCtKeysChoQdXn,
  parsePhuLucCongTrinh,
  tenKeysTuCongTrinhChon,
} from "@/lib/giao-a-ct-stats";
import type { LoaiGiaoXn, PhuLucCongTrinh } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Trích tên công trình từ payload soạn (ưu tiên ct_ten). */
export function tenCongTrinhTuPayload(
  rows: Array<{ ct_ten?: string | null } | string> | null | undefined,
): string[] {
  if (!rows?.length) return [];
  const out: string[] = [];
  for (const r of rows) {
    const ten = typeof r === "string" ? r : (r.ct_ten ?? "");
    const t = ten.trim();
    if (t) out.push(t);
  }
  return out;
}

export type SyncQdMapResult = {
  mapped_du_an_ids: string[];
  skipped_conflicts: Array<{
    du_an_id: string;
    ten_du_an: string;
    qd_giao_xn_id: string;
  }>;
};

type MapRow = {
  du_an_id: string;
  qd_giao_xn_id: string;
  qd_giao_xn: { id: string; loai: string } | { id: string; loai: string }[] | null;
};

/**
 * Đồng bộ map: mọi dự án cùng Giao A khớp tên công trình trong danh sách
 * → gắn vào QĐ này. Luôn gồm dự án chủ (`du_an_id` của QĐ).
 * Không cướp dự án đã thuộc QĐ khác cùng loại.
 */
export async function syncQdGiaoXnDuAnMap(
  supabase: SupabaseClient,
  opts: {
    qdGiaoXnId: string;
    tenCongTrinh: string[];
  },
): Promise<SyncQdMapResult> {
  const { data: qd, error: qdErr } = await supabase
    .from("qd_giao_xn")
    .select("id, du_an_id, loai")
    .eq("id", opts.qdGiaoXnId)
    .maybeSingle();
  if (qdErr) throw new Error(qdErr.message);
  if (!qd) throw new Error("Không tìm thấy quyết định");

  const duAnChuId = qd.du_an_id as string;
  const loai = qd.loai as LoaiGiaoXn;

  const { data: duAnChu, error: daErr } = await supabase
    .from("du_an")
    .select("id, ten_du_an, qd_giao_a_id, phan_he")
    .eq("id", duAnChuId)
    .maybeSingle();
  if (daErr) throw new Error(daErr.message);
  if (!duAnChu) throw new Error("Không tìm thấy dự án chủ");

  const qdGiaoAId = duAnChu.qd_giao_a_id as string | null;
  const phanHe = duAnChu.phan_he as string | null;
  const nameKeys = new Set<string>();
  for (const t of opts.tenCongTrinh) {
    const k = normalizeTenDuAn(t);
    if (k) nameKeys.add(k);
  }
  const chuKey = normalizeTenDuAn(duAnChu.ten_du_an as string);
  if (chuKey) nameKeys.add(chuKey);

  let candidates: Array<{ id: string; ten_du_an: string }> = [
    { id: duAnChuId, ten_du_an: duAnChu.ten_du_an as string },
  ];

  if (qdGiaoAId && nameKeys.size) {
    let sibQ = supabase
      .from("du_an")
      .select("id, ten_du_an")
      .eq("qd_giao_a_id", qdGiaoAId)
      .eq("da_luu", true);
    if (phanHe) sibQ = sibQ.eq("phan_he", phanHe);
    const { data: siblings, error: sibErr } = await sibQ;
    if (sibErr) throw new Error(sibErr.message);
    candidates = (siblings ?? []) as Array<{ id: string; ten_du_an: string }>;
  }

  const matchedIds = new Set<string>();
  matchedIds.add(duAnChuId);
  for (const c of candidates) {
    const k = normalizeTenDuAn(c.ten_du_an);
    if (k && nameKeys.has(k)) matchedIds.add(c.id);
  }

  const matchedList = [...matchedIds];
  const { data: existingMaps, error: mapErr } = await supabase
    .from("qd_giao_xn_du_an")
    .select(
      "du_an_id, qd_giao_xn_id, qd_giao_xn:qd_giao_xn_id ( id, loai )",
    )
    .in("du_an_id", matchedList);
  if (mapErr) throw new Error(mapErr.message);

  const skipped_conflicts: SyncQdMapResult["skipped_conflicts"] = [];
  const finalIds = new Set<string>([duAnChuId]);

  for (const id of matchedList) {
    if (id === duAnChuId) continue;
    const conflicts = ((existingMaps ?? []) as MapRow[]).filter((m) => {
      if (m.du_an_id !== id) return false;
      if (m.qd_giao_xn_id === opts.qdGiaoXnId) return false;
      const q = Array.isArray(m.qd_giao_xn) ? m.qd_giao_xn[0] : m.qd_giao_xn;
      return q?.loai === loai;
    });
    if (conflicts.length) {
      const ten = candidates.find((c) => c.id === id)?.ten_du_an ?? id;
      skipped_conflicts.push({
        du_an_id: id,
        ten_du_an: ten,
        qd_giao_xn_id: conflicts[0].qd_giao_xn_id,
      });
      continue;
    }
    finalIds.add(id);
  }

  const { error: delErr } = await supabase
    .from("qd_giao_xn_du_an")
    .delete()
    .eq("qd_giao_xn_id", opts.qdGiaoXnId);
  if (delErr) throw new Error(delErr.message);

  const rows = [...finalIds].map((du_an_id) => ({
    qd_giao_xn_id: opts.qdGiaoXnId,
    du_an_id,
  }));
  if (rows.length) {
    const { error: insErr } = await supabase
      .from("qd_giao_xn_du_an")
      .insert(rows);
    if (insErr) throw new Error(insErr.message);
  }

  return {
    mapped_du_an_ids: [...finalIds],
    skipped_conflicts,
  };
}

export type CongTrinhDaGiaoKhac = {
  ten_key: string;
  ten_du_an: string;
  qd_giao_xn_id: string;
  so_qd_du_thao: string | null;
  xi_nghiep_ten: string | null;
};

export type PhuLucGiaoXnContext = {
  /** Công trình (theo tên phụ lục) đã thuộc QĐ khác — không chọn lại */
  daGiaoKhac: CongTrinhDaGiaoKhac[];
  /** Tên đã chuẩn hóa đang gắn QĐ hiện tại (khi sửa dự thảo) */
  tenTrongQdHienTai: string[];
  /** Số dự án đã lưu cùng Giao A chưa gắn QĐ loại này */
  soDaChuaGiao: number;
};

/**
 * Ngữ cảnh phụ lục khi soạn: công trình đã giao (+ fallback dự thảo cũ).
 */
export async function loadPhuLucGiaoXnContext(
  supabase: SupabaseClient,
  opts: {
    qdGiaoAId: string | null;
    phanHe: string;
    loai: LoaiGiaoXn;
    excludeQdId?: string | null;
  },
): Promise<PhuLucGiaoXnContext> {
  const empty: PhuLucGiaoXnContext = {
    daGiaoKhac: [],
    tenTrongQdHienTai: [],
    soDaChuaGiao: 0,
  };
  if (!opts.qdGiaoAId) return empty;

  const { data: siblings, error: sibErr } = await supabase
    .from("du_an")
    .select("id, ten_du_an")
    .eq("qd_giao_a_id", opts.qdGiaoAId)
    .eq("phan_he", opts.phanHe)
    .eq("da_luu", true);
  if (sibErr) throw new Error(sibErr.message);
  const duAns = (siblings ?? []) as Array<{ id: string; ten_du_an: string }>;
  const ids = duAns.map((d) => d.id);
  if (!ids.length) return empty;

  const { data: qdA } = await supabase
    .from("qd_giao_a")
    .select("phu_luc")
    .eq("id", opts.qdGiaoAId)
    .maybeSingle();
  const phuLucRows = parsePhuLucCongTrinh(qdA?.phu_luc);

  const { data: qdXns, error: qxErr } = await supabase
    .from("qd_giao_xn")
    .select(
      "id, du_an_id, so_qd_du_thao, cong_trinh_chon, xi_nghiep:xi_nghiep_id ( ten )",
    )
    .eq("loai", opts.loai)
    .in("du_an_id", ids);
  if (qxErr) throw new Error(qxErr.message);

  function oneXn(
    v: { ten: string } | { ten: string }[] | null | undefined,
  ): string | null {
    if (!v) return null;
    const x = Array.isArray(v) ? v[0] : v;
    return x?.ten?.trim() || null;
  }

  const qds = (qdXns ?? []).map((q) => ({
    id: q.id as string,
    du_an_id: q.du_an_id as string,
    so_qd_du_thao: q.so_qd_du_thao as string | null,
    cong_trinh_chon: q.cong_trinh_chon,
    xi_nghiep_ten: oneXn(
      q.xi_nghiep as { ten: string } | { ten: string }[] | null,
    ),
  }));

  const assignMap = ganCtKeysChoQdXn({
    phuLucRows,
    duAns,
    qds,
  });

  // Không có phụ lục: fallback khóa theo tên DA (logic cũ)
  if (!phuLucRows.length) {
    for (const q of qds) {
      const keys = tenKeysTuCongTrinhChon(q.cong_trinh_chon);
      if (keys.size) continue;
      const da = duAns.find((d) => d.id === q.du_an_id);
      const k = normalizeTenDuAn(da?.ten_du_an);
      if (!k || assignMap.has(k)) continue;
      assignMap.set(k, {
        qdId: q.id,
        ownerId: q.du_an_id,
        soQd: q.so_qd_du_thao,
        xn: q.xi_nghiep_ten,
        tenHienThi: da?.ten_du_an ?? k,
      });
    }
  }

  const daGiaoKhac: CongTrinhDaGiaoKhac[] = [];
  const tenTrongQdHienTai: string[] = [];
  const seenKhac = new Set<string>();

  for (const [k, a] of assignMap) {
    if (opts.excludeQdId && a.qdId === opts.excludeQdId) {
      tenTrongQdHienTai.push(k);
      continue;
    }
    if (seenKhac.has(k)) continue;
    seenKhac.add(k);
    daGiaoKhac.push({
      ten_key: k,
      ten_du_an: a.tenHienThi,
      qd_giao_xn_id: a.qdId,
      so_qd_du_thao: a.soQd,
      xi_nghiep_ten: a.xn,
    });
  }

  return { daGiaoKhac, tenTrongQdHienTai, soDaChuaGiao: 0 };
}
