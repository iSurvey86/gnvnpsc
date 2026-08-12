import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { PHAN_HE } from "@/lib/phan-he";
import { AuthError, requireWritePhanHe } from "@/lib/phan-he-auth";
import {
  syncQdGiaoXnDuAnMap,
  tenCongTrinhTuPayload,
} from "@/lib/qd-giao-xn-map";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LoaiGiaoXn, PhuLucCongTrinh } from "@/lib/types";

export const runtime = "nodejs";

/** GET danh sách QĐ giao XN */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("qd_giao_xn")
      .select(
        "*, du_an:du_an_id ( id, ten_du_an, ma_du_an ), xi_nghiep:xi_nghiep_id ( id, ten, ma )",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải QĐ giao XN";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** POST tạo dự thảo QĐ giao Xí nghiệp */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      du_an_id?: string;
      loai?: LoaiGiaoXn;
      so_qd_du_thao?: string | null;
      ngay_du_thao?: string | null;
      xi_nghiep_id?: string | null;
      xi_nghiep_ten?: string | null;
      pham_vi?: string | null;
      thoi_han?: string | null;
      can_cu?: string | null;
      trang_thai?: "nhap" | "trinh_gd";
      cong_trinh?: PhuLucCongTrinh[] | string[];
    };

    if (!body.du_an_id) {
      return NextResponse.json(
        { ok: false, error: "Thiếu dự án" },
        { status: 400 },
      );
    }
    if (
      body.loai !== "tvtk" &&
      body.loai !== "thi_nghiem" &&
      body.loai !== "tvgs"
    ) {
      return NextResponse.json(
        { ok: false, error: "Loại phải là tvtk, thi_nghiem hoặc tvgs" },
        { status: 400 },
      );
    }

    const phanHe =
      body.loai === "thi_nghiem"
        ? "thi_nghiem"
        : body.loai === "tvgs"
          ? "tvgs"
          : "tvtk";
    const { actor } = await requireWritePhanHe(phanHe);

    const supabase = createAdminClient();

    const { data: duAn, error: daErr } = await supabase
      .from("du_an")
      .select("id, ma_du_an, ten_du_an")
      .eq("id", body.du_an_id)
      .maybeSingle();
    if (daErr) throw new Error(daErr.message);
    if (!duAn) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy dự án" },
        { status: 404 },
      );
    }

    const { data: mapped } = await supabase
      .from("qd_giao_xn_du_an")
      .select("qd_giao_xn_id, qd_giao_xn:qd_giao_xn_id ( id, loai, du_an_id )")
      .eq("du_an_id", body.du_an_id);
    const conflict = (mapped ?? []).find((m) => {
      const q = Array.isArray(m.qd_giao_xn) ? m.qd_giao_xn[0] : m.qd_giao_xn;
      return q?.loai === body.loai;
    });
    // Giao tách phụ lục (còn CT): cho phép nhiều QĐ cùng dự án chủ
    const giaoTachPhuLuc =
      Array.isArray(body.cong_trinh) && body.cong_trinh.length > 0;
    if (conflict && !giaoTachPhuLuc) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Dự án / công trình này đã nằm trong một quyết định giao Xí nghiệp khác. Mở quyết định đó để xem hoặc sửa.",
          qd_giao_xn_id: conflict.qd_giao_xn_id,
        },
        { status: 409 },
      );
    }

    let xiNghiepId = body.xi_nghiep_id ?? null;

    if (!xiNghiepId && body.xi_nghiep_ten?.trim()) {
      const { data: xn, error: xnErr } = await supabase
        .from("xi_nghiep")
        .insert({
          ten: body.xi_nghiep_ten.trim(),
          phu_hop_tvtk: body.loai === "tvtk",
          phu_hop_thi_nghiem: body.loai === "thi_nghiem",
          phu_hop_tvgs: body.loai === "tvgs",
        })
        .select("id")
        .single();
      if (xnErr) throw new Error(xnErr.message);
      xiNghiepId = xn.id;
    }

    const { data, error } = await supabase
      .from("qd_giao_xn")
      .insert({
        du_an_id: body.du_an_id,
        loai: body.loai,
        phan_he: phanHe,
        so_qd_du_thao: body.so_qd_du_thao ?? null,
        ngay_du_thao: body.ngay_du_thao ?? null,
        xi_nghiep_id: xiNghiepId,
        pham_vi: body.pham_vi ?? null,
        thoi_han: body.thoi_han ?? null,
        can_cu: body.can_cu ?? null,
        trang_thai: body.trang_thai ?? "nhap",
        cong_trinh_chon:
          body.cong_trinh && body.cong_trinh.length ? body.cong_trinh : null,
        created_by: actor.userId,
        updated_by: actor.userId,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const mapResult = await syncQdGiaoXnDuAnMap(supabase, {
      qdGiaoXnId: data.id as string,
      tenCongTrinh: tenCongTrinhTuPayload(body.cong_trinh),
    });

    const soDuAnMap = mapResult.mapped_du_an_ids.length;
    await logHoatDong({
      phanHe: "GIAO_XN",
      hanhDong: "CREATE",
      chiTietNgan: `Tạo dự thảo quyết định giao Xí nghiệp ${
        body.so_qd_du_thao?.trim() || "(chưa có số)"
      } — dự án ${duAn.ma_du_an || duAn.ten_du_an}${
        soDuAnMap > 1 ? ` · gắn ${soDuAnMap} dự án` : ""
      }`,
      doiTuongId: data.id as string,
      duLieuDong: {
        phan_he: phanHe,
        phan_he_ten: PHAN_HE[phanHe].title,
        loai: body.loai,
        so_qd_du_thao: body.so_qd_du_thao ?? null,
        du_an_id: body.du_an_id,
        ma_du_an: duAn.ma_du_an,
        ten_du_an: duAn.ten_du_an,
        so_du_an: soDuAnMap,
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
    const message = err instanceof Error ? err.message : "Lỗi tạo QĐ giao XN";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
