"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDialog } from "@/components/AppDialog";

export default function NhapDuAnPage() {
  const router = useRouter();
  const { showConfirm, showAlert } = useAppDialog();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);

  async function handleScan() {
    if (!file) {
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
      form.append("file", file);
      const res = await fetch("/api/giao-a/ingest", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: {
          qd_giao_a_id: string;
          warnings?: string[];
          trung_ten_count?: number;
        };
      };
      setPercent(100);
      if (!json.ok || !json.data?.qd_giao_a_id) {
        throw new Error(json.error ?? "Scan thất bại");
      }

      const qdId = json.data.qd_giao_a_id;
      const warns = json.data.warnings?.filter(Boolean) ?? [];
      if (warns.length) {
        const ok = await showConfirm(`• ${warns.join("\n• ")}`, {
          title: "Cảnh báo khi nhập",
          variant: "warning",
          confirmLabel: "Tiếp tục Review",
          cancelLabel: "Hủy",
        });
        if (!ok) {
          await fetch(`/api/giao-a/${qdId}`, { method: "DELETE" });
          setPercent(0);
          await showAlert(
            "Đã hủy hồ sơ vừa quét — không lưu dự án trùng vào hệ thống.",
            { title: "Đã hủy", variant: "info" },
          );
          return;
        }
      }
      router.push(`/giao-a/${qdId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      setPercent(0);
    } finally {
      window.clearInterval(tick);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f3f4f6] antialiased">
      {/* Khuông header — trắng lạnh */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm md:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600">
            <FileTextIcon />
          </div>
          <div>
            <h1 className="text-[17px] leading-none font-black tracking-tight text-slate-800 uppercase">
              Nhập thông tin dự án mới
            </h1>
            <p className="mt-1.5 text-[11px] leading-none font-semibold tracking-wider text-slate-400 uppercase">
              Tải lên file Giao A (PDF) để ScanAI nhận dạng danh mục dự án
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-200"
        >
          ← Về Quản lý dự án
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-5 px-4 py-6 md:px-8">
        {/* Khuông upload — pastel sky */}
        <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50/80 p-5 shadow-sm">
          <p className="mb-3 text-[11px] font-bold tracking-wider text-sky-700 uppercase">
            Tải file &amp; quét
          </p>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="w-full flex-1">
              <div
                className={`relative overflow-hidden rounded-xl border transition-colors ${
                  loading
                    ? "border-sky-300 bg-white"
                    : "border-sky-200 bg-white/90"
                }`}
              >
                {loading ? (
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 bg-sky-200/60 transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                ) : null}
                <div className="relative flex min-h-[44px] items-center gap-3 px-3 py-2.5">
                  <label
                    htmlFor="pdf-upload-input"
                    className={`shrink-0 rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-colors select-none ${
                      loading
                        ? "cursor-not-allowed bg-indigo-300"
                        : "cursor-pointer bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    Chọn Tệp
                  </label>
                  <span
                    className={`flex-1 truncate text-xs ${
                      loading
                        ? "font-semibold text-sky-900"
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
                    <span className="min-w-[36px] shrink-0 text-right text-xs font-black text-sky-700 tabular-nums">
                      {percent}%
                    </span>
                  ) : null}
                </div>
                <input
                  id="pdf-upload-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={loading}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={loading || !file}
              onClick={() => void handleScan()}
              className={`flex w-full shrink-0 items-center justify-center rounded-xl px-8 py-3 text-sm font-bold text-white shadow-sm transition-all md:w-auto ${
                loading || !file
                  ? "cursor-not-allowed bg-sky-300"
                  : "cursor-pointer bg-sky-600 hover:bg-sky-700 hover:shadow-md"
              }`}
            >
              {loading ? "Đang quét dữ liệu…" : "Quét dữ liệu"}
            </button>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {/* Khuông bảng — pastel violet */}
        <section className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
          <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50/60 px-4 py-2.5">
            <p className="text-[11px] font-bold tracking-wider text-violet-700 uppercase">
              Danh mục dự án (sau ScanAI)
            </p>
          </div>
          <div className="max-h-[650px] overflow-auto">
            <table className="relative w-full min-w-[1100px] border-collapse text-left text-[13px] [&_td]:border-r [&_td]:border-b [&_td]:border-violet-100/80 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-b [&_th]:border-violet-200 [&_th:last-child]:border-r-0">
              <thead className="sticky top-0 z-10 bg-violet-100 text-[12px] font-extrabold tracking-wide text-violet-900 uppercase shadow-sm">
                <tr>
                  <th className="w-11 bg-violet-100 px-2 py-3 text-center">STT</th>
                  <th className="bg-violet-100 px-3 py-3 text-center">Tên dự án</th>
                  <th className="w-[120px] bg-violet-100 px-2 py-3 text-center">
                    Địa điểm
                  </th>
                  <th className="bg-violet-100 px-3 py-3 text-center">Quy mô</th>
                  <th className="w-[110px] bg-violet-100 px-2 py-3 text-center">
                    Cấp điện áp
                  </th>
                  <th className="w-[168px] bg-violet-100 px-2 py-3 text-center leading-tight">
                    Định hướng giao
                  </th>
                  <th className="w-14 bg-violet-100 px-1 py-3 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#faf8ff]">
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-sm font-bold text-violet-800/70">
                      {loading
                        ? "Đang quét PDF — bảng sẽ cập nhật sau khi xong…"
                        : "Chưa có dữ liệu dự án"}
                    </p>
                    <p className="mt-1 text-xs text-violet-500/70">
                      Chọn PDF Giao A và bấm Quét dữ liệu
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Chân bảng — pastel amber */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/70 px-4 py-3">
            <span className="text-xs font-medium text-amber-800/70">0 dự án</span>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl bg-amber-400/50 px-6 py-2.5 text-sm font-bold text-amber-900/60"
            >
              Lưu tất cả vào CSDL
            </button>
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
