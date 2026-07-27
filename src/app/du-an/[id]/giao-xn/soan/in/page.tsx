import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { QdGiaoXnDocBanner } from "@/components/QdGiaoXnDocBanner";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveSoanQdTone,
  SOAN_QD_THEME,
} from "@/lib/soan-qd-theme";
import type { DuAn, QdGiaoXn, XiNghiep } from "@/lib/types";
import { formatNgayBanHanhChu } from "@/lib/word/format-ngay";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ qdId?: string }>;
};

function labelLoaiIn(loai: QdGiaoXn["loai"], cap: DuAn["cap_dien_ap"]): string {
  if (loai === "thi_nghiem") return "thí nghiệm, hiệu chỉnh";
  if (cap === "110kv") return "tư vấn thiết kế 110kV";
  if (cap === "trung_ha_ap") return "tư vấn thiết kế trung, hạ áp";
  return "tư vấn thiết kế";
}

/** Bản in / Save as PDF (trình duyệt). */
export default async function InQdGiaoXnPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { qdId } = await searchParams;
  if (!qdId) notFound();

  const supabase = createAdminClient();
  const { data: draft } = await supabase
    .from("qd_giao_xn")
    .select("*, xi_nghiep:xi_nghiep_id ( id, ten, ma )")
    .eq("id", qdId)
    .eq("du_an_id", id)
    .maybeSingle();

  if (!draft) notFound();

  const { data: duAn } = await supabase
    .from("du_an")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!duAn) notFound();

  const xn = draft.xi_nghiep as Pick<XiNghiep, "ten" | "ma"> | null;
  const d = draft as QdGiaoXn;
  const da = duAn as DuAn;
  const loaiNhiemVu = labelLoaiIn(d.loai, da.cap_dien_ap);
  const tenXn = xn?.ten?.trim() || "…";
  const tone = resolveSoanQdTone(d.loai, da.cap_dien_ap);
  const theme = SOAN_QD_THEME[tone];
  const soQdHien =
    d.so_qd_du_thao?.trim() ||
    "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";

  return (
    <div className="mx-auto max-w-[800px] bg-white p-6 text-slate-900 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate-600">
          Dùng Ctrl+P → chọn máy in <strong>Save as PDF</strong> /
          Microsoft Print to PDF.
        </p>
        <div className="flex gap-2">
          <PrintButton />
          <Link
            href={`/du-an/${id}/giao-xn/soan?loai=${d.loai}&qdId=${qdId}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            ← Quay lại soạn
          </Link>
        </div>
      </div>

      <article
        className={`overflow-hidden rounded-2xl border print:rounded-none print:border-0 ${theme.articleBorder}`}
      >
        <QdGiaoXnDocBanner
          loaiNhiemVu={loaiNhiemVu}
          tenXiNghiep={tenXn}
          tone={tone}
        />

        <div className="space-y-5 px-6 py-6 text-sm leading-relaxed md:px-8">
          <div className="grid gap-1 sm:grid-cols-2">
            <p>
              <span className={`font-medium ${theme.label}`}>Số:</span>{" "}
              <span className="font-mono tracking-widest">
                {soQdHien}
              </span>
              /QĐ-NPSC
            </p>
            <p className="sm:text-right">
              Hà Nội, {formatNgayBanHanhChu(d.ngay_du_thao)}
            </p>
          </div>

          <p>
            <span className={`font-medium ${theme.label}`}>Dự án:</span>{" "}
            {da.ten_du_an}
            {da.ma_du_an ? ` (${da.ma_du_an})` : ""}
          </p>

          {d.can_cu ? (
            <div>
              <p
                className={`mb-1 text-[11px] font-medium tracking-wide uppercase ${theme.label}`}
              >
                Căn cứ
              </p>
              <p className="text-justify whitespace-pre-wrap">{d.can_cu}</p>
            </div>
          ) : null}

          {d.pham_vi ? (
            <div>
              <p
                className={`mb-1 text-[11px] font-medium tracking-wide uppercase ${theme.label}`}
              >
                Điều 1 — Phạm vi
              </p>
              <p className="text-justify whitespace-pre-wrap">{d.pham_vi}</p>
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className={`font-medium ${theme.label}`}>
                Xí nghiệp nhận:
              </span>{" "}
              {tenXn}
            </p>
            <p>
              <span className={`font-medium ${theme.label}`}>Thời hạn:</span>{" "}
              {d.thoi_han || "—"}
            </p>
          </div>

          <p className={`border-t border-dashed pt-4 text-xs text-slate-500 ${theme.tableRowBorder}`}>
            Bản tóm tắt để in/PDF. Văn bản chính thức theo mẫu Word (nút Xuất
            Word trên trang soạn).
          </p>
        </div>
      </article>
    </div>
  );
}
