import { NextResponse } from "next/server";
import { parseGiaoAPdf } from "@/lib/scan-ai/parse-giao-a";
import { normalizeCapDienAp } from "@/lib/cap-dien-ap";
import { assignMaDuAnList, extractNamFromQd } from "@/lib/ma-du-an";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CapDienAp } from "@/lib/types";

export const runtime = "nodejs";

const BUCKET = "qd-giao-a";

/**
 * POST multipart `file` = PDF QĐ Giao A
 * Upload Storage → ScanAI → lưu qd_giao_a + du_an
 */
export async function POST(request: Request) {
  const supabase = createAdminClient();
  let qdId: string | null = null;

  try {
    const form = await request.formData();
    const file = form.get("file");

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
      .insert({ scan_status: "processing" })
      .select("id")
      .single();

    if (insertErr || !qdRow) {
      throw new Error(insertErr?.message ?? "Không tạo được hồ sơ Giao A");
    }
    qdId = qdRow.id as string;

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
      })
      .eq("id", qdId);

    const scanned = await parseGiaoAPdf(buf);

    const { error: updErr } = await supabase
      .from("qd_giao_a")
      .update({
        so_qd: scanned.so_qd ?? null,
        ngay_qd: scanned.ngay_qd ?? null,
        trich_yeu: scanned.trich_yeu ?? null,
        scan_status: "done",
        scan_raw: scanned,
        scan_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", qdId);

    if (updErr) {
      throw new Error(updErr.message);
    }

    const nam = extractNamFromQd(scanned.so_qd, scanned.ngay_qd);

    const { data: existingMas } = await supabase
      .from("du_an")
      .select("ma_du_an")
      .not("ma_du_an", "is", null);
    const existingCodes = (existingMas ?? [])
      .map((r) => r.ma_du_an as string)
      .filter(Boolean);

    const prepared = assignMaDuAnList(
      (scanned.du_an ?? [])
        .filter((d) => d.ten_du_an?.trim())
        .map((d) => ({
          ma_du_an: d.ma_du_an ?? null,
          ten_du_an: d.ten_du_an.trim(),
          dia_diem: d.dia_diem ?? null,
          quy_mo: d.quy_mo ?? null,
          goi_cong_viec: d.goi_cong_viec ?? null,
          cap_dien_ap: normalizeCapDienAp(d.cap_dien_ap ?? null) as CapDienAp | null,
        })),
      nam,
      existingCodes,
    );

    const duAnRows = prepared.map((d) => ({
      qd_giao_a_id: qdId,
      ma_du_an: d.ma_du_an,
      ten_du_an: d.ten_du_an,
      dia_diem: d.dia_diem,
      quy_mo: d.quy_mo,
      goi_cong_viec: d.goi_cong_viec,
      cap_dien_ap: d.cap_dien_ap,
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

    return NextResponse.json({
      ok: true,
      data: { qd_giao_a_id: qdId, du_an: duAn, scan: scanned },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi ingest Giao A";

    if (qdId) {
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
