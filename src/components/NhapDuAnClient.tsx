"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDialog } from "@/components/AppDialog";
import { PHAN_HE, type PhanHeCode } from "@/lib/phan-he";
import { formatNgayVN } from "@/lib/word/format-ngay";

type Props = {
  phanHe: PhanHeCode;
};

type PairExisting = {
  id: string;
  so_qd: string | null;
  ngay_qd: string | null;
  trich_yeu: string | null;
  scanned_by_ho_ten: string | null;
  scanned_by_email: string | null;
  created_at: string;
};

export function NhapDuAnClient({ phanHe }: Props) {
  const cfg = PHAN_HE[phanHe];
  const t = cfg.theme;
  const router = useRouter();
  const { showConfirm, showAlert } = useAppDialog();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const [pairInfo, setPairInfo] = useState<{
    existing: PairExisting;
    pair_counts: Record<string, number>;
    already_has_phan_he: boolean;
    scanned_so_qd: string | null;
  } | null>(null);

  async function runIngest(opts?: { pairId?: string }) {
    if (!opts?.pairId && !file) {
      setError("Chọn file PDF Quyết định Giao A");
      return;
    }
    setLoading(true);
    setError(null);
    setPercent(12);
    const tick = window.setInterval(() => {
      setPercent((p) => (p >= 88 ? p : p + 7));
    }, 400);

    try {
      const form = new FormData();
      form.append("phan_he", phanHe);
      if (opts?.pairId) {
        form.append("pair_qd_giao_a_id", opts.pairId);
      } else if (file) {
        form.append("file", file);
      }

      const res = await fetch("/api/giao-a/ingest", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: {
          qd_giao_a_id?: string;
          needs_pair?: boolean;
          paired?: boolean;
          phan_he?: string;
          warnings?: string[];
          trung_ten_count?: number;
          existing?: PairExisting;
          pair_counts?: Record<string, number>;
          already_has_phan_he?: boolean;
          scanned_so_qd?: string | null;
        };
      };
      setPercent(100);
      if (!json.ok) throw new Error(json.error ?? "Scan thất bại");

      if (json.data?.needs_pair && json.data.existing) {
        setPairInfo({
          existing: json.data.existing,
          pair_counts: json.data.pair_counts ?? {},
          already_has_phan_he: Boolean(json.data.already_has_phan_he),
          scanned_so_qd: json.data.scanned_so_qd ?? null,
        });
        setPercent(0);
        return;
      }

      const qdId = json.data?.qd_giao_a_id;
      if (!qdId) throw new Error(json.error ?? "Thiếu mã hồ sơ Giao A");

      const warns = json.data?.warnings?.filter(Boolean) ?? [];
      if (warns.length) {
        const ok = await showConfirm(`• ${warns.join("\n• ")}`, {
          title: "Cảnh báo khi nhập",
          variant: "warning",
          confirmLabel: "Tiếp tục Review",
          cancelLabel: "Ở lại",
        });
        if (!ok) {
          setPercent(0);
          return;
        }
      }
      setPairInfo(null);
      router.push(`/giao-a/${qdId}?phan_he=${phanHe}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      setPercent(0);
    } finally {
      window.clearInterval(tick);
      setLoading(false);
    }
  }

  async function confirmPair() {
    if (!pairInfo) return;
    if (pairInfo.already_has_phan_he) {
      await showAlert(
        `Phân hệ ${cfg.short} đã có danh mục từ Giao A này. Mở Review để tiếp tục.`,
        { title: "Đã pair trước đó", variant: "info" },
      );
      router.push(`/giao-a/${pairInfo.existing.id}?phan_he=${phanHe}`);
      return;
    }
    await runIngest({ pairId: pairInfo.existing.id });
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f3f4f6] antialiased">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm md:px-10">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl border p-2 ${t.border} ${t.softBg} ${t.softText}`}
          >
            <FileTextIcon />
          </div>
          <div>
            <p
              className={`text-[11px] font-bold tracking-wider uppercase ${t.softText}`}
            >
              Phân hệ {cfg.short}
            </p>
            <h1 className="mt-0.5 text-[17px] leading-none font-black tracking-tight text-slate-800 uppercase">
              Nhập thông tin dự án mới
            </h1>
            <p className="mt-1.5 text-[11px] leading-none font-semibold tracking-wider text-slate-400 uppercase">
              Tải Giao A (PDF) — ScanAI nhận dạng danh mục · mã gắn -{cfg.maSuffix}
            </p>
          </div>
        </div>
        <Link
          href={cfg.href}
          className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm ${t.btnOutline}`}
        >
          ← Về Quản lý dự án
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-5 px-4 py-6 md:px-8">
        <section
          className={`rounded-2xl border p-5 shadow-sm ${t.border} ${t.softBg}`}
        >
          <p
            className={`mb-3 text-[11px] font-bold tracking-wider uppercase ${t.softText}`}
          >
            Tải file &amp; quét
          </p>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="w-full flex-1">
              <div
                className={`relative overflow-hidden rounded-xl border bg-white transition-colors ${t.border}`}
              >
                {loading ? (
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 opacity-60 transition-all duration-500 ease-out ${t.softBg}`}
                    style={{ width: `${percent}%` }}
                  />
                ) : null}
                <div className="relative flex min-h-[44px] items-center gap-3 px-3 py-2.5">
                  <label
                    htmlFor="pdf-upload-input"
                    className={`shrink-0 rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-colors select-none ${
                      loading
                        ? "cursor-not-allowed bg-slate-400"
                        : "cursor-pointer bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    Chọn Tệp
                  </label>
                  <span
                    className={`flex-1 truncate text-xs ${
                      loading
                        ? `font-semibold ${t.primaryText}`
                        : file
                          ? "font-medium text-slate-700"
                          : "text-slate-400"
                    }`}
                  >
                    {loading
                      ? `Đang quét… ${percent}%`
                      : file
                        ? file.name
                        : "Chưa chọn file PDF"}
                  </span>
                  {loading ? (
                    <span
                      className={`min-w-[36px] shrink-0 text-right text-xs font-black tabular-nums ${t.primaryText}`}
                    >
                      {percent}%
                    </span>
                  ) : null}
                </div>
                <input
                  id="pdf-upload-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={loading}
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setPairInfo(null);
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={loading || !file}
              onClick={() => void runIngest()}
              className={`flex w-full shrink-0 items-center justify-center rounded-xl px-8 py-3 text-sm font-bold text-white shadow-sm transition-all md:w-auto disabled:cursor-not-allowed disabled:opacity-50 ${t.primary}`}
            >
              {loading ? "Đang quét dữ liệu…" : "Quét dữ liệu"}
            </button>
          </div>
        </section>

        {pairInfo ? (
          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <h2 className="text-sm font-black tracking-wide text-amber-950 uppercase">
              Giao A đã có trong hệ thống — pair phân hệ
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
              Số QĐ{" "}
              <strong>
                {pairInfo.existing.so_qd || pairInfo.scanned_so_qd || "—"}
              </strong>
              {pairInfo.existing.ngay_qd
                ? ` ngày ${formatNgayVN(pairInfo.existing.ngay_qd)}`
                : ""}{" "}
              đã được quét
              {pairInfo.existing.scanned_by_ho_ten
                ? ` bởi ${pairInfo.existing.scanned_by_ho_ten}`
                : ""}
              . PDF dùng chung — không tạo hồ sơ mới.
            </p>
            <ul className="mt-3 space-y-1 text-xs font-semibold text-amber-900/80">
              <li>
                TVTK: {pairInfo.pair_counts.tvtk ?? 0} dự án · TN:{" "}
                {pairInfo.pair_counts.thi_nghiem ?? 0} · TVGS:{" "}
                {pairInfo.pair_counts.tvgs ?? 0}
              </li>
              {pairInfo.already_has_phan_he ? (
                <li className="text-rose-700">
                  Phân hệ {cfg.short} đã có danh mục từ Giao A này.
                </li>
              ) : (
                <li>
                  Bấm «Dùng hồ sơ này» để tạo danh mục cho {cfg.short} (mã -{cfg.maSuffix}).
                </li>
              )}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => void confirmPair()}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white ${t.primary} disabled:opacity-60`}
              >
                {pairInfo.already_has_phan_he
                  ? "Mở Review phân hệ này"
                  : `Dùng hồ sơ này cho ${cfg.short}`}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setPairInfo(null)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700"
              >
                Hủy
              </button>
              <a
                href={`/api/giao-a/${pairInfo.existing.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-sm font-bold text-amber-900"
              >
                Xem PDF gốc
              </a>
            </div>
          </section>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
          <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50/60 px-4 py-2.5">
            <p className="text-[11px] font-bold tracking-wider text-violet-700 uppercase">
              Danh mục dự án (sau ScanAI) · {cfg.short}
            </p>
          </div>
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-bold text-violet-800/70">
              {loading
                ? "Đang quét PDF — bảng sẽ cập nhật sau khi xong…"
                : "Chưa có dữ liệu dự án"}
            </p>
            <p className="mt-1 text-xs text-violet-500/70">
              Chọn PDF Giao A và bấm Quét dữ liệu
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function FileTextIcon() {
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
