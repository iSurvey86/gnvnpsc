"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { labelCapDienAp } from "@/lib/cap-dien-ap";
import { normalizeDiaDiem } from "@/lib/dia-diem";
import { isPhanHeCode, PHAN_HE } from "@/lib/phan-he";
import { formatNgayVN } from "@/lib/word/format-ngay";
import { labelTrangThaiGiaoXn } from "@/lib/trang-thai-giao-xn";
import type {
  CapDienAp,
  DuAn,
  LoaiGiaoXn,
  QdGiaoA,
  QdGiaoXn,
  XiNghiep,
} from "@/lib/types";

export type QdGiaoXnWithXn = QdGiaoXn & {
  xi_nghiep?: Pick<XiNghiep, "id" | "ten" | "ma"> | null;
};

type Props = {
  duAn: DuAn;
  qd: QdGiaoA | null;
  xiNghiep: XiNghiep[];
  existingQds: QdGiaoXnWithXn[];
};

function labelLoaiGiao(
  loai: LoaiGiaoXn,
  cap: DuAn["cap_dien_ap"],
  cardCap?: CapDienAp,
): string {
  if (loai === "thi_nghiem") return "Thí nghiệm, hiệu chỉnh";
  if (loai === "tvgs") return "Tư vấn giám sát";
  const c = cardCap ?? cap;
  if (c === "110kv") return "Tư vấn thiết kế 110kV";
  if (c === "trung_ha_ap") return "Tư vấn thiết kế trung, hạ áp";
  return "Tư vấn thiết kế";
}

function statusLabel(tt: QdGiaoXn["trang_thai"]): string {
  return labelTrangThaiGiaoXn(tt);
}

function soanHref(
  currentDuAnId: string,
  loai: LoaiGiaoXn,
  qd?: Pick<QdGiaoXn, "id" | "du_an_id"> | null,
) {
  const ownerId = qd?.du_an_id ?? currentDuAnId;
  const q = new URLSearchParams({ loai });
  if (qd?.id) q.set("qdId", qd.id);
  return `/du-an/${ownerId}/giao-xn/soan?${q.toString()}`;
}

export function GiaoNhiemVuSection({
  duAn,
  qd,
  xiNghiep,
  existingQds,
}: Props) {
  const phanHe = isPhanHeCode(duAn.phan_he) ? duAn.phan_he : "tvtk";
  const loaiMacDinh = PHAN_HE[phanHe].defaultLoaiGiao;
  const byLoai = useMemo(() => {
    const map = new Map<LoaiGiaoXn, QdGiaoXnWithXn>();
    for (const row of existingQds) {
      if (!map.has(row.loai)) map.set(row.loai, row);
    }
    return map;
  }, [existingQds]);

  const existing =
    byLoai.get(loaiMacDinh) ??
    (phanHe === "tvgs"
      ? byLoai.get("tvtk")
      : phanHe === "thi_nghiem"
        ? byLoai.get("thi_nghiem")
        : byLoai.get("tvtk"));
  const mappedOnly = Boolean(
    existing && existing.du_an_id && existing.du_an_id !== duAn.id,
  );
  const soanUrl = soanHref(duAn.id, loaiMacDinh, existing);
  const loaiText = labelLoaiGiao(loaiMacDinh, duAn.cap_dien_ap);
  const needCapForTvtk = loaiMacDinh === "tvtk" && !duAn.cap_dien_ap;
  const xnDanhMuc =
    xiNghiep.find((x) => x.id === duAn.xi_nghiep_id)?.ten ?? null;
  const qdPdfKy =
    existing?.pdf_ky_storage_path
      ? existing
      : (existingQds.find((q) => q.pdf_ky_storage_path) ?? null);
  const daCoPdfKy = Boolean(qdPdfKy?.pdf_ky_storage_path);
  const tenXnHienThi =
    existing?.xi_nghiep?.ten?.trim() || xnDanhMuc || "—";

  const caption = existing
    ? [
        loaiText,
        existing.xi_nghiep?.ten || xnDanhMuc || "Chưa chọn Xí nghiệp",
        mappedOnly
          ? existing.so_qd_du_thao?.trim()
            ? `Đã có trong QĐ ${existing.so_qd_du_thao.trim()}`
            : "Đã có trong quyết định chung"
          : statusLabel(existing.trang_thai),
      ].join(" · ")
    : [loaiText, xnDanhMuc].filter(Boolean).join(" · ");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-[13px] font-semibold tracking-wider text-emerald-800 uppercase">
          I. Thông tin chung
        </h2>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <InfoField label="Mã dự án" value={duAn.ma_du_an || "—"} mono />
            <InfoField label="Tên dự án" value={duAn.ten_du_an} justify emph />
            <InfoField
              label="Địa điểm"
              value={normalizeDiaDiem(duAn.dia_diem) || "—"}
            />
            <InfoField
              label="Cấp điện áp"
              value={labelCapDienAp(duAn.cap_dien_ap)}
            />
            <InfoField
              label={
                daCoPdfKy && qdPdfKy ? (
                  <span className="inline-flex items-center gap-1.5">
                    Xí nghiệp được giao
                    <a
                      href={`/api/qd-giao-xn/${qdPdfKy.id}/pdf-ky`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-violet-300"
                      title="Xem PDF quyết định đã ký"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EyeIcon />
                    </a>
                  </span>
                ) : (
                  <>
                    Xí nghiệp được giao{" "}
                    <span className="font-normal normal-case tracking-normal text-sky-500">
                      (dự kiến)
                    </span>
                  </>
                )
              }
              value={tenXnHienThi}
              tone="xn"
            />
          </div>
          <div className="space-y-4 border-t border-emerald-100 pt-4 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <div className="text-[13px] font-normal text-slate-800">
              {qd ? (
                <a
                  href={`/api/giao-a/${qd.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap text-[#7c3aed] italic outline-none hover:underline focus-visible:underline"
                  title="Xem file PDF Giao A"
                >
                  <span>
                    Giao A số {qd.so_qd || "—"}
                    {qd.ngay_qd
                      ? ` ngày ${formatNgayVN(qd.ngay_qd)}`
                      : ""}
                  </span>
                  <EyeIcon />
                </a>
              ) : (
                <span>Giao A số —</span>
              )}
            </div>
            <InfoField
              label="Trích yếu Giao A"
              value={qd?.trich_yeu || "—"}
              justify
            />
            {duAn.ghi_chu ? (
              <InfoField label="Ghi chú" value={duAn.ghi_chu} justify />
            ) : null}
          </div>
          <div className="border-t border-emerald-100 pt-4 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <p className="mb-1.5 text-[11px] font-medium tracking-wider text-sky-600 uppercase">
              Quy mô
            </p>
            <div className="text-[13px] leading-snug font-normal text-justify whitespace-pre-wrap text-slate-700">
              {duAn.quy_mo?.trim() || "—"}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-center gap-2.5 pt-1 pb-2">
        {needCapForTvtk ? (
          <p className="max-w-xl rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2 text-center text-xs font-normal text-amber-800">
            Dự án chưa có <strong className="font-medium">cấp điện áp</strong> — chọn 110 kV hoặc trung
            hạ áp trên Review Giao A trước khi xuất Word.
          </p>
        ) : null}

        <Link
          href={soanUrl}
          className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-teal-500 bg-teal-50 px-12 py-3.5 text-base font-semibold tracking-wide text-teal-800 uppercase shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_22px_-14px_rgba(13,148,136,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-600 hover:bg-teal-100 hover:text-teal-900 hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_16px_28px_-14px_rgba(13,148,136,0.5)] focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
        >
          <DesignIcon />
          {existing ? "Mở soạn quyết định" : "Giao nhiệm vụ"}
        </Link>
        {mappedOnly ? (
          <p className="max-w-xl text-center text-xs font-normal text-slate-600">
            Công trình này đã nằm trong quyết định giao Xí nghiệp đã lập — mở
            quyết định đó để xem hoặc sửa (không lập bản mới).
          </p>
        ) : null}
        {caption ? (
          <p className="text-[11px] font-normal tracking-wider text-teal-700/70 uppercase">
            {caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  mono,
  tone = "default",
  justify,
  emph,
}: {
  label: ReactNode;
  value: ReactNode;
  mono?: boolean;
  /** `xn` — giá trị tím (nhãn vẫn xanh như mục khác) */
  tone?: "default" | "xn";
  justify?: boolean;
  /** Tô đậm giá trị (vd. tên dự án) */
  emph?: boolean;
}) {
  const isXn = tone === "xn";
  return (
    <div>
      <p className="mb-0.5 text-[11px] font-medium tracking-wider text-sky-600 uppercase">
        {label}
      </p>
      <div
        className={`text-[13px] ${
          emph ? "font-semibold text-slate-900" : "font-normal"
        } ${
          isXn ? "font-medium text-violet-700" : emph ? "" : "text-slate-700"
        } ${mono ? "font-mono text-[12px] font-light text-slate-700" : ""} ${
          justify ? "text-justify leading-snug" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-[#7c3aed]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function DesignIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
