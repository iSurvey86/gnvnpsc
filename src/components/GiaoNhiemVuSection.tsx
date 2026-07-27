"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { labelCapDienAp } from "@/lib/cap-dien-ap";
import { normalizeDiaDiem } from "@/lib/dia-diem";
import { labelHuongGiao } from "@/lib/huong-giao";
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

type CardTone = "sky" | "emerald" | "violet";

type TaskCardDef = {
  id: string;
  loai: LoaiGiaoXn;
  cap?: CapDienAp;
  step: number;
  tag: string;
  title: string;
  description: string;
  tone: CardTone;
};

const CARDS: TaskCardDef[] = [
  {
    id: "tvtk_110",
    loai: "tvtk",
    cap: "110kv",
    step: 1,
    tag: "TVTK 110",
    title: "Giao tư vấn thiết kế 110kV",
    description:
      "Soạn QĐ trình GĐ giao XN thực hiện TVTK lưới 110 kV. Xuất Word theo mẫu 110.",
    tone: "sky",
  },
  {
    id: "tvtk_tha",
    loai: "tvtk",
    cap: "trung_ha_ap",
    step: 2,
    tag: "TVTK THA",
    title: "Giao Tư vấn thiết kế trung, hạ áp",
    description:
      "Soạn QĐ trình GĐ giao XN thực hiện TVTK trung / hạ áp. Xuất Word theo mẫu THA.",
    tone: "emerald",
  },
  {
    id: "thi_nghiem",
    loai: "thi_nghiem",
    step: 3,
    tag: "TN",
    title: "Giao Thí nghiệm, hiệu chỉnh",
    description:
      "Soạn QĐ trình GĐ giao XN thực hiện thí nghiệm hiệu chỉnh. Xuất Word theo mẫu TN.",
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
  sky: {
    wrap: "border-sky-200 bg-gradient-to-b from-sky-50 to-white",
    badge: "bg-sky-500 text-white",
    icon: "text-sky-600 bg-sky-100",
    title: "text-sky-950",
    btn: "bg-sky-600 text-white hover:bg-sky-700",
    btnDisabled: "bg-sky-100 text-sky-700/60",
  },
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

/** Ẩn thẻ TVTK không khớp cấp điện áp dự án. */
function cardMatchesCap(
  card: TaskCardDef,
  cap: DuAn["cap_dien_ap"],
): boolean {
  if (!card.cap) return true;
  if (!cap) return true;
  return card.cap === cap;
}

function labelLoaiGiao(
  loai: LoaiGiaoXn,
  cap: DuAn["cap_dien_ap"],
  cardCap?: CapDienAp,
): string {
  if (loai === "thi_nghiem") return "Thí nghiệm, hiệu chỉnh";
  const c = cardCap ?? cap;
  if (c === "110kv") return "Tư vấn thiết kế 110kV";
  if (c === "trung_ha_ap") return "Tư vấn thiết kế trung, hạ áp";
  return "Tư vấn thiết kế";
}

function statusLabel(tt: QdGiaoXn["trang_thai"]): string {
  if (tt === "nhap") return "Dự thảo";
  if (tt === "trinh_gd") return "Trình GĐ";
  if (tt === "da_ban_hanh") return "Đã ban hành";
  return tt;
}

function soanHref(duAnId: string, loai: LoaiGiaoXn, qdId?: string) {
  const q = new URLSearchParams({ loai });
  if (qdId) q.set("qdId", qdId);
  return `/du-an/${duAnId}/giao-xn/soan?${q.toString()}`;
}

export function GiaoNhiemVuSection({ duAn, qd, existingQds }: Props) {
  const byLoai = useMemo(() => {
    const map = new Map<LoaiGiaoXn, QdGiaoXnWithXn>();
    for (const row of existingQds) {
      if (!map.has(row.loai)) map.set(row.loai, row);
    }
    return map;
  }, [existingQds]);

  const visibleCards = useMemo(
    () =>
      CARDS.filter((c) => cardMatchesCap(c, duAn.cap_dien_ap)).map(
        (c, idx) => ({ ...c, step: idx + 1 }),
      ),
    [duAn.cap_dien_ap],
  );

  const needCapForTvtk =
    loaiAllowed(duAn.huong_giao, "tvtk") && !duAn.cap_dien_ap;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-[13px] font-black tracking-wider text-emerald-800 uppercase">
          I. Thông tin chung
        </h2>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <InfoField label="Mã dự án" value={duAn.ma_du_an || "—"} mono />
            <InfoField label="Tên dự án" value={duAn.ten_du_an} justify />
            <InfoField
              label="Địa điểm"
              value={normalizeDiaDiem(duAn.dia_diem) || "—"}
            />
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
            <div className="text-[13px] font-bold text-slate-900">
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
                      ? ` ngày ${formatNgayGiaoANgan(qd.ngay_qd)}`
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
            <p className="mb-1.5 text-[11px] font-bold tracking-wider text-sky-700 uppercase">
              Quy mô
            </p>
            <div className="text-[13px] leading-snug font-medium text-justify whitespace-pre-wrap text-slate-800">
              {duAn.quy_mo?.trim() || "—"}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/40 p-5 shadow-sm md:p-6">
        <div className="mb-4">
          <h2 className="text-[13px] font-black tracking-wider text-amber-900 uppercase">
            II. Phần giao nhiệm vụ
          </h2>
          <p className="mt-1 text-xs text-amber-800/70">
            Bấm <strong>Lập</strong> / <strong>Mở soạn</strong> để vào trang soạn
            QĐ (Lưu, Xuất Word, Xuất PDF) — không trôi form dưới thẻ.
          </p>
        </div>

        {needCapForTvtk ? (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Dự án chưa có <strong>cấp điện áp</strong> — chọn 110 kV hoặc trung
            hạ áp trên Review Giao A trước khi xuất Word TVTK.
          </div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {visibleCards.map((card, i) => {
            const allowed = loaiAllowed(duAn.huong_giao, card.loai);
            const existing = byLoai.get(card.loai);
            const tone = TONE[card.tone];
            const href = soanHref(duAn.id, card.loai, existing?.id);

            return (
              <div key={card.id} className="flex flex-1 items-stretch gap-3">
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
                      <h3 className={`text-sm font-extrabold ${tone.title}`}>
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
                        v={existing.xi_nghiep?.ten || "Chưa chọn Xí nghiệp"}
                      />
                      <Row
                        k="Loại hình"
                        v={labelLoaiGiao(
                          card.loai,
                          duAn.cap_dien_ap,
                          card.cap,
                        )}
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
                      Chưa lập — mở trang soạn để chọn đơn vị, thời hạn
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
                    ) : (
                      <Link
                        href={href}
                        className={`block w-full rounded-xl px-3 py-2.5 text-center text-xs font-bold transition ${tone.btn}`}
                      >
                        {existing ? "Mở soạn" : "+ Lập"}
                      </Link>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
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
        className={`text-[13px] font-bold ${
          accent ? "text-sky-800" : "text-slate-900"
        } ${mono ? "font-mono text-[12px]" : ""} ${
          justify ? "text-justify leading-snug" : ""
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

/** `2026-03-30` → `30/03/2026` */
function formatNgayGiaoANgan(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return isoDate;
  return `${m[3]}/${m[2]}/${m[1]}`;
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
