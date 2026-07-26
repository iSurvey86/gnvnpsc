import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CapDienAp, DuAn, LoaiGiaoXn, QdGiaoA, XiNghiep } from "@/lib/types";
import {
  buildWordTagData,
  renderQdGiaoXnDocx,
  type QdGiaoXnExportInput,
} from "@/lib/word/fill-qd-giao-xn";
import { resolveQdGiaoXnTemplateFile } from "@/lib/word/template-path";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

type ExportBody = Partial<{
  ten_pc_tinh: string | null;
  ten_tinh: string | null;
  nam_ke_hoach: string | null;
  so_qd_thanh_lap_xn: string | null;
  ngay_qd_thanh_lap_xn: string | null;
  so_qd_tam_giao_khv: string | null;
  ngay_qd_tam_giao_khv: string | null;
  ten_goi_thau: string | null;
  so_tien_tam_ung: string | null;
  so_tien_tam_ung_chu: string | null;
  so_luong_cong_trinh: string | null;
  ghi_chu_bo_sung: string | null;
}>;

async function exportWord(id: string, extras: ExportBody = {}) {
  const supabase = createAdminClient();

  const { data: draft, error } = await supabase
    .from("qd_giao_xn")
    .select("*, xi_nghiep:xi_nghiep_id ( id, ten, ma )")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!draft) {
    return NextResponse.json(
      { ok: false, error: "Không tìm thấy dự thảo" },
      { status: 404 },
    );
  }

  const { data: duAn, error: daErr } = await supabase
    .from("du_an")
    .select("*")
    .eq("id", draft.du_an_id)
    .maybeSingle();
  if (daErr) throw new Error(daErr.message);
  if (!duAn) {
    return NextResponse.json(
      { ok: false, error: "Không tìm thấy dự án" },
      { status: 404 },
    );
  }

  let qdGiaoA: QdGiaoA | null = null;
  if (duAn.qd_giao_a_id) {
    const { data } = await supabase
      .from("qd_giao_a")
      .select("*")
      .eq("id", duAn.qd_giao_a_id)
      .maybeSingle();
    qdGiaoA = (data as QdGiaoA) ?? null;
  }

  const loai = draft.loai as LoaiGiaoXn;
  const cap = duAn.cap_dien_ap as CapDienAp | null;
  if (loai === "tvtk" && !cap) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Dự án chưa có cấp điện áp — chọn 110 kV hoặc trung hạ áp trước khi xuất Word",
      },
      { status: 400 },
    );
  }

  const xn = draft.xi_nghiep as Pick<XiNghiep, "id" | "ten" | "ma"> | null;
  const draftInput: QdGiaoXnExportInput = {
    loai,
    so_qd_du_thao: draft.so_qd_du_thao,
    ngay_du_thao: draft.ngay_du_thao,
    pham_vi: draft.pham_vi,
    thoi_han: draft.thoi_han,
    can_cu: draft.can_cu,
    ...extras,
  };

  const data = buildWordTagData({
    duAn: duAn as DuAn,
    qdGiaoA,
    xiNghiep: xn,
    draft: draftInput,
  });

  const buffer = renderQdGiaoXnDocx({ loai, cap, data });
  const file = resolveQdGiaoXnTemplateFile(loai, cap);
  const outName = `QD-giao-XN-${(duAn.ma_du_an || id).toString().slice(0, 40)}-${file.replace("qd-giao-nhiem-vu-", "").replace(".docx", "")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${outName}"`,
    },
  });
}

/** GET — xuất từ dữ liệu đã lưu */
export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    return await exportWord(id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi xuất Word";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** POST — xuất kèm field Word bổ sung từ form (chưa có cột DB) */
export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const extras = (await request.json().catch(() => ({}))) as ExportBody;
    return await exportWord(id, extras);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi xuất Word";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
