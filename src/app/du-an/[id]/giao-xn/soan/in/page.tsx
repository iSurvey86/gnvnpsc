import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DuAn, QdGiaoXn, XiNghiep } from "@/lib/types";
import { formatNgayBanHanhChu } from "@/lib/word/format-ngay";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ qdId?: string }>;
};

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

  return (
    <div className="mx-auto max-w-[800px] bg-white p-8 text-slate-900 print:p-0">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate-600">
          Dùng Ctrl+P → chọn máy in <strong>Save as PDF</strong> /
          Microsoft Print to PDF.
        </p>
        <div className="flex gap-2">
          <PrintButton />
          <Link
            href={`/du-an/${id}/giao-xn/soan?loai=${d.loai}&qdId=${qdId}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
          >
            ← Quay lại soạn
          </Link>
        </div>
      </div>

      <header className="mb-6 border-b border-slate-300 pb-4 text-center">
        <p className="text-xs font-bold tracking-wide uppercase">
          Công ty Dịch vụ Điện lực miền Bắc
        </p>
        <h1 className="mt-3 text-xl font-black uppercase">Quyết định</h1>
        <p className="mt-1 text-sm">
          Số: {d.so_qd_du_thao || "…"}/QĐ-NPSC
        </p>
        <p className="text-sm">
          Hà Nội, {formatNgayBanHanhChu(d.ngay_du_thao)}
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed">
        <p>
          <strong>Dự án:</strong> {da.ten_du_an}
          {da.ma_du_an ? ` (${da.ma_du_an})` : ""}
        </p>
        <p>
          <strong>Loại giao:</strong>{" "}
          {d.loai === "tvtk" ? "Tư vấn thiết kế" : "Thí nghiệm, hiệu chỉnh"}
        </p>
        <p>
          <strong>Xí nghiệp nhận:</strong> {xn?.ten || "—"}
        </p>
        <p>
          <strong>Thời hạn:</strong> {d.thoi_han || "—"}
        </p>
        <p className="text-justify">
          <strong>Phạm vi:</strong> {d.pham_vi || "—"}
        </p>
        <p className="text-justify">
          <strong>Căn cứ:</strong> {d.can_cu || "—"}
        </p>
        <p className="mt-8 text-xs text-slate-500">
          Đây là bản tóm tắt để in/PDF. Văn bản chính thức theo mẫu Word đầy đủ
          (nút Xuất Word trên trang soạn).
        </p>
      </section>
    </div>
  );
}
