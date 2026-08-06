import { NextResponse } from "next/server";
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
        `id, qd_giao_a_id,
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
      qd_giao_a_id: string;
      qd_giao_a: QdRef | QdRef[] | null;
    }>;

    const byGiaoA = new Map<
      string,
      { qd: QdRef; duAnIds: string[] }
    >();

    for (const r of rows) {
      const qdRaw = r.qd_giao_a;
      const qd = Array.isArray(qdRaw) ? qdRaw[0] : qdRaw;
      if (!qd?.id) continue;
      const cur = byGiaoA.get(qd.id);
      if (cur) {
        cur.duAnIds.push(r.id);
      } else {
        byGiaoA.set(qd.id, { qd, duAnIds: [r.id] });
      }
    }

    const allIds = rows.map((r) => r.id);
    const assigned = new Set<string>();

    if (allIds.length) {
      const { data: maps } = await supabase
        .from("qd_giao_xn_du_an")
        .select(
          `du_an_id, qd_giao_xn:qd_giao_xn_id ( id, phan_he, loai )`,
        )
        .in("du_an_id", allIds);

      for (const m of maps ?? []) {
        const qRaw = m.qd_giao_xn as
          | { id: string; phan_he?: string; loai?: string }
          | { id: string; phan_he?: string; loai?: string }[]
          | null;
        const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
        if (!q) continue;
        if (q.phan_he && q.phan_he !== phanHe) continue;
        assigned.add(m.du_an_id as string);
      }

      const { data: owned } = await supabase
        .from("qd_giao_xn")
        .select("du_an_id, phan_he")
        .in("du_an_id", allIds);
      for (const o of owned ?? []) {
        if (o.phan_he && o.phan_he !== phanHe) continue;
        assigned.add(o.du_an_id as string);
      }
    }

    const list: GiaoAListItem[] = [...byGiaoA.values()]
      .map(({ qd, duAnIds }) => {
        const unique = [...new Set(duAnIds)];
        let daGiao = 0;
        for (const id of unique) {
          if (assigned.has(id)) daGiao += 1;
        }
        return {
          id: qd.id,
          so_qd: qd.so_qd,
          ngay_qd: qd.ngay_qd,
          trich_yeu: qd.trich_yeu,
          scanned_by_ho_ten: qd.scanned_by_ho_ten,
          storage_path: qd.storage_path,
          tong_ct: unique.length,
          da_giao_ct: daGiao,
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
