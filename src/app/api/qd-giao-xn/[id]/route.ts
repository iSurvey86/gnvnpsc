import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { isPhanHeCode, PHAN_HE } from "@/lib/phan-he";
import { AuthError, requireWritePhanHe } from "@/lib/phan-he-auth";
import {
  syncQdGiaoXnDuAnMap,
  tenCongTrinhTuPayload,
} from "@/lib/qd-giao-xn-map";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LoaiGiaoXn, PhuLucCongTrinh } from "@/lib/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("qd_giao_xn")
      .select(
        "*, du_an:du_an_id ( * ), xi_nghiep:xi_nghiep_id ( id, ten, ma ), qd_giao_xn_du_an ( du_an_id )",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy dự thảo" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as {
      so_qd_du_thao?: string | null;
      ngay_du_thao?: string | null;
      xi_nghiep_id?: string | null;
      pham_vi?: string | null;
      thoi_han?: string | null;
      can_cu?: string | null;
      loai?: LoaiGiaoXn;
      trang_thai?: "nhap" | "trinh_gd" | "da_ban_hanh";
      cong_trinh?: PhuLucCongTrinh[] | string[];
    };

    const supabase = createAdminClient();
    const { data: current, error: getErr } = await supabase
      .from("qd_giao_xn")
      .select(
        "id, loai, phan_he, so_qd_du_thao, du_an_id, du_an:du_an_id ( ma_du_an, ten_du_an )",
      )
      .eq("id", id)
      .maybeSingle();
    if (getErr) throw new Error(getErr.message);
    if (!current) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy dự thảo" },
        { status: 404 },
      );
    }

    const phanHe = isPhanHeCode(current.phan_he) ? current.phan_he : "tvtk";
    const { actor } = await requireWritePhanHe(phanHe);

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: actor.userId,
    };
    if (body.so_qd_du_thao !== undefined)
      patch.so_qd_du_thao = body.so_qd_du_thao;
    if (body.ngay_du_thao !== undefined) patch.ngay_du_thao = body.ngay_du_thao;
    if (body.xi_nghiep_id !== undefined) patch.xi_nghiep_id = body.xi_nghiep_id;
    if (body.pham_vi !== undefined) patch.pham_vi = body.pham_vi;
    if (body.thoi_han !== undefined) patch.thoi_han = body.thoi_han;
    if (body.can_cu !== undefined) patch.can_cu = body.can_cu;
    if (body.loai === "tvtk" || body.loai === "thi_nghiem" || body.loai === "tvgs")
      patch.loai = body.loai;
    if (
      body.trang_thai === "nhap" ||
      body.trang_thai === "trinh_gd" ||
      body.trang_thai === "da_ban_hanh"
    ) {
      patch.trang_thai = body.trang_thai;
    }
    if (body.cong_trinh !== undefined) {
      patch.cong_trinh_chon = body.cong_trinh;
    }

    const { data, error } = await supabase
      .from("qd_giao_xn")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    let mapResult = null;
    if (body.cong_trinh !== undefined) {
      mapResult = await syncQdGiaoXnDuAnMap(supabase, {
        qdGiaoXnId: id,
        tenCongTrinh: tenCongTrinhTuPayload(body.cong_trinh),
      });
    }

    const duAn = Array.isArray(current.du_an) ? current.du_an[0] : current.du_an;
    const soQd =
      (data.so_qd_du_thao as string | null)?.trim() ||
      current.so_qd_du_thao ||
      "(chưa có số)";
    const soDuAnMap = mapResult?.mapped_du_an_ids.length;
    await logHoatDong({
      phanHe: "GIAO_XN",
      hanhDong: "UPDATE",
      chiTietNgan: `Lưu dự thảo quyết định giao Xí nghiệp ${soQd} — dự án ${
        duAn?.ma_du_an || duAn?.ten_du_an || current.du_an_id
      }${soDuAnMap && soDuAnMap > 1 ? ` · gắn ${soDuAnMap} dự án` : ""}`,
      doiTuongId: id,
      duLieuDong: {
        phan_he: phanHe,
        phan_he_ten: PHAN_HE[phanHe].title,
        loai: data.loai,
        so_qd_du_thao: data.so_qd_du_thao,
        du_an_id: current.du_an_id,
        ma_du_an: duAn?.ma_du_an ?? null,
        ten_du_an: duAn?.ten_du_an ?? null,
        ...(soDuAnMap != null ? { so_du_an: soDuAnMap } : {}),
      },
      email: actor.email,
      hoTen: actor.hoTen,
      authUserId: actor.userId,
    });

    return NextResponse.json({ ok: true, data, map: mapResult });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi cập nhật";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

const TRANG_THAI_LABEL: Record<string, string> = {
  nhap: "Nháp",
  trinh_gd: "Đã trình Giám đốc",
  da_ban_hanh: "Đã ban hành",
};

/**
 * DELETE — xóa dự thảo QĐ giao Xí nghiệp.
 * Map qd_giao_xn_du_an tự xóa theo ON DELETE CASCADE.
 */
export async function DELETE(_request: Request, ctx: Ctx) {
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

    const trangThai = (current.trang_thai as string) || "nhap";
    if (trangThai !== "nhap" && !actor.isAdmin) {
      return NextResponse.json(
        {
          ok: false,
          error: `Quyết định đang ở trạng thái «${
            TRANG_THAI_LABEL[trangThai] ?? trangThai
          }» — hạ về Nháp trước khi xóa.`,
        },
        { status: 400 },
      );
    }

    if (current.pdf_ky_storage_path) {
      await supabase.storage
        .from("qd-giao-xn")
        .remove([current.pdf_ky_storage_path as string]);
    }

    const { error } = await supabase.from("qd_giao_xn").delete().eq("id", id);
    if (error) throw new Error(error.message);

    const duAn = Array.isArray(current.du_an) ? current.du_an[0] : current.du_an;
    await logHoatDong({
      phanHe: "GIAO_XN",
      hanhDong: "DELETE",
      chiTietNgan: `Xóa dự thảo quyết định giao Xí nghiệp ${
        current.so_qd_du_thao || "(chưa có số)"
      } — dự án ${duAn?.ma_du_an || duAn?.ten_du_an || current.du_an_id}`,
      doiTuongId: id,
      duLieuDong: {
        phan_he: phanHe,
        phan_he_ten: PHAN_HE[phanHe].title,
        loai: current.loai,
        trang_thai_truoc_khi_xoa: trangThai,
        so_qd_du_thao: current.so_qd_du_thao,
        du_an_id: current.du_an_id,
        ma_du_an: duAn?.ma_du_an ?? null,
        ten_du_an: duAn?.ten_du_an ?? null,
      },
      email: actor.email,
      hoTen: actor.hoTen,
      authUserId: actor.userId,
    });

    return NextResponse.json({
      ok: true,
      data: { id, du_an_id: current.du_an_id },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi xóa quyết định";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
