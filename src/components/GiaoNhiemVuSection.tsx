"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { labelCapDienAp } from "@/lib/cap-dien-ap";
import { labelHuongGiao } from "@/lib/huong-giao";
import { SoanQdGiaoXnForm } from "@/components/SoanQdGiaoXnForm";
import type {
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

type CardTone = "emerald" | "violet";

type TaskCardDef = {
  loai: LoaiGiaoXn;
  step: number;
  tag: string;
  title: string;
  description: string;
  tone: CardTone;
};

const CARDS: TaskCardDef[] = [
  {
    loai: "tvtk",
    step: 1,
    tag: "TVTK",
    title: "Giao Tư vấn thiết kế",
    description:
      "Soạn QĐ trình GĐ giao Xí nghiệp thực hiện TVTK. Xuất Word khi có mẫu.",
    tone: "emerald",
  },
  {
    loai: "thi_nghiem",
    step: 2,
    tag: "TN",
    title: "Giao Thí nghiệm",
    description:
      "Soạn QĐ trình GĐ giao Xí nghiệp thực hiện thí nghiệm. Xuất Word khi có mẫu.",
    tone: "violet",
  },
];

const TONE: Record<
  CardTone,
  {
    wrap: string;
    badge: string;
    icon: string;
    title: string;
    btn: string;
    btnDisabled: string;
  }
> = {
  emerald: {
    wrap: "border-emerald-200 bg-gradient-to-b from-emerald-50 to-white",
    badge: "bg-emerald-500 text-white",
    icon: "text-emerald-600 bg-emerald-100",
    title: "text-emerald-950",
    btn: "bg-emerald-600 text-white hover:bg-emerald-700",
    btnDisabled: "bg-emerald-100 text-emerald-700/60",
  },
  violet: {
    wrap: "border-violet-200 bg-gradient-to-b from-violet-50 to-white",
    badge: "bg-violet-500 text-white",
    icon: "text-violet-600 bg-violet-100",
    title: "text-violet-950",
    btn: "bg-violet-600 text-white hover:bg-violet-700",
    btnDisabled: "bg-violet-100 text-violet-700/60",
  },
};

function loaiAllowed(huong: DuAn["huong_giao"], loai: LoaiGiaoXn): boolean {
  if (!huong) return true;
  if (huong === "tvtk_tn") return true;
  if (huong === "tvtk") return loai === "tvtk";
  if (huong === "tn") return loai === "thi_nghiem";
  return true;
}

function statusLabel(tt: QdGiaoXn["trang_thai"]): string {
  if (tt === "nhap") return "Dự thảo";
  if (tt === "trinh_gd") return "Trình GĐ";
  if (tt === "da_ban_hanh") return "Đã ban hành";
  return tt;
}

export function GiaoNhiemVuSection({
  duAn,
  qd,
  xiNghiep,
  existingQds,
}: Props) {
  const [draftLoai, setDraftLoai] = useState<LoaiGiaoXn | null>(null);

  const byLoai = useMemo(() => {
    const map = new Map<LoaiGiaoXn, QdGiaoXnWithXn>();
    for (const q of existingQds) {
      if (!map.has(q.loai)) map.set(q.loai, q);
    }
    return map;
  }, [existingQds]);

  return (
    <div className="space-y-5">
      {/* I. Thông tin chung */}
      <section className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-[13px] font-black tracking-wider text-emerald-800 uppercase">
          I. Thông tin chung
        </h2>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <InfoField label="Mã dự án" value={duAn.ma_du_an || "—"} mono />
            <InfoField label="Tên dự án" value={duAn.ten_du_an} justify />
            <InfoField label="Địa điểm" value={duAn.dia_diem || "—"} />
            <InfoField
              label="Cấp điện áp"
              value={labelCapDienAp(duAn.cap_dien_ap)}
              accent
            />
            <InfoField
              label="Hướng giao"
              value={labelHuongGiao(duAn.huong_giao)}
              accent
            />
          </div>
          <div className="space-y-4 border-t border-emerald-100 pt-4 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <InfoField
              label="Giao A số"
              value={
                qd ? (
                  <Link
                    href={`/giao-a/${qd.id}`}
                    className="inline-flex flex-wrap items-baseline gap-x-1.5 text-sky-700 underline-offset-2 hover:text-sky-900 hover:underline"
                    title="Xem / chỉnh danh mục từ Giao A"
                  >
                    <span>
                      {qd.so_qd || "Xem Giao A"}
                      {qd.ngay_qd ? ` · ${qd.ngay_qd}` : ""}
                    </span>
                    <span className="text-[11px] font-semibold no-underline">
                      → Mở
                    </span>
                  </Link>
                ) : (
                  "—"
                )
              }
            />
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
            <p className="mb-2 text-[11px] font-bold tracking-wider text-sky-700 uppercase">
              Quy mô
            </p>
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-3 text-sm leading-relaxed font-medium text-justify whitespace-pre-wrap text-slate-800">
              {duAn.quy_mo?.trim() || "—"}
            </div>
          </div>
        </div>
      </section>

      {/* II. Phần giao nhiệm vụ */}
      <section className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/40 p-5 shadow-sm md:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[13px] font-black tracking-wider text-amber-900 uppercase">
              II. Phần giao nhiệm vụ
            </h2>
            <p className="mt-1 text-xs text-amber-800/70">
              Chọn loại hình → lập dự thảo QĐ (đơn vị, thời hạn…). Xuất Word khi
              có mẫu template.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {CARDS.map((card, i) => {
            const allowed = loaiAllowed(duAn.huong_giao, card.loai);
            const existing = byLoai.get(card.loai);
            const tone = TONE[card.tone];
            const drafting = draftLoai === card.loai;

            return (
              <div key={card.loai} className="flex flex-1 items-stretch gap-3">
                {i > 0 ? (
                  <div
                    className="hidden shrink-0 items-center self-center text-2xl font-black text-amber-400 lg:flex"
                    aria-hidden
                  >
                    ›
                  </div>
                ) : null}
                <article
                  className={`flex min-w-0 flex-1 flex-col rounded-2xl border p-4 shadow-sm ${tone.wrap} ${
                    !allowed ? "opacity-55" : ""
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${tone.badge}`}
                    >
                      {card.step}
                    </span>
                    <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                      {card.tag}
                    </span>
                  </div>

                  <div className="mb-3 flex gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
                    >
                      {card.loai === "tvtk" ? <DesignIcon /> : <LabIcon />}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className={`text-sm font-extrabold ${tone.title}`}
                      >
                        {card.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-slate-500">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {existing ? (
                    <div className="mb-3 space-y-1 rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-[12px]">
                      <Row
                        k="Đơn vị"
                        v={
                          existing.xi_nghiep?.ten ||
                          "Chưa chọn Xí nghiệp"
                        }
                      />
                      <Row
                        k="Loại hình"
                        v={card.loai === "tvtk" ? "TVTK" : "Thí nghiệm"}
                      />
                      <Row k="Thời hạn" v={existing.thoi_han || "—"} />
                      <Row
                        k="Trạng thái"
                        v={statusLabel(existing.trang_thai)}
                      />
                      {existing.so_qd_du_thao ? (
                        <Row k="Số QĐ" v={existing.so_qd_du_thao} />
                      ) : null}
                    </div>
                  ) : (
                    <div className="mb-3 rounded-xl border border-dashed border-slate-200/80 bg-white/40 px-3 py-2 text-[12px] text-slate-400">
                      Chưa lập — chọn đơn vị, thời hạn khi bấm Lập
                    </div>
                  )}

                  <div className="mt-auto">
                    {!allowed ? (
                      <button
                        type="button"
                        disabled
                        className={`w-full cursor-not-allowed rounded-xl px-3 py-2.5 text-xs font-bold ${tone.btnDisabled}`}
                      >
                        Không thuộc hướng giao
                      </button>
                    ) : existing ? (
                      <button
                        type="button"
                        onClick={() =>
                          setDraftLoai(drafting ? null : card.loai)
                        }
                        className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                          drafting
                            ? "bg-slate-200 text-slate-700"
                            : tone.btn
                        }`}
                      >
                        {drafting ? "Đóng form" : "Lập thêm / xem form"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setDraftLoai(drafting ? null : card.loai)
                        }
                        className={`w-full rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                          drafting
                            ? "bg-slate-200 text-slate-700"
                            : tone.btn
                        }`}
                      >
                        {drafting ? "Đóng form" : "+ Lập"}
                      </button>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {draftLoai ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              Soạn dự thảo —{" "}
              {draftLoai === "tvtk" ? "Tư vấn thiết kế" : "Thí nghiệm"}
            </h3>
            <SoanQdGiaoXnForm
              key={draftLoai}
              duAn={duAn}
              qd={qd}
              xiNghiep={xiNghiep}
              initialLoai={draftLoai}
              lockLoai
              embedded
              onSaved={() => setDraftLoai(null)}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function InfoField({
  label,
  value,
  mono,
  accent,
  justify,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  accent?: boolean;
  justify?: boolean;
}) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] font-bold tracking-wider text-sky-700 uppercase">
        {label}
      </p>
      <div
        className={`text-sm font-bold ${
          accent ? "text-sky-800" : "text-slate-900"
        } ${mono ? "font-mono text-[13px]" : ""} ${
          justify ? "text-justify leading-relaxed" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0 text-slate-400">{k}</span>
      <span className="text-right font-semibold text-slate-700">{v}</span>
    </div>
  );
}

function DesignIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function LabIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  );
}
