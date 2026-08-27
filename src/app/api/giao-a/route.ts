import { NextResponse } from "next/server";
import {
  demCtPhuLuc,
  ganCtKeysChoQdXn,
  parsePhuLucCongTrinh,
} from "@/lib/giao-a-ct-stats";
import type { GiaoAListItem } from "@/lib/giao-a-theo-doi";
import {
  AuthError,
  parsePhanHeParam,
  requireSession,
} from "@/lib/phan-he-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type QdRef = {
  id: string;
  so_qd: string | null;
  ngay_qd: string | null;
  trich_yeu: string | null;
  scanned_by_ho_ten: string | null;
  storage_path: string | null;
  created_at: string;
};

function oneXn(
  v: { ten: string } | { ten: string }[] | null | undefined,
): string | null {
  if (!v) return null;
  const x = Array.isArray(v) ? v[0] : v;
  return x?.ten?.trim() || null;
}

/**
 * GET danh sách Giao A.
 * - Có `?phan_he=` → gom theo Giao A có dự án đã lưu của phân hệ (+ tiến độ giao).
 * - Không có → danh sách hồ sơ thô (tương thích cũ, tối đa 50).
 */
export async function GET(request: Request) {
  try {
    await requireSession();
    const sp = new URL(request.url).searchParams;
    const phanHeRaw = sp.get("phan_he");
    const supabase = createAdminClient();

    if (!phanHeRaw) {
      const { data, error } = await supabase
        .from("qd_giao_a")
        .select("id, so_qd, ngay_qd, trich_yeu, scan_status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, data });
    }

    const phanHe = parsePhanHeParam(phanHeRaw);

    const { data: duAns, error: daErr } = await supabase
      .from("du_an")
      .select(
        `id, ten_du_an, qd_giao_a_id,
         qd_giao_a:qd_giao_a_id (
           id, so_qd, ngay_qd, trich_yeu, scanned_by_ho_ten, storage_path, created_at
         )`,
      )
      .eq("phan_he", phanHe)
      .eq("da_luu", true)
      .not("qd_giao_a_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (daErr) throw new Error(daErr.message);

    const rows = (duAns ?? []) as Array<{
      id: string;
      ten_du_an: string;
      qd_giao_a_id: string;
      qd_giao_a: QdRef | QdRef[] | null;
    }>;

    const byGiaoA = new Map<
      string,
      { qd: QdRef; duAnIds: string[]; duAns: Array<{ id: string; ten_du_an: string }> }
    >();

    for (const r of rows) {
      const qdRaw = r.qd_giao_a;
      const qd = Array.isArray(qdRaw) ? qdRaw[0] : qdRaw;
      if (!qd?.id) continue;
      const cur = byGiaoA.get(qd.id);
      const da = { id: r.id, ten_du_an: r.ten_du_an };
      if (cur) {
        cur.duAnIds.push(r.id);
        cur.duAns.push(da);
      } else {
        byGiaoA.set(qd.id, { qd, duAnIds: [r.id], duAns: [da] });
      }
    }

    const giaoAIds = [...byGiaoA.keys()];
    const phuLucByGiaoA = new Map<string, unknown>();

    if (giaoAIds.length) {
      const { data: qdPhuLuc, error: plErr } = await supabase
        .from("qd_giao_a")
        .select("id, phu_luc")
        .in("id", giaoAIds);
      if (plErr) throw new Error(plErr.message);
      for (const q of qdPhuLuc ?? []) {
        phuLucByGiaoA.set(q.id as string, q.phu_luc);
      }
    }

    const allIds = rows.map((r) => r.id);
    const qdsByGiaoA = new Map<
      string,
      Array<{
        id: string;
        du_an_id: string;
        so_qd_du_thao: string | null;
        cong_trinh_chon: unknown;
        xi_nghiep_ten: string | null;
      }>
    >();

    if (allIds.length) {
      const duAnToGiaoA = new Map<string, string>();
      for (const r of rows) {
        duAnToGiaoA.set(r.id, r.qd_giao_a_id);
      }

      const { data: qdXns, error: qxErr } = await supabase
        .from("qd_giao_xn")
        .select(
          "id, du_an_id, phan_he, cong_trinh_chon, so_qd_du_thao, xi_nghiep:xi_nghiep_id ( ten )",
        )
        .in("du_an_id", allIds);
      if (qxErr) throw new Error(qxErr.message);

      for (const q of qdXns ?? []) {
        if (q.phan_he && q.phan_he !== phanHe) continue;
        const giaoAId = duAnToGiaoA.get(q.du_an_id as string);
        if (!giaoAId) continue;
        let bucket = qdsByGiaoA.get(giaoAId);
        if (!bucket) {
          bucket = [];
          qdsByGiaoA.set(giaoAId, bucket);
        }
        bucket.push({
          id: q.id as string,
          du_an_id: q.du_an_id as string,
          so_qd_du_thao: q.so_qd_du_thao as string | null,
          cong_trinh_chon: q.cong_trinh_chon,
          xi_nghiep_ten: oneXn(
            q.xi_nghiep as { ten: string } | { ten: string }[] | null,
          ),
        });
      }
    }

    const list: GiaoAListItem[] = [...byGiaoA.values()]
      .map(({ qd, duAnIds, duAns: daList }) => {
        const unique = [...new Set(duAnIds)];
        const phuLuc = phuLucByGiaoA.get(qd.id);
        const phuLucRows = parsePhuLucCongTrinh(phuLuc);
        const qds = qdsByGiaoA.get(qd.id) ?? [];
        const assignMap = ganCtKeysChoQdXn({
          phuLucRows,
          duAns: daList,
          qds,
        });
        const daGiaoKeys = new Set(assignMap.keys());
        const { tong_ct, da_giao_ct } = demCtPhuLuc({
          phuLuc,
          daGiaoKeys,
          fallbackTong: unique.length,
        });
        return {
          id: qd.id,
          so_qd: qd.so_qd,
          ngay_qd: qd.ngay_qd,
          trich_yeu: qd.trich_yeu,
          scanned_by_ho_ten: qd.scanned_by_ho_ten,
          storage_path: qd.storage_path,
          tong_ct,
          da_giao_ct,
          created_at: qd.created_at,
        };
      })
      .sort((a, b) => {
        const ta = a.created_at || "";
        const tb = b.created_at || "";
        return tb.localeCompare(ta);
      });

    return NextResponse.json({ ok: true, data: list });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi tải danh sách";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
