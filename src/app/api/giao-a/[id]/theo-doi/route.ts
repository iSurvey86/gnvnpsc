import { NextResponse } from "next/server";
import type {
  CongTrinhTheoDoi,
  GiaoATheoDoiPayload,
  QdXnTheoDoi,
} from "@/lib/giao-a-theo-doi";
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

    type AssignInfo = {
      qdId: string;
      ownerId: string;
      soQd: string | null;
      xn: string | null;
      trangThai: string | null;
      pdfKy: string | null;
      loai: string;
    };
    const assigned = new Map<string, AssignInfo>();
    const qdById = new Map<string, QdXnTheoDoi & { _ct: Set<string> }>();

    if (ids.length) {
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
        if (q.loai !== loai && phanHe !== "tvtk") {
          /* TVTK: loai = tvtk; TVGS/TN: match default */
        }
        if (q.loai !== loai) continue;

        const info: AssignInfo = {
          qdId: q.id,
          ownerId: q.du_an_id,
          soQd: q.so_qd_du_thao,
          xn: oneXn(q.xi_nghiep),
          trangThai: q.trang_thai,
          pdfKy: q.pdf_ky_storage_path,
          loai: q.loai,
        };
        assigned.set(m.du_an_id as string, info);

        let bucket = qdById.get(q.id);
        if (!bucket) {
          bucket = {
            id: q.id,
            du_an_id: q.du_an_id,
            loai: q.loai,
            trang_thai: q.trang_thai,
            so_qd_du_thao: q.so_qd_du_thao,
            pdf_ky_storage_path: q.pdf_ky_storage_path,
            xi_nghiep_ten: oneXn(q.xi_nghiep),
            so_ct: 0,
            _ct: new Set(),
          };
          qdById.set(q.id, bucket);
        }
        bucket._ct.add(m.du_an_id as string);
      }

      const { data: owned } = await supabase
        .from("qd_giao_xn")
        .select(
          `id, du_an_id, loai, phan_he, trang_thai, so_qd_du_thao, pdf_ky_storage_path,
           xi_nghiep:xi_nghiep_id ( ten )`,
        )
        .eq("loai", loai)
        .in("du_an_id", ids);

      for (const q of owned ?? []) {
        if (q.phan_he && q.phan_he !== phanHe) continue;
        if (!assigned.has(q.du_an_id as string)) {
          assigned.set(q.du_an_id as string, {
            qdId: q.id as string,
            ownerId: q.du_an_id as string,
            soQd: q.so_qd_du_thao as string | null,
            xn: oneXn(
              q.xi_nghiep as { ten: string } | { ten: string }[] | null,
            ),
            trangThai: q.trang_thai as string,
            pdfKy: q.pdf_ky_storage_path as string | null,
            loai: q.loai as string,
          });
        }
        let bucket = qdById.get(q.id as string);
        if (!bucket) {
          bucket = {
            id: q.id as string,
            du_an_id: q.du_an_id as string,
            loai: q.loai as string,
            trang_thai: q.trang_thai as string,
            so_qd_du_thao: q.so_qd_du_thao as string | null,
            pdf_ky_storage_path: q.pdf_ky_storage_path as string | null,
            xi_nghiep_ten: oneXn(
              q.xi_nghiep as { ten: string } | { ten: string }[] | null,
            ),
            so_ct: 0,
            _ct: new Set(),
          };
          qdById.set(q.id as string, bucket);
        }
        bucket._ct.add(q.du_an_id as string);
      }
    }

    const cong_trinh: CongTrinhTheoDoi[] = list.map((d) => {
      const a = assigned.get(d.id);
      return {
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

    const qd_giao_xn: QdXnTheoDoi[] = [...qdById.values()].map((q) => ({
      id: q.id,
      du_an_id: q.du_an_id,
      loai: q.loai,
      trang_thai: q.trang_thai,
      so_qd_du_thao: q.so_qd_du_thao,
      pdf_ky_storage_path: q.pdf_ky_storage_path,
      xi_nghiep_ten: q.xi_nghiep_ten,
      so_ct: q._ct.size || 1,
    }));

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
      tong_ct: cong_trinh.length,
      da_giao_ct: cong_trinh.filter((c) => c.da_giao).length,
      du_an_chu_goi_y_id: chuaGiao?.du_an_id ?? cong_trinh[0]?.du_an_id ?? null,
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
