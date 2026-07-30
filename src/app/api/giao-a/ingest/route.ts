import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { normalizeCapDienAp } from "@/lib/cap-dien-ap";
import { normalizeTenDuAn } from "@/lib/du-an-trung";
import { assignMaDuAnList, extractNamFromQd } from "@/lib/ma-du-an";
import {
  AuthError,
  parsePhanHeParam,
  requireWritePhanHe,
} from "@/lib/phan-he-auth";
import type { PhanHeCode } from "@/lib/phan-he";
import { PHAN_HE } from "@/lib/phan-he";
import { parseGiaoAPdf } from "@/lib/scan-ai/parse-giao-a";
import { resolveDiaDiem } from "@/lib/soan-qd-defaults";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CapDienAp } from "@/lib/types";

export const runtime = "nodejs";

const BUCKET = "qd-giao-a";

type ExistingQd = {
  id: string;
  so_qd: string | null;
  ngay_qd: string | null;
  trich_yeu: string | null;
  scanned_by_ho_ten: string | null;
  scanned_by_email: string | null;
  created_at: string;
};

async function countDuAnByPhanHe(
  supabase: ReturnType<typeof createAdminClient>,
  qdId: string,
) {
  const { data } = await supabase
    .from("du_an")
    .select("phan_he")
    .eq("qd_giao_a_id", qdId);
  const map: Record<string, number> = {
    tvtk: 0,
    thi_nghiem: 0,
    tvgs: 0,
  };
  for (const r of data ?? []) {
    const ph = r.phan_he as string;
    if (ph in map) map[ph] += 1;
  }
  return map;
}

async function insertDuAnForPhanHe(opts: {
  supabase: ReturnType<typeof createAdminClient>;
  qdId: string;
  phanHe: PhanHeCode;
  actorUserId: string;
  scanned: {
    so_qd?: string | null;
    ngay_qd?: string | null;
    ten_pc_tinh?: string | null;
    du_an?: Array<{
      ma_du_an?: string | null;
      ten_du_an: string;
      dia_diem?: string | null;
      quy_mo?: string | null;
      goi_cong_viec?: string | null;
      cap_dien_ap?: string | null;
    }>;
  };
}) {
  const { supabase, qdId, phanHe, actorUserId, scanned } = opts;
  const nam = extractNamFromQd(scanned.so_qd, scanned.ngay_qd);

  const { data: existingMas } = await supabase
    .from("du_an")
    .select("ma_du_an")
    .eq("phan_he", phanHe)
    .not("ma_du_an", "is", null);
  const existingCodes = (existingMas ?? [])
    .map((r) => r.ma_du_an as string)
    .filter(Boolean);

  const prepared = assignMaDuAnList(
    (scanned.du_an ?? [])
      .filter((d) => d.ten_du_an?.trim())
      .map((d) => ({
        ma_du_an: null as string | null,
        ten_du_an: d.ten_du_an.trim(),
        dia_diem: resolveDiaDiem(d.dia_diem, {
          tenDuAn: d.ten_du_an,
          tenPcTinh: scanned.ten_pc_tinh,
        }),
        quy_mo: d.quy_mo ?? null,
        goi_cong_viec: d.goi_cong_viec ?? null,
        cap_dien_ap: normalizeCapDienAp(
          d.cap_dien_ap ?? null,
        ) as CapDienAp | null,
        phan_he: phanHe,
      })),
    nam,
    existingCodes,
    phanHe,
  );

  const duAnRows = prepared.map((d) => ({
    qd_giao_a_id: qdId,
    ma_du_an: d.ma_du_an,
    ten_du_an: d.ten_du_an,
    dia_diem: d.dia_diem,
    quy_mo: d.quy_mo,
    goi_cong_viec: d.goi_cong_viec,
    cap_dien_ap: d.cap_dien_ap,
    phan_he: phanHe,
    created_by: actorUserId,
    updated_by: actorUserId,
  }));

  let duAn: unknown[] = [];
  if (duAnRows.length) {
    const { data, error } = await supabase
      .from("du_an")
      .insert(duAnRows)
      .select("*");
    if (error) throw new Error(error.message);
    duAn = data ?? [];
  }
  return duAn;
}

/**
 * POST multipart:
 * - file = PDF QĐ Giao A
 * - phan_he = tvtk | thi_nghiem | tvgs
 * - pair_qd_giao_a_id = (optional) dùng hồ sơ Giao A đã có → chỉ tạo DA cho phân hệ
 * - force_new = 1 (optional, admin) bỏ qua pair
 */
export async function POST(request: Request) {
  const supabase = createAdminClient();
  let qdId: string | null = null;
  let createdNewQd = false;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const phanHe = parsePhanHeParam(String(form.get("phan_he") || "tvtk"));
    const pairQdId = String(form.get("pair_qd_giao_a_id") || "").trim() || null;
    const forceNew = String(form.get("force_new") || "") === "1";

    const { actor } = await requireWritePhanHe(phanHe);

    if (!(file instanceof File) && !pairQdId) {
      return NextResponse.json(
        { ok: false, error: "Thiếu file PDF (field: file)" },
        { status: 400 },
      );
    }

    // ---- Pair: dùng hồ sơ Giao A đã có, tạo DA cho phân hệ hiện tại ----
    if (pairQdId) {
      const { data: existing, error: exErr } = await supabase
        .from("qd_giao_a")
        .select(
          "id, so_qd, ngay_qd, trich_yeu, scan_raw, ten_pc_tinh, phu_luc, scanned_by_ho_ten, scanned_by_email, created_at",
        )
        .eq("id", pairQdId)
        .maybeSingle();
      if (exErr || !existing) {
        return NextResponse.json(
          { ok: false, error: "Không tìm thấy hồ sơ Giao A để pair" },
          { status: 404 },
        );
      }

      const { count } = await supabase
        .from("du_an")
        .select("id", { count: "exact", head: true })
        .eq("qd_giao_a_id", pairQdId)
        .eq("phan_he", phanHe);
      if ((count ?? 0) > 0) {
        return NextResponse.json(
          {
            ok: false,
            error: `Phân hệ ${PHAN_HE[phanHe].short} đã có danh mục dự án từ Giao A này.`,
            data: { qd_giao_a_id: pairQdId },
          },
          { status: 409 },
        );
      }

      const raw = (existing.scan_raw ?? {}) as {
        so_qd?: string | null;
        ngay_qd?: string | null;
        ten_pc_tinh?: string | null;
        du_an?: Array<{
          ma_du_an?: string | null;
          ten_du_an: string;
          dia_diem?: string | null;
          quy_mo?: string | null;
          goi_cong_viec?: string | null;
          cap_dien_ap?: string | null;
        }>;
      };

      const scanned = {
        so_qd: existing.so_qd ?? raw.so_qd,
        ngay_qd: existing.ngay_qd ?? raw.ngay_qd,
        ten_pc_tinh: existing.ten_pc_tinh ?? raw.ten_pc_tinh,
        du_an: raw.du_an ?? [],
      };

      // Nếu scan_raw thiếu danh mục — lấy từ DA phân hệ khác làm mẫu tên
      if (!scanned.du_an?.length) {
        const { data: other } = await supabase
          .from("du_an")
          .select("ten_du_an, dia_diem, quy_mo, goi_cong_viec, cap_dien_ap")
          .eq("qd_giao_a_id", pairQdId)
          .limit(200);
        scanned.du_an = (other ?? []).map((d) => ({
          ten_du_an: d.ten_du_an as string,
          dia_diem: d.dia_diem as string | null,
          quy_mo: d.quy_mo as string | null,
          goi_cong_viec: d.goi_cong_viec as string | null,
          cap_dien_ap: d.cap_dien_ap as string | null,
        }));
      }

      const duAn = await insertDuAnForPhanHe({
        supabase,
        qdId: pairQdId,
        phanHe,
        actorUserId: actor.userId,
        scanned,
      });

      await logHoatDong({
        phanHe: "GIAO_A",
        hanhDong: "CREATE",
        chiTietNgan: `Pair Giao A ${existing.so_qd || pairQdId} → ${PHAN_HE[phanHe].short} (${duAn.length} DA)`,
        doiTuongId: pairQdId,
        duLieuDong: {
          phan_he: phanHe,
          pair: true,
          du_an_count: duAn.length,
        },
        email: actor.email,
        hoTen: actor.hoTen,
        authUserId: actor.userId,
      });

      return NextResponse.json({
        ok: true,
        data: {
          qd_giao_a_id: pairQdId,
          paired: true,
          phan_he: phanHe,
          du_an: duAn,
        },
      });
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Thiếu file PDF (field: file)" },
        { status: 400 },
      );
    }
    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { ok: false, error: "Chỉ nhận application/pdf" },
        { status: 400 },
      );
    }

    const { data: qdRow, error: insertErr } = await supabase
      .from("qd_giao_a")
      .insert({
        scan_status: "processing",
        created_by: actor.userId,
        updated_by: actor.userId,
        scanned_by: actor.userId,
        scanned_by_email: actor.email,
        scanned_by_ho_ten: actor.hoTen,
      })
      .select("id")
      .single();

    if (insertErr || !qdRow) {
      throw new Error(insertErr?.message ?? "Không tạo được hồ sơ Giao A");
    }
    qdId = qdRow.id as string;
    createdNewQd = true;

    const storagePath = `${qdId}/original.pdf`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) {
      throw new Error(`Upload Storage thất bại: ${upErr.message}`);
    }

    await supabase
      .from("qd_giao_a")
      .update({
        storage_path: storagePath,
        updated_at: new Date().toISOString(),
        updated_by: actor.userId,
      })
      .eq("id", qdId);

    const scanned = await parseGiaoAPdf(buf);
    const soQd = scanned.so_qd?.trim() || null;

    // ---- Phát hiện pair theo số QĐ ----
    if (soQd && !forceNew) {
      // limit(1) thay maybeSingle: dữ liệu cũ có thể còn nhiều hồ sơ trùng số QĐ
      const { data: existedRows } = await supabase
        .from("qd_giao_a")
        .select(
          "id, so_qd, ngay_qd, trich_yeu, scanned_by_ho_ten, scanned_by_email, created_at",
        )
        .eq("so_qd", soQd)
        .neq("id", qdId)
        .order("created_at", { ascending: true })
        .limit(1);
      const existed = existedRows?.[0] ?? null;

      if (existed) {
        const pairCounts = await countDuAnByPhanHe(supabase, existed.id);
        // Xóa hồ sơ tạm + file vừa upload
        await supabase.storage.from(BUCKET).remove([storagePath]);
        await supabase.from("qd_giao_a").delete().eq("id", qdId);
        createdNewQd = false;
        qdId = null;

        await logHoatDong({
          phanHe: "GIAO_A",
          hanhDong: "SCAN",
          chiTietNgan: `Phát hiện pair Giao A ${soQd} — đã có hồ sơ`,
          doiTuongId: existed.id,
          duLieuDong: {
            phan_he: phanHe,
            needs_pair: true,
            pair_counts: pairCounts,
          },
          trangThai: "Thành công",
          email: actor.email,
          hoTen: actor.hoTen,
          authUserId: actor.userId,
        });

        return NextResponse.json({
          ok: true,
          data: {
            needs_pair: true,
            phan_he: phanHe,
            scanned_so_qd: soQd,
            existing: existed as ExistingQd,
            pair_counts: pairCounts,
            already_has_phan_he: (pairCounts[phanHe] ?? 0) > 0,
          },
        });
      }
    }

    const { error: updErr } = await supabase
      .from("qd_giao_a")
      .update({
        so_qd: soQd,
        ngay_qd: scanned.ngay_qd ?? null,
        trich_yeu: scanned.trich_yeu ?? null,
        ten_pc_tinh: scanned.ten_pc_tinh ?? null,
        phu_luc: scanned.phu_luc ?? null,
        scan_status: "done",
        scan_raw: scanned,
        scan_error: null,
        updated_at: new Date().toISOString(),
        updated_by: actor.userId,
      })
      .eq("id", qdId);

    if (updErr) {
      // Unique so_qd race
      if (updErr.message?.toLowerCase().includes("unique") && soQd) {
        const { data: racedRows } = await supabase
          .from("qd_giao_a")
          .select(
            "id, so_qd, ngay_qd, trich_yeu, scanned_by_ho_ten, scanned_by_email, created_at",
          )
          .eq("so_qd", soQd)
          .neq("id", qdId)
          .order("created_at", { ascending: true })
          .limit(1);
        const raced = racedRows?.[0] ?? null;
        if (raced && qdId) {
          await supabase.storage.from(BUCKET).remove([storagePath]);
          await supabase.from("qd_giao_a").delete().eq("id", qdId);
          const pairCounts = await countDuAnByPhanHe(supabase, raced.id);
          return NextResponse.json({
            ok: true,
            data: {
              needs_pair: true,
              phan_he: phanHe,
              scanned_so_qd: soQd,
              existing: raced as ExistingQd,
              pair_counts: pairCounts,
              already_has_phan_he: (pairCounts[phanHe] ?? 0) > 0,
            },
          });
        }
      }
      throw new Error(updErr.message);
    }

    const warnings: string[] = [];
    const { data: existingDuAn } = await supabase
      .from("du_an")
      .select("id, ten_du_an, ma_du_an, phan_he")
      .eq("phan_he", phanHe)
      .limit(2000);

    const existingByTen = new Map<string, { ten_du_an: string }>();
    for (const r of existingDuAn ?? []) {
      const key = normalizeTenDuAn(r.ten_du_an as string);
      if (key && !existingByTen.has(key)) {
        existingByTen.set(key, { ten_du_an: r.ten_du_an as string });
      }
    }

    const preparedNames = (scanned.du_an ?? [])
      .filter((d) => d.ten_du_an?.trim())
      .map((d) => d.ten_du_an.trim());
    const tenTrung = preparedNames.filter((t) =>
      existingByTen.has(normalizeTenDuAn(t)),
    );
    if (tenTrung.length) {
      warnings.push(
        `${tenTrung.length} dự án trùng tên trong phân hệ ${PHAN_HE[phanHe].short}` +
          (tenTrung[0] ? `: ${tenTrung.slice(0, 2).join("; ")}` : ""),
      );
    }

    const duAn = await insertDuAnForPhanHe({
      supabase,
      qdId: qdId!,
      phanHe,
      actorUserId: actor.userId,
      scanned,
    });

    await logHoatDong({
      phanHe: "GIAO_A",
      hanhDong: "SCAN",
      chiTietNgan: `Quét Giao A ${soQd || qdId} → ${PHAN_HE[phanHe].short} (${duAn.length} DA)`,
      doiTuongId: qdId,
      duLieuDong: {
        phan_he: phanHe,
        so_qd: soQd,
        du_an_count: duAn.length,
      },
      email: actor.email,
      hoTen: actor.hoTen,
      authUserId: actor.userId,
    });

    return NextResponse.json({
      ok: true,
      data: {
        qd_giao_a_id: qdId,
        phan_he: phanHe,
        du_an: duAn,
        scan: scanned,
        warnings,
        trung_ten_count: tenTrung.length,
        paired: false,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi ingest Giao A";

    if (qdId && createdNewQd) {
      await supabase
        .from("qd_giao_a")
        .update({
          scan_status: "error",
          scan_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", qdId);
    }

    return NextResponse.json(
      { ok: false, error: message, qd_giao_a_id: qdId },
      { status: 500 },
    );
  }
}
