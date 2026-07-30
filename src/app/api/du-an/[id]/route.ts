import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { normalizeDiaDiem } from "@/lib/dia-diem";
import { laDuAn110kv, resolveLoaiHinhDuAn } from "@/lib/loai-hinh-du-an";
import {
  AuthError,
  parsePhanHeParam,
  requireWritePhanHe,
} from "@/lib/phan-he-auth";
import { isPhanHeCode } from "@/lib/phan-he";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH cập nhật dự án sau khi review ScanAI */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as {
      ma_du_an?: string | null;
      ten_du_an?: string;
      dia_diem?: string | null;
      quy_mo?: string | null;
      goi_cong_viec?: string | null;
      ghi_chu?: string | null;
      cap_dien_ap?: string | null;
      loai_hinh_du_an?: string | null;
      huong_giao?: string | null;
      xi_nghiep_id?: string | null;
      qd_giao_a_id?: string | null;
      phan_he?: string | null;
    };

    const supabase = createAdminClient();
    const { data: current } = await supabase
      .from("du_an")
      .select(
        "id, phan_he, xi_nghiep_id, ten_du_an, ma_du_an, cap_dien_ap, loai_hinh_du_an",
      )
      .eq("id", id)
      .maybeSingle();
    if (!current) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy dự án" },
        { status: 404 },
      );
    }

    const phanHe = isPhanHeCode(current.phan_he)
      ? current.phan_he
      : parsePhanHeParam(body.phan_he);
    const { actor } = await requireWritePhanHe(phanHe);

    if (body.ten_du_an !== undefined && !body.ten_du_an.trim()) {
      return NextResponse.json(
        { ok: false, error: "Tên dự án không được trống" },
        { status: 400 },
      );
    }

    const capDienApMoi =
      body.cap_dien_ap !== undefined
        ? body.cap_dien_ap === "110kv" || body.cap_dien_ap === "trung_ha_ap"
          ? body.cap_dien_ap
          : null
        : (current.cap_dien_ap as string | null);

    // Dự án 110kV: loại hình do hệ thống đặt; trung hạ áp: người nhập bắt buộc chọn
    let loaiHinhPatch: string | null | undefined;
    if (laDuAn110kv(capDienApMoi)) {
      if (current.loai_hinh_du_an !== "110kv") loaiHinhPatch = "110kv";
    } else if (body.loai_hinh_du_an !== undefined) {
      const parsed = resolveLoaiHinhDuAn(capDienApMoi, body.loai_hinh_du_an);
      if (!parsed) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Dự án trung hạ áp phải chọn loại hình (CQT / SCMBA / DMS)",
          },
          { status: 400 },
        );
      }
      loaiHinhPatch = parsed;
    } else if (current.loai_hinh_du_an === "110kv") {
      // Đổi từ 110kV sang trung hạ áp mà chưa chọn lại
      return NextResponse.json(
        {
          ok: false,
          error: "Đổi sang trung hạ áp thì phải chọn loại hình (CQT / SCMBA / DMS)",
        },
        { status: 400 },
      );
    }

    const xiChanged =
      body.xi_nghiep_id !== undefined &&
      (body.xi_nghiep_id || null) !== (current.xi_nghiep_id || null);

    const { data, error } = await supabase
      .from("du_an")
      .update({
        ...(body.ma_du_an !== undefined ? { ma_du_an: body.ma_du_an } : {}),
        ...(body.ten_du_an !== undefined
          ? { ten_du_an: body.ten_du_an.trim() }
          : {}),
        ...(body.dia_diem !== undefined
          ? { dia_diem: normalizeDiaDiem(body.dia_diem) }
          : {}),
        ...(body.quy_mo !== undefined ? { quy_mo: body.quy_mo } : {}),
        ...(body.goi_cong_viec !== undefined
          ? { goi_cong_viec: body.goi_cong_viec }
          : {}),
        ...(body.ghi_chu !== undefined ? { ghi_chu: body.ghi_chu } : {}),
        ...(body.cap_dien_ap !== undefined
          ? { cap_dien_ap: capDienApMoi }
          : {}),
        ...(loaiHinhPatch !== undefined
          ? { loai_hinh_du_an: loaiHinhPatch }
          : {}),
        ...(body.huong_giao !== undefined
          ? {
              huong_giao:
                body.huong_giao === "tvtk" ||
                body.huong_giao === "tn" ||
                body.huong_giao === "tvtk_tn"
                  ? body.huong_giao
                  : null,
            }
          : {}),
        ...(body.xi_nghiep_id !== undefined
          ? { xi_nghiep_id: body.xi_nghiep_id || null }
          : {}),
        ...(body.qd_giao_a_id !== undefined
          ? { qd_giao_a_id: body.qd_giao_a_id }
          : {}),
        updated_by: actor.userId,
        updated_at: new Date().toISOString(),
        ...(xiChanged
          ? {
              assigned_by: actor.userId,
              assigned_at: new Date().toISOString(),
            }
          : {}),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await logHoatDong({
      phanHe: "DA",
      hanhDong: "UPDATE",
      chiTietNgan: `Sửa dự án ${data.ma_du_an || data.ten_du_an}${
        xiChanged ? " (đổi Xí nghiệp)" : ""
      }`,
      doiTuongId: id,
      duLieuDong: {
        phan_he: phanHe,
        xi_nghiep_id: data.xi_nghiep_id,
        xi_changed: xiChanged,
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
    const message = err instanceof Error ? err.message : "Lỗi cập nhật dự án";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** DELETE xóa dự án (chỉ khi chưa có QĐ giao XN) */
export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createAdminClient();

    const { data: current } = await supabase
      .from("du_an")
      .select("id, phan_he, ten_du_an, ma_du_an")
      .eq("id", id)
      .maybeSingle();
    if (!current) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy dự án" },
        { status: 404 },
      );
    }

    const phanHe = isPhanHeCode(current.phan_he)
      ? current.phan_he
      : "tvtk";
    const { actor } = await requireWritePhanHe(phanHe);

    const { count } = await supabase
      .from("qd_giao_xn")
      .select("id", { count: "exact", head: true })
      .eq("du_an_id", id);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Dự án đã có quyết định giao Xí nghiệp. Mở tên dự án → Giao nhiệm vụ → Mở soạn quyết định → Xóa dự thảo, rồi xóa lại dự án.",
        },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("du_an").delete().eq("id", id);
    if (error) throw new Error(error.message);

    await logHoatDong({
      phanHe: "DA",
      hanhDong: "DELETE",
      chiTietNgan: `Xóa dự án ${current.ma_du_an || current.ten_du_an}`,
      doiTuongId: id,
      duLieuDong: { phan_he: phanHe },
      email: actor.email,
      hoTen: actor.hoTen,
      authUserId: actor.userId,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Lỗi xóa dự án";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
