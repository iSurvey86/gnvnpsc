"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NhanSu } from "@/lib/types";
import type { NhatKyHoatDong } from "@/lib/activity-log";

type Tab = "logs" | "accounts";

type Props = {
  isAdmin: boolean;
};

const PHAN_HE_OPTS = [
  "ALL",
  "XAC_THUC",
  "DA",
  "GIAO_A",
  "GIAO_XN",
  "HE_THONG",
  "SYSTEM",
] as const;

const HANH_DONG_OPTS = [
  "ALL",
  "LOGIN",
  "LOGIN_FAIL",
  "LOGOUT",
  "CREATE",
  "UPDATE",
  "DELETE",
  "EXPORT",
  "SCAN",
  "CAP_DANG_NHAP",
  "DOI_MK",
] as const;

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function badgePhanHe(p: string): string {
  if (p === "XAC_THUC") return "bg-sky-100 text-sky-800";
  if (p === "DA" || p === "GIAO_A" || p === "GIAO_XN")
    return "bg-teal-100 text-teal-800";
  if (p === "HE_THONG" || p === "SYSTEM") return "bg-amber-100 text-amber-900";
  return "bg-rose-100 text-rose-800";
}

function badgeHanhDong(h: string): string {
  if (h === "LOGIN") return "bg-sky-100 text-sky-800";
  if (h === "LOGIN_FAIL" || h === "LOGOUT") return "bg-orange-100 text-orange-800";
  if (h === "EXPORT" || h === "SCAN") return "bg-teal-100 text-teal-800";
  if (h === "CAP_DANG_NHAP" || h === "DOI_MK") return "bg-amber-100 text-amber-900";
  return "bg-rose-50 text-rose-800";
}

/** Sắp xếp mã NV: KD01 < KD02 < … < KD17 (số tăng dần trong cùng tiền tố). */
function compareMaNv(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  const aa = (a ?? "").trim().toUpperCase();
  const bb = (b ?? "").trim().toUpperCase();
  if (!aa && !bb) return 0;
  if (!aa) return 1;
  if (!bb) return -1;
  const ma = /^([A-Za-z]+)(\d+)$/.exec(aa);
  const mb = /^([A-Za-z]+)(\d+)$/.exec(bb);
  if (ma && mb) {
    const prefix = ma[1].localeCompare(mb[1], "vi");
    if (prefix !== 0) return prefix;
    return Number(ma[2]) - Number(mb[2]);
  }
  return aa.localeCompare(bb, "vi", { numeric: true });
}

export function GiamSatHeThongClient({ isAdmin }: Props) {
  // Admin xem nhật ký; non-admin chỉ xem danh sách tài khoản
  const tab: Tab = isAdmin ? "logs" : "accounts";
  const [q, setQ] = useState("");
  const [phanHe, setPhanHe] = useState<string>("ALL");
  const [hanhDong, setHanhDong] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<NhatKyHoatDong[]>([]);
  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<NhanSu[]>([]);
  const [accQ, setAccQ] = useState("");
  const [accDaCap, setAccDaCap] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [capBusyId, setCapBusyId] = useState<string | null>(null);

  const pageCount = Math.max(1, Math.ceil(total / 20));

  const loadLogs = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
        phan_he: phanHe,
        hanh_dong: hanhDong,
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/nhat-ky?${params}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Lỗi tải nhật ký");
      setLogs(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải nhật ký");
    } finally {
      setBusy(false);
    }
  }, [page, phanHe, hanhDong, q]);

  const loadAccounts = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams({ da_cap: accDaCap });
      if (accQ.trim()) params.set("q", accQ.trim());
      const res = await fetch(`/api/tai-khoan?${params}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Lỗi tải tài khoản");
      setAccounts(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải tài khoản");
    } finally {
      setBusy(false);
    }
  }, [accQ, accDaCap]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (tab === "logs") void loadLogs();
      else void loadAccounts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tab, loadLogs, loadAccounts]);

  async function onCapDangNhap(id: string) {
    setCapBusyId(id);
    setError(null);
    setOkMsg(null);
    try {
      const res = await fetch(`/api/nhan-su/${id}/cap-dang-nhap`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Cấp login thất bại");
      setOkMsg(
        `Đã cấp / đặt lại đăng nhập. MK mặc định: ${json.default_password ?? "—"}`,
      );
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi cấp đăng nhập");
    } finally {
      setCapBusyId(null);
    }
  }

  function exportCsv() {
    const header = [
      "STT",
      "Thời gian",
      "Họ tên",
      "Email",
      "Phân hệ",
      "Hành động",
      "Chi tiết",
      "Trạng thái",
    ];
    const lines = logs.map((r, i) =>
      [
        i + 1,
        r.thoi_gian,
        r.ho_ten ?? "",
        r.email ?? "",
        r.phan_he,
        r.hanh_dong,
        (r.chi_tiet_ngan ?? "").replace(/"/g, '""'),
        r.trang_thai,
      ]
        .map((c) => `"${c}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nhat-ky-hoat-dong-p${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredHint = useMemo(
    () => `Trang ${page} / ${pageCount} · ${total} dòng`,
    [page, pageCount, total],
  );

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) => compareMaNv(a.ma_nv, b.ma_nv)),
    [accounts],
  );

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {okMsg ? (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {okMsg}
        </p>
      ) : null}

      {tab === "logs" ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Tìm theo tên hoặc mô tả…"
              className="min-w-[200px] flex-1 rounded-xl border border-teal-200 bg-teal-50/40 px-3 py-2 text-sm text-teal-950 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            <select
              value={phanHe}
              onChange={(e) => {
                setPage(1);
                setPhanHe(e.target.value);
              }}
              className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-medium text-teal-900"
            >
              {PHAN_HE_OPTS.map((o) => (
                <option key={o} value={o}>
                  {o === "ALL" ? "Tất cả phân hệ" : o}
                </option>
              ))}
            </select>
            <select
              value={hanhDong}
              onChange={(e) => {
                setPage(1);
                setHanhDong(e.target.value);
              }}
              className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-medium text-teal-900"
            >
              {HANH_DONG_OPTS.map((o) => (
                <option key={o} value={o}>
                  {o === "ALL" ? "Tất cả hành động" : o}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => exportCsv()}
              className="rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100"
            >
              Xuất CSV
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void loadLogs()}
              className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-50 disabled:opacity-50"
            >
              Làm mới
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-teal-100 text-[11px] font-bold tracking-wide text-teal-900 uppercase">
                  <tr>
                    <th className="px-3 py-2.5">STT</th>
                    <th className="px-3 py-2.5">Người thực hiện</th>
                    <th className="px-3 py-2.5">Phân hệ</th>
                    <th className="px-3 py-2.5">Hành động</th>
                    <th className="px-3 py-2.5">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-8 text-center text-sm text-teal-700/70"
                      >
                        {busy
                          ? "Đang tải…"
                          : "Chưa có nhật ký — cần chạy SQL 010 trên Supabase."}
                      </td>
                    </tr>
                  ) : (
                    logs.map((r, i) => (
                      <tr
                        key={r.id}
                        className="border-t border-teal-100 odd:bg-white even:bg-teal-50/40"
                      >
                        <td className="px-3 py-2.5 tabular-nums text-teal-700">
                          {(page - 1) * 20 + i + 1}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-teal-950">
                            {r.ho_ten || "—"}
                          </p>
                          <p className="text-[11px] text-teal-700/70">
                            {r.email}
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${badgePhanHe(r.phan_he)}`}
                          >
                            {r.phan_he}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${badgeHanhDong(r.hanh_dong)}`}
                          >
                            {r.hanh_dong}
                          </span>
                          <p className="mt-1 text-[11px] text-teal-700/70">
                            {formatTime(r.thoi_gian)}
                          </p>
                        </td>
                        <td className="max-w-[360px] px-3 py-2.5">
                          <p className="text-teal-900">{r.chi_tiet_ngan}</p>
                          {r.du_lieu_dong &&
                          Object.keys(r.du_lieu_dong).length > 0 ? (
                            <p className="mt-1 truncate font-mono text-[10px] text-teal-600/80">
                              {JSON.stringify(r.du_lieu_dong)}
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-teal-100 bg-teal-50/50 px-3 py-2 text-xs text-teal-800">
              <span>{filteredHint}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || busy}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-teal-200 bg-white px-2 py-1 font-bold disabled:opacity-40"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={page >= pageCount || busy}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-teal-200 bg-white px-2 py-1 font-bold disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={accQ}
              onChange={(e) => setAccQ(e.target.value)}
              placeholder="Tìm tên, email, mã NV…"
              className="min-w-[200px] flex-1 rounded-xl border border-sky-200 bg-sky-50/40 px-3 py-2 text-sm text-sky-950 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            {isAdmin ? (
              <select
                value={accDaCap}
                onChange={(e) => setAccDaCap(e.target.value)}
                className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-medium text-sky-900"
              >
                <option value="all">Tất cả trạng thái cấp login</option>
                <option value="1">Đã cấp đăng nhập</option>
                <option value="0">Chưa cấp đăng nhập</option>
              </select>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => void loadAccounts()}
              className="rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-50 disabled:opacity-50"
            >
              Làm mới
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-sky-900">
                <thead className="bg-sky-100 text-xs font-semibold tracking-wide text-sky-900 uppercase">
                  <tr>
                    <th className="px-3 py-2.5 text-center">Mã NV</th>
                    <th className="px-3 py-2.5 text-center">Họ tên</th>
                    <th className="px-3 py-2.5 text-center">Email</th>
                    <th className="px-3 py-2.5 text-center">Số điện thoại</th>
                    {isAdmin ? (
                      <th className="px-3 py-2.5 text-center">Thao tác</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {sortedAccounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 5 : 4}
                        className="px-3 py-8 text-center text-sm font-medium text-sky-700/70"
                      >
                        {busy ? "Đang tải…" : "Không có tài khoản non-admin."}
                      </td>
                    </tr>
                  ) : (
                    sortedAccounts.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-sky-100 odd:bg-white even:bg-sky-50/40"
                      >
                        <td className="px-3 py-2.5 text-center tabular-nums">
                          {r.ma_nv || "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          {r.ho_ten}
                          {!r.active ? (
                            <span className="ml-2 rounded bg-rose-100 px-1.5 py-0.5 text-xs font-medium text-rose-700">
                              Ẩn
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5">{r.email}</td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {r.dien_thoai?.trim() || "—"}
                        </td>
                        {isAdmin ? (
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              disabled={!r.active || capBusyId === r.id}
                              onClick={() => void onCapDangNhap(r.id)}
                              title={
                                r.da_cap_dang_nhap
                                  ? "Đặt lại mật khẩu"
                                  : "Cấp đăng nhập"
                              }
                              aria-label={
                                r.da_cap_dang_nhap
                                  ? `Đặt lại mật khẩu cho ${r.ho_ten}`
                                  : `Cấp đăng nhập cho ${r.ho_ten}`
                              }
                              className={`transition disabled:opacity-40 ${
                                r.da_cap_dang_nhap
                                  ? "text-sky-600 hover:text-sky-800"
                                  : "text-slate-400 hover:text-sky-700"
                              }`}
                            >
                              {capBusyId === r.id ? "…" : <KeyIcon />}
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KeyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="inline-block size-4"
      aria-hidden="true"
    >
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8m-2 2 2 2m-5 1 2 2" />
    </svg>
  );
}
