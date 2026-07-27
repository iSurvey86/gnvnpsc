"use client";

import type { DuAnTrungRef } from "@/lib/du-an-trung";
import type { DuAn } from "@/lib/types";

export type DupResolveChoice = "cancel" | "create" | "update";

type Props = {
  open: boolean;
  index: number;
  total: number;
  row: DuAn;
  existing: DuAnTrungRef;
  onChoice: (choice: DupResolveChoice) => void;
};

export function DuAnTrungResolveModal({
  open,
  index,
  total,
  row,
  existing,
  onChoice,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => onChoice("cancel")}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border-2 border-amber-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dup-resolve-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50 px-5 py-4">
          <div>
            <h3
              id="dup-resolve-title"
              className="text-[15px] font-black tracking-tight text-amber-900 uppercase"
            >
              Phát hiện dự án trùng lặp
            </h3>
            <p className="mt-0.5 text-[12px] font-semibold text-amber-800/80">
              Đang xử lý {index + 1} / {total}
            </p>
          </div>
          <div className="flex items-center gap-1 text-amber-700">
            <button
              type="button"
              disabled={index <= 0}
              className="rounded-lg px-2 py-1 text-lg font-bold disabled:opacity-30"
              title="Trước"
              onClick={() => {
                /* tuần tự — không nhảy; chỉ hiện tiến độ */
              }}
            >
              ‹
            </button>
            <button
              type="button"
              disabled
              className="rounded-lg px-2 py-1 text-lg font-bold opacity-30"
              title="Sau"
            >
              ›
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-700">
            Hệ thống phát hiện tên dự án trong file quét trùng với dự án đã có
            trên CSDL. Chọn <strong>cùng một dự án</strong> để cập nhật dữ liệu
            cũ, hoặc <strong>dự án khác</strong> để giữ bản ghi mới.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <CompareCol
              title="Dữ liệu đang có (trên hệ thống)"
              tone="slate"
              ma={existing.ma_du_an || "—"}
              ten={existing.ten_du_an}
              qd={existing.so_qd || "—"}
              badge="Giữ nguyên nếu cập nhật"
            />
            <CompareCol
              title="Dữ liệu mới (từ file quét)"
              tone="sky"
              ma={`${row.ma_du_an || "—"} (tạm)`}
              ten={row.ten_du_an}
              qd={"Giao A hiện tại"}
              badge="Từ file quét"
            />
            <CompareCol
              title="Sau cập nhật"
              tone="emerald"
              ma={existing.ma_du_an || "—"}
              ten={row.ten_du_an}
              qd={"Gắn Giao A hiện tại"}
              badge="Giữ mã cũ · lấy tên/quy mô mới"
              emphasize
            />
          </div>

          <p className="text-[12px] text-slate-500">
            Nếu chọn cùng một dự án: cập nhật bản ghi cũ (giữ mã{" "}
            <span className="font-mono font-semibold">
              {existing.ma_du_an || "—"}
            </span>
            ), xóa dòng mới vừa quét — không sinh mã trùng.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => onChoice("cancel")}
              className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 sm:mr-auto"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onChoice("create")}
              className="cursor-pointer rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Đó là dự án khác (Tạo mới)
            </button>
            <button
              type="button"
              onClick={() => onChoice("update")}
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sky-700"
            >
              Cùng là một dự án (Cập nhật dữ liệu cũ)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareCol({
  title,
  tone,
  ma,
  ten,
  qd,
  badge,
  emphasize,
}: {
  title: string;
  tone: "slate" | "sky" | "emerald";
  ma: string;
  ten: string;
  qd: string;
  badge: string;
  emphasize?: boolean;
}) {
  const wrap =
    tone === "emerald"
      ? "border-emerald-300 ring-2 ring-emerald-50"
      : tone === "sky"
        ? "border-sky-200"
        : "border-slate-200";
  const head =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-800"
      : tone === "sky"
        ? "bg-sky-50 text-sky-800"
        : "bg-slate-100 text-slate-600";

  return (
    <div className={`overflow-hidden rounded-xl border bg-white shadow-sm ${wrap}`}>
      <div className={`px-3 py-2 text-[11px] font-bold tracking-wider uppercase ${head}`}>
        {title}
      </div>
      <div className="space-y-2.5 p-3 text-[12px]">
        <Field label="Mã dự án" value={ma} emphasize={emphasize} />
        <Field label="Tên dự án" value={ten} emphasize={emphasize} />
        <Field label="Quyết định Giao A" value={qd} />
        <p className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500">
          {badge}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      <div
        className={`rounded-lg border px-2.5 py-2 font-semibold leading-snug break-words ${
          emphasize
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
            : "border-slate-100 bg-slate-50 text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
