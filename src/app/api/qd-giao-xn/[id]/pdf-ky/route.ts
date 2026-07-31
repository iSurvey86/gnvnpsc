import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { isPhanHeCode, PHAN_HE } from "@/lib/phan-he";
import { AuthError, requireSession, requireWritePhanHe } from "@/lib/phan-he-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "qd-giao-xn";

type Ctx = { params: Promise<{ id: string }> };

/** GET — xem PDF quyết định đã ký */
export async function GET(_request: Request, ctx: Ctx) {
  try {
    await requireSession();
    const { id } = await ctx.params;
    const supabase = createAdminClient();

    const { data: qd, error } = await supabase
      .from("qd_giao_xn")
      .select("id, so_qd_du_thao, pdf_ky_storage_path")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!qd?.pdf_ky_storage_path) {
      return NextResponse.json(
        { ok: false, error: "Chưa có PDF quyết định đã ký" },
        { status: 404 },
      );
    }

    const { data: file, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(qd.pdf_ky_storage_path);

    if (dlErr || !file) {
      throw new Error(dlErr?.message ?? "Không tải được PDF đã ký");
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const safeName = (qd.so_qd_du_thao || id)
      .toString()
      .replace(/[^\w.-]+/g, "_")
      .slice(0, 80);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="QD-ky-${safeName}.pdf"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi xem PDF đã ký";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * POST multipart field `file` = PDF đã ký
 * → lưu Storage, cập nhật pdf_ky_*, trang_thai = da_ban_hanh (Đã giao)
 */
export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createAdminClient();

    const { data: current, error: getErr } = await supabase
      .from("qd_giao_xn")
      .select(
        "id, loai, phan_he, trang_thai, so_qd_du_thao, du_an_id, pdf_ky_storage_path, du_an:du_an_id ( ma_du_an, ten_du_an )",
      )
      .eq("id", id)
      .maybeSingle();
    if (getErr) throw new Error(getErr.message);
    if (!current) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy quyết định" },
        { status: 404 },
      );
    }

    const phanHe = isPhanHeCode(current.phan_he) ? current.phan_he : "tvtk";
    const { actor } = await requireWritePhanHe(phanHe);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Thiếu tệp PDF (field: file)" },
        { status: 400 },
      );
    }
    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { ok: false, error: "Chỉ nhận tệp PDF đã ký" },
        { status: 400 },
      );
    }
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Tệp PDF quá lớn (tối đa 25 MB)" },
        { status: 400 },
      );
    }

    const storagePath = `${id}/ky.pdf`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) {
      throw new Error(
        `Upload Storage thất bại: ${upErr.message}. Kiểm tra đã tạo bucket «qd-giao-xn» chưa.`,
      );
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("qd_giao_xn")
      .update({
        pdf_ky_storage_path: storagePath,
        pdf_ky_at: now,
        pdf_ky_by: actor.userId,
        trang_thai: "da_ban_hanh",
        updated_at: now,
        updated_by: actor.userId,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const duAn = Array.isArray(current.du_an) ? current.du_an[0] : current.du_an;
    await logHoatDong({
      phanHe: "GIAO_XN",
      hanhDong: "UPDATE",
      chiTietNgan: `Tải PDF đã ký — quyết định ${
        current.so_qd_du_thao || "(chưa có số)"
      } → Đã giao · dự án ${duAn?.ma_du_an || duAn?.ten_du_an || current.du_an_id}`,
      doiTuongId: id,
      duLieuDong: {
        phan_he: phanHe,
        phan_he_ten: PHAN_HE[phanHe].title,
        loai: current.loai,
        so_qd_du_thao: current.so_qd_du_thao,
        trang_thai: "da_ban_hanh",
        pdf_ky: true,
        ten_tep: file.name,
      },
      email: actor.email,
      hoTen: actor.hoTen,
      authUserId: actor.userId,
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message =
      err instanceof Error ? err.message : "Lỗi tải PDF quyết định đã ký";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
