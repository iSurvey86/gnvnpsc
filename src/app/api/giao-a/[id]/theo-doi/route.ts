import { NextResponse } from "next/server";
import type {
  CongTrinhTheoDoi,
  GiaoATheoDoiPayload,
  QdXnTheoDoi,
} from "@/lib/giao-a-theo-doi";
import {
  demCtPhuLuc,
  parsePhuLucCongTrinh,
  rowKeyPhuLuc,
  tenKeysTuCongTrinhChon,
} from "@/lib/giao-a-ct-stats";
import { normalizeTenDuAn } from "@/lib/du-an-trung";
import { PHAN_HE } from "@/lib/phan-he";
import {
  AuthError,
  parsePhanHeParam,
  requireSession,
} from "@/lib/phan-he-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

function oneXn(
  v: { ten: string } | { ten: string }[] | null | undefined,
): string | null {
  if (!v) return null;
  const x = Array.isArray(v) ? v[0] : v;
  return x?.ten?.trim() || null;
}

/** GET chi tiết theo dõi Giao A theo phân hệ (?phan_he=) */
export async function GET(request: Request, ctx: Ctx) {
  try {
    await requireSession();
    const { id } = await ctx.params;
    const phanHe = parsePhanHeParam(
      new URL(request.url).searchParams.get("phan_he"),
    );
    const loai = PHAN_HE[phanHe].defaultLoaiGiao;
    const supabase = createAdminClient();

    const { data: qd, error: qdErr } = await supabase
      .from("qd_giao_a")
      .select(
        "id, so_qd, ngay_qd, trich_yeu, ten_pc_tinh, storage_path, scanned_by_ho_ten, phu_luc, created_at",
      )
      .eq("id", id)
      .maybeSingle();
    if (qdErr) throw new Error(qdErr.message);
    if (!qd) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy Giao A" },
        { status: 404 },
      );
    }

    const { data: duAns, error: daErr } = await supabase
      .from("du_an")
      .select(
        "id, ma_du_an, ten_du_an, dia_diem, cap_dien_ap, loai_hinh_du_an, created_at",
      )
      .eq("qd_giao_a_id", id)
      .eq("phan_he", phanHe)
      .eq("da_luu", true)
      .order("created_at", { ascending: true });
    if (daErr) throw new Error(daErr.message);

    const list = (duAns ?? []) as Array<{
      id: string;
      ma_du_an: string | null;
      ten_du_an: string;
      dia_diem: string | null;
      cap_dien_ap: string | null;
      loai_hinh_du_an: string | null;
    }>;
    const ids = list.map((d) => d.id);
    const duAnChuId = list[0]?.id ?? null;

    type AssignInfo = {
      qdId: string;
      ownerId: string;
      soQd: string | null;
      xn: string | null;
      trangThai: string | null;
      loai: string;
    };
    const assignedDa = new Map<string, AssignInfo>();
    const qdById = new Map<
      string,
      QdXnTheoDoi & { _ctKeys: Set<string> }
    >();

    if (ids.length) {
      const { data: qdXns, error: qxErr } = await supabase
        .from("qd_giao_xn")
        .select(
          `id, du_an_id, loai, phan_he, trang_thai, so_qd_du_thao, pdf_ky_storage_path, cong_trinh_chon,
           xi_nghiep:xi_nghiep_id ( ten )`,
        )
        .eq("loai", loai)
        .in("du_an_id", ids);
      if (qxErr) throw new Error(qxErr.message);

      for (const q of qdXns ?? []) {
        if (q.phan_he && q.phan_he !== phanHe) continue;
        const info: AssignInfo = {
          qdId: q.id as string,
          ownerId: q.du_an_id as string,
          soQd: q.so_qd_du_thao as string | null,
          xn: oneXn(
            q.xi_nghiep as { ten: string } | { ten: string }[] | null,
          ),
          trangThai: q.trang_thai as string,
          loai: q.loai as string,
        };
        assignedDa.set(q.du_an_id as string, info);

        const ctKeys = tenKeysTuCongTrinhChon(q.cong_trinh_chon);
        let bucket = qdById.get(q.id as string);
        if (!bucket) {
          bucket = {
            id: q.id as string,
            du_an_id: q.du_an_id as string,
            loai: q.loai as string,
            trang_thai: q.trang_thai as string,
            so_qd_du_thao: q.so_qd_du_thao as string | null,
            pdf_ky_storage_path: q.pdf_ky_storage_path as string | null,
            xi_nghiep_ten: info.xn,
            so_ct: ctKeys.size || 1,
            _ctKeys: ctKeys,
          };
          qdById.set(q.id as string, bucket);
        } else {
          for (const k of ctKeys) bucket._ctKeys.add(k);
          bucket.so_ct = bucket._ctKeys.size || bucket.so_ct;
        }
      }

      const { data: maps } = await supabase
        .from("qd_giao_xn_du_an")
        .select(
          `du_an_id,
           qd_giao_xn:qd_giao_xn_id (
             id, du_an_id, loai, phan_he, trang_thai, so_qd_du_thao, pdf_ky_storage_path,
             xi_nghiep:xi_nghiep_id ( ten )
           )`,
        )
        .in("du_an_id", ids);

      for (const m of maps ?? []) {
        const qRaw = m.qd_giao_xn as
          | {
              id: string;
              du_an_id: string;
              loai: string;
              phan_he?: string;
              trang_thai: string;
              so_qd_du_thao: string | null;
              pdf_ky_storage_path: string | null;
              xi_nghiep: { ten: string } | { ten: string }[] | null;
            }
          | {
              id: string;
              du_an_id: string;
              loai: string;
              phan_he?: string;
              trang_thai: string;
              so_qd_du_thao: string | null;
              pdf_ky_storage_path: string | null;
              xi_nghiep: { ten: string } | { ten: string }[] | null;
            }[]
          | null;
        const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
        if (!q) continue;
        if (q.phan_he && q.phan_he !== phanHe) continue;
        if (q.loai !== loai) continue;

        if (!assignedDa.has(m.du_an_id as string)) {
          assignedDa.set(m.du_an_id as string, {
            qdId: q.id,
            ownerId: q.du_an_id,
            soQd: q.so_qd_du_thao,
            xn: oneXn(q.xi_nghiep),
            trangThai: q.trang_thai,
            loai: q.loai,
          });
        }
      }
    }

    const phuLucRows = parsePhuLucCongTrinh(qd.phu_luc);
    const ctAssignMap = new Map<
      string,
      {
        qdId: string;
        ownerId: string;
        soQd: string | null;
        xn: string | null;
        trangThai: string | null;
      }
    >();

    if (ids.length) {
      const { data: qdXnsRaw } = await supabase
        .from("qd_giao_xn")
        .select(
          `id, du_an_id, loai, phan_he, trang_thai, so_qd_du_thao, cong_trinh_chon,
           xi_nghiep:xi_nghiep_id ( ten )`,
        )
        .eq("loai", loai)
        .in("du_an_id", ids);
      for (const q of qdXnsRaw ?? []) {
        if (q.phan_he && q.phan_he !== phanHe) continue;
        const keys = tenKeysTuCongTrinhChon(q.cong_trinh_chon);
        const info = {
          qdId: q.id as string,
          ownerId: q.du_an_id as string,
          soQd: q.so_qd_du_thao as string | null,
          xn: oneXn(
            q.xi_nghiep as { ten: string } | { ten: string }[] | null,
          ),
          trangThai: q.trang_thai as string,
        };
        for (const k of keys) ctAssignMap.set(k, info);
      }
    }

    const soDaCoDuThao = assignedDa.size;
    const dungFallbackDuThao =
      phuLucRows.length > 0 && ctAssignMap.size === 0 && soDaCoDuThao > 0;

    let cong_trinh: CongTrinhTheoDoi[];

    if (phuLucRows.length) {
      // Fallback dự thảo cũ: khớp tên DA → phụ lục; phần còn lại gán lần lượt
      const usedDa = new Set<string>();
      const rowAssign = new Map<
        number,
        {
          qdId: string;
          ownerId: string;
          soQd: string | null;
          xn: string | null;
          trangThai: string | null;
        }
      >();

      if (dungFallbackDuThao) {
        for (let i = 0; i < phuLucRows.length; i++) {
          const key = normalizeTenDuAn(phuLucRows[i]?.ct_ten);
          if (!key) continue;
          for (const d of list) {
            if (usedDa.has(d.id)) continue;
            if (!assignedDa.has(d.id)) continue;
            if (normalizeTenDuAn(d.ten_du_an) !== key) continue;
            const a = assignedDa.get(d.id)!;
            usedDa.add(d.id);
            rowAssign.set(i, {
              qdId: a.qdId,
              ownerId: a.ownerId,
              soQd: a.soQd,
              xn: a.xn,
              trangThai: a.trangThai,
            });
            break;
          }
        }
        for (const d of list) {
          if (usedDa.has(d.id) || !assignedDa.has(d.id)) continue;
          const emptyIdx = phuLucRows.findIndex((_, i) => !rowAssign.has(i));
          if (emptyIdx < 0) break;
          const a = assignedDa.get(d.id)!;
          usedDa.add(d.id);
          rowAssign.set(emptyIdx, {
            qdId: a.qdId,
            ownerId: a.ownerId,
            soQd: a.soQd,
            xn: a.xn,
            trangThai: a.trangThai,
          });
        }
      }

      cong_trinh = phuLucRows.map((row, i) => {
        const key = normalizeTenDuAn(row.ct_ten);
        const a = key ? ctAssignMap.get(key) : undefined;
        const fb = rowAssign.get(i);
        const hit = a ?? fb;
        return {
          row_key: rowKeyPhuLuc(row, i),
          du_an_id: hit?.ownerId ?? duAnChuId,
          ma_du_an: list[0]?.ma_du_an ?? null,
          ten_du_an: row.ct_ten?.trim() ?? "—",
          stt: row.stt ?? i + 1,
          dia_diem: list[0]?.dia_diem ?? null,
          cap_dien_ap: list[0]?.cap_dien_ap ?? null,
          loai_hinh_du_an: list[0]?.loai_hinh_du_an ?? null,
          da_giao: Boolean(hit),
          qd_giao_xn_id: hit?.qdId ?? null,
          so_qd_du_thao: hit?.soQd ?? null,
          xi_nghiep_ten: hit?.xn ?? null,
          trang_thai: hit?.trangThai ?? null,
          qd_owner_du_an_id: hit?.ownerId ?? duAnChuId,
        };
      });
    } else {
      cong_trinh = list.map((d) => {
        const a = assignedDa.get(d.id);
        return {
          row_key: d.id,
          du_an_id: d.id,
          ma_du_an: d.ma_du_an,
          ten_du_an: d.ten_du_an,
          dia_diem: d.dia_diem,
          cap_dien_ap: d.cap_dien_ap,
          loai_hinh_du_an: d.loai_hinh_du_an,
          da_giao: Boolean(a),
          qd_giao_xn_id: a?.qdId ?? null,
          so_qd_du_thao: a?.soQd ?? null,
          xi_nghiep_ten: a?.xn ?? null,
          trang_thai: a?.trangThai ?? null,
          qd_owner_du_an_id: a?.ownerId ?? null,
        };
      });
    }

    const qd_giao_xn: QdXnTheoDoi[] = [...qdById.values()].map((q) => ({
      id: q.id,
      du_an_id: q.du_an_id,
      loai: q.loai,
      trang_thai: q.trang_thai,
      so_qd_du_thao: q.so_qd_du_thao,
      pdf_ky_storage_path: q.pdf_ky_storage_path,
      xi_nghiep_ten: q.xi_nghiep_ten,
      so_ct: q._ctKeys.size || q.so_ct,
    }));

    const daGiaoKeys = new Set(ctAssignMap.keys());
    const { tong_ct, da_giao_ct } = demCtPhuLuc({
      phuLuc: qd.phu_luc,
      daGiaoKeys,
      fallbackTong: list.length || cong_trinh.length,
      fallbackDaGiao: soDaCoDuThao,
    });

    const chuaGiao = cong_trinh.find((c) => !c.da_giao);
    const payload: GiaoATheoDoiPayload = {
      qd: {
        id: qd.id as string,
        so_qd: qd.so_qd as string | null,
        ngay_qd: qd.ngay_qd as string | null,
        trich_yeu: qd.trich_yeu as string | null,
        ten_pc_tinh: (qd.ten_pc_tinh as string | null) ?? null,
        storage_path: qd.storage_path as string | null,
        scanned_by_ho_ten: (qd.scanned_by_ho_ten as string | null) ?? null,
        phu_luc: qd.phu_luc,
        created_at: qd.created_at as string,
      },
      phan_he: phanHe,
      cong_trinh,
      qd_giao_xn,
      tong_ct,
      da_giao_ct,
      du_an_chu_goi_y_id: duAnChuId ?? chuaGiao?.du_an_id ?? null,
    };

    return NextResponse.json({ ok: true, data: payload });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi tải theo dõi";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
