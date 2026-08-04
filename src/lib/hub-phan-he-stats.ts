import { createAdminClient } from "@/lib/supabase/admin";
import type { PhanHeCode } from "@/lib/phan-he";

export type HubPhanHeStats = {
  tong: number;
  daGiao: number;
  chuaGiao: number;
};

const EMPTY: HubPhanHeStats = { tong: 0, daGiao: 0, chuaGiao: 0 };

/**
 * Đếm dự án đã lưu theo phân hệ:
 * - đã giao nhiệm vụ = có QĐ giao XN (sở hữu hoặc được phủ qua map)
 * - chưa giao = chưa có QĐ nào
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
    .select("id, phan_he")
    .eq("da_luu", true);
  if (daErr) throw new Error(daErr.message);

  const rows = (duAns ?? []) as Array<{ id: string; phan_he: string }>;
  if (!rows.length) return out;

  const ids = rows.map((r) => r.id);

  const { data: owned } = await supabase
    .from("qd_giao_xn")
    .select("du_an_id")
    .in("du_an_id", ids);

  const assigned = new Set<string>();
  for (const r of owned ?? []) {
    if (r.du_an_id) assigned.add(r.du_an_id as string);
  }

  // Bảng map có thể chưa chạy SQL 019 — bỏ qua lỗi, vẫn đếm QĐ sở hữu
  const { data: mapped, error: mapErr } = await supabase
    .from("qd_giao_xn_du_an")
    .select("du_an_id")
    .in("du_an_id", ids);
  if (!mapErr) {
    for (const r of mapped ?? []) {
      if (r.du_an_id) assigned.add(r.du_an_id as string);
    }
  }

  for (const r of rows) {
    const code = r.phan_he as PhanHeCode;
    if (!(code in out)) continue;
    out[code].tong += 1;
    if (assigned.has(r.id)) out[code].daGiao += 1;
    else out[code].chuaGiao += 1;
  }

  return out;
}
