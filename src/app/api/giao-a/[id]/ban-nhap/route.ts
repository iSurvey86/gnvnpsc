import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { isLoaiHinhDuAn, laDuAn110kv } from "@/lib/loai-hinh-du-an";
import { PHAN_HE } from "@/lib/phan-he";
import {
  AuthError,
  parsePhanHeParam,
  requireWritePhanHe,
} from "@/lib/phan-he-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BUCKET = "qd-giao-a";

type Ctx = { params: Promise<{ id: string }> };

async function readPhanHe(request: Request) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("phan_he");
  if (fromQuery) return parsePhanHeParam(fromQuery);
  try {
    const body = (await request.json()) as { phan_he?: string | null };
    return parsePhanHeParam(body?.phan_he);
  } catch {
    return parsePhanHeParam(null);
  }
}

/**
 * POST — xác nhận lưu bản nháp: hồ sơ Giao A + danh mục dự án của phân hệ
 * chuyển thành dữ liệu chính thức.
 */
export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const phanHe = await readPhanHe(request);
    const { actor } = await requireWritePhanHe(phanHe);

    const supabase = createAdminClient();
    const { data: qd, error: qdErr } = await supabase
      .from("qd_giao_a")
      .select("id, so_qd, da_luu")
      .eq("id", id)
      .maybeSingle();
    if (qdErr || !qd) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy hồ sơ Giao A" },
        { status: 404 },
      );
    }

    const now = new Date().toISOString();

    const { data: banNhap, error: checkErr } = await supabase
      .from("du_an")
      .select("id, ten_du_an, cap_dien_ap, loai_hinh_du_an")
      .eq("qd_giao_a_id", id)
      .eq("phan_he", phanHe)
      .eq("da_luu", false);
    if (checkErr) throw new Error(checkErr.message);

    // Dự án 110kV: hệ thống tự đặt loại hình
    const can110 = (banNhap ?? []).filter(
      (d) => laDuAn110kv(d.cap_dien_ap) && d.loai_hinh_du_an !== "110kv",
    );
    if (can110.length > 0) {
      const { error: fixErr } = await supabase
        .from("du_an")
        .update({ loai_hinh_du_an: "110kv" })
        .in(
          "id",
          can110.map((d) => d.id),
        );
      if (fixErr) throw new Error(fixErr.message);
    }

    // Trung hạ áp: người nhập phải chọn XDM / Cải tạo / SCMBA / DMS
    const thieuLoai = (banNhap ?? []).filter(
      (d) => !laDuAn110kv(d.cap_dien_ap) && !isLoaiHinhDuAn(d.loai_hinh_du_an),
    );
    if (thieuLoai.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Còn ${thieuLoai.length} dự án trung hạ áp chưa chọn loại hình (XDM / Cải tạo / SCMBA / DMS)`,
        },
        { status: 400 },
      );
    }

    const { data: duAn, error: daErr } = await supabase
      .from("du_an")
      .update({ da_luu: true, updated_at: now, updated_by: actor.userId })
      .eq("qd_giao_a_id", id)
      .eq("phan_he", phanHe)
      .eq("da_luu", false)
      .select("id");
    if (daErr) throw new Error(daErr.message);

    if (!qd.da_luu) {
      const { error: upErr } = await supabase
        .from("qd_giao_a")
        .update({ da_luu: true, updated_at: now, updated_by: actor.userId })
        .eq("id", id);
      if (upErr) throw new Error(upErr.message);
    }

    const soLuong = duAn?.length ?? 0;
    await logHoatDong({
      phanHe: "GIAO_A",
      hanhDong: "UPDATE",
      chiTietNgan: `Xác nhận lưu Giao A ${qd.so_qd || id} cho tổ ${PHAN_HE[phanHe].title} — ${soLuong} dự án`,
      doiTuongId: id,
      duLieuDong: {
        phan_he: phanHe,
        so_qd: qd.so_qd,
        du_an_da_luu: soLuong,
        da_luu: true,
      },
      email: actor.email,
      hoTen: actor.hoTen,
      authUserId: actor.userId,
    });

    return NextResponse.json({
      ok: true,
      data: { qd_giao_a_id: id, phan_he: phanHe, du_an_da_luu: soLuong },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi xác nhận lưu";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE — hủy bản nháp: xóa dòng dự án chưa lưu của phân hệ. Nếu hồ sơ Giao A
 * cũng chưa lưu và không còn dự án nào thì xóa cả hồ sơ + file PDF.
 */
export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const phanHe = await readPhanHe(request);
    const { actor } = await requireWritePhanHe(phanHe);

    const supabase = createAdminClient();
    const { data: qd, error: qdErr } = await supabase
      .from("qd_giao_a")
      .select("id, so_qd, da_luu, storage_path")
      .eq("id", id)
      .maybeSingle();
    if (qdErr || !qd) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy hồ sơ Giao A" },
        { status: 404 },
      );
    }

    const { data: xoa, error: delErr } = await supabase
      .from("du_an")
      .delete()
      .eq("qd_giao_a_id", id)
      .eq("phan_he", phanHe)
      .eq("da_luu", false)
      .select("id");
    if (delErr) throw new Error(delErr.message);

    let xoaHoSo = false;
    if (!qd.da_luu) {
      const { count } = await supabase
        .from("du_an")
        .select("id", { count: "exact", head: true })
        .eq("qd_giao_a_id", id);
      if ((count ?? 0) === 0) {
        if (qd.storage_path) {
          await supabase.storage
            .from(BUCKET)
            .remove([qd.storage_path as string]);
        }
        const { error: dropErr } = await supabase
          .from("qd_giao_a")
          .delete()
          .eq("id", id);
        if (dropErr) throw new Error(dropErr.message);
        xoaHoSo = true;
      }
    }

    const soLuong = xoa?.length ?? 0;
    await logHoatDong({
      phanHe: "GIAO_A",
      hanhDong: "DELETE",
      chiTietNgan: `Hủy bản quét Giao A ${qd.so_qd || id} của tổ ${PHAN_HE[phanHe].title} — bỏ ${soLuong} dự án nháp`,
      doiTuongId: id,
      duLieuDong: {
        phan_he: phanHe,
        so_qd: qd.so_qd,
        du_an_da_bo: soLuong,
        xoa_ho_so_giao_a: xoaHoSo,
      },
      email: actor.email,
      hoTen: actor.hoTen,
      authUserId: actor.userId,
    });

    return NextResponse.json({
      ok: true,
      data: {
        qd_giao_a_id: id,
        phan_he: phanHe,
        du_an_da_bo: soLuong,
        xoa_ho_so_giao_a: xoaHoSo,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi hủy bản nháp";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
