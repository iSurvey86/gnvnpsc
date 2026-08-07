"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDialog } from "@/components/AppDialog";
import { vietTatSoQdGiaoA, namTuNgayQd, type GiaoAListItem } from "@/lib/giao-a-theo-doi";
import { PHAN_HE, type PhanHeCode } from "@/lib/phan-he";
import { formatNgayVN } from "@/lib/word/format-ngay";

export function GiaoADashboard({
  phanHe = "tvtk",
}: {
  phanHe?: PhanHeCode;
}) {
  const cfg = PHAN_HE[phanHe];
  const t = cfg.theme;
  const { showAlert, showConfirm } = useAppDialog();
  const [rows, setRows] = useState<GiaoAListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterNam, setFilterNam] = useState("");
  const [filterNguoiQuet, setFilterNguoiQuet] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [canXoaGiaoA, setCanXoaGiaoA] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    void fetch("/api/me")
      .then((r) => r.json())
      .then((json) => {
        if (json?.ok) setCanXoaGiaoA(Boolean(json.data?.can_xoa_giao_a));
      })
      .catch(() => setCanXoaGiaoA(false));
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/giao-a?phan_he=${phanHe}`);
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Không tải được danh sách Giao A");
      }
      setRows((json.data ?? []) as GiaoAListItem[]);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Lỗi tải");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [phanHe]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const namOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const nam = namTuNgayQd(r.ngay_qd);
      if (nam !== "—") set.add(nam);
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [rows]);

  const nguoiQuetOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const ten = r.scanned_by_ho_ten?.trim();
      if (ten) set.add(ten);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "vi"));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterNam) {
        if (namTuNgayQd(r.ngay_qd) !== filterNam) return false;
      }
      if (filterNguoiQuet) {
        if ((r.scanned_by_ho_ten?.trim() || "") !== filterNguoiQuet) return false;
      }
      if (!q) return true;
      const so = (r.so_qd ?? "").toLowerCase();
      const nguoi = (r.scanned_by_ho_ten ?? "").toLowerCase();
      const ngay = r.ngay_qd ? formatNgayVN(r.ngay_qd).toLowerCase() : "";
      return so.includes(q) || nguoi.includes(q) || ngay.includes(q);
    });
  }, [rows, search, filterNam, filterNguoiQuet]);

  useEffect(() => {
    setPage(1);
  }, [search, filterNam, filterNguoiQuet, phanHe]);

  useEffect(() => {
    setFilterNam("");
    setFilterNguoiQuet("");
    setSearch("");
  }, [phanHe]);

  const hasFilter = Boolean(filterNam || filterNguoiQuet);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function onDelete(r: GiaoAListItem) {
    const label = r.ngay_qd
      ? `${vietTatSoQdGiaoA(r.so_qd)} ngày ${formatNgayVN(r.ngay_qd)}`
      : vietTatSoQdGiaoA(r.so_qd);
    const ok = await showConfirm(
      `Xóa Giao A «${label}»?\nSẽ xóa hồ sơ và các công trình thuộc Giao A này.\nChỉ xóa được khi chưa có quyết định giao Xí nghiệp.`,
      {
        title: "Xóa Giao A",
        variant: "warning",
        confirmLabel: "Xóa",
        cancelLabel: "Hủy",
      },
    );
    if (!ok) return;
    setDeletingId(r.id);
    try {
      const res = await fetch(`/api/giao-a/${r.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Xóa thất bại");
      }
      setRows((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      await showAlert(e instanceof Error ? e.message : "Xóa thất bại", {
        title: "Không xóa được",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const colSpan = 6;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className={`text-sm font-bold tracking-wide uppercase ${t.primaryText}`}>
          Phân hệ giao nhiệm vụ {cfg.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${t.btnOutline}`}
          >
            ← Chọn phân hệ
          </Link>
          <Link
            href={cfg.nhapDuAnHref}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm ${t.primary} hover:opacity-90`}
          >
            + Nhập Dự án (Giao A)
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm số Giao A, ngày…"
          className={`min-w-[14rem] flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-1 ${t.searchBorder} ${t.searchBg}`}
        />
        <select
          value={filterNam}
          onChange={(e) => setFilterNam(e.target.value)}
          className={`min-w-[7.5rem] cursor-pointer rounded-lg border bg-white px-2.5 py-2 text-[13px] outline-none focus:ring-1 ${t.searchBorder}`}
          title="Lọc theo năm quyết định"
          aria-label="Lọc theo năm"
        >
          <option value="">Năm</option>
          {namOptions.map((nam) => (
            <option key={nam} value={nam}>
              {nam}
            </option>
          ))}
        </select>
        <select
          value={filterNguoiQuet}
          onChange={(e) => setFilterNguoiQuet(e.target.value)}
          className={`min-w-[11rem] cursor-pointer rounded-lg border bg-white px-2.5 py-2 text-[13px] outline-none focus:ring-1 ${t.searchBorder}`}
          title="Lọc theo người quét"
          aria-label="Lọc theo người quét"
        >
          <option value="">Người quét</option>
          {nguoiQuetOptions.map((ten) => (
            <option key={ten} value={ten}>
              {ten}
            </option>
          ))}
        </select>
        {hasFilter ? (
          <button
            type="button"
            onClick={() => {
              setFilterNam("");
              setFilterNguoiQuet("");
            }}
            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-100"
            title="Bỏ lọc năm / người quét"
          >
            Bỏ lọc
          </button>
        ) : null}
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-white shadow-sm ${t.border}`}
      >
        <div className="min-h-[58vh] flex-1 overflow-auto">
          <table className="min-w-full border-collapse text-left text-[13px]">
            <thead
              className={`sticky top-0 z-10 text-center text-[11px] font-semibold tracking-wide uppercase ${t.headerBg} ${t.headerText}`}
            >
              <tr>
                <th className="w-14 px-2 py-2.5">STT</th>
                <th className="min-w-[14rem] px-2 py-2.5">Giao A</th>
                <th className="min-w-[10rem] px-2 py-2.5">Người quét</th>
                <th className="w-28 px-2 py-2.5">Số công trình</th>
                <th className="w-28 px-2 py-2.5">Đã giao</th>
                <th className="w-24 px-2 py-2.5">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-12 text-center text-slate-500">
                    Đang tải danh sách Giao A…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center">
                    <p className="text-red-600">{loadError}</p>
                    <button
                      type="button"
                      onClick={() => void fetchList()}
                      className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-medium text-white ${t.primary}`}
                    >
                      Thử lại
                    </button>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-12 text-center text-slate-500">
                    Chưa có Quyết định Giao A nào trong phân hệ này.
                  </td>
                </tr>
              ) : (
                pageRows.map((r, i) => {
                  const stt = (page - 1) * pageSize + i + 1;
                  const href = `/giao-a/${r.id}/theo-doi?phan_he=${phanHe}`;
                  const suaHref = `/giao-a/${r.id}?phan_he=${phanHe}`;
                  const labelGiaoA = r.ngay_qd
                    ? `${vietTatSoQdGiaoA(r.so_qd)} ngày ${formatNgayVN(r.ngay_qd)}`
                    : vietTatSoQdGiaoA(r.so_qd);
                  const daGiaoHet =
                    r.tong_ct > 0 && r.da_giao_ct >= r.tong_ct;
                  return (
                    <tr
                      key={r.id}
                      className={`border-t border-slate-100 ${t.rowOdd} ${t.rowEven} ${t.rowHover}`}
                    >
                      <td className="px-2 py-2 text-center tabular-nums">{stt}</td>
                      <td className="px-2 py-2">
                        <Link
                          href={href}
                          className={`font-semibold hover:underline ${t.primaryText}`}
                        >
                          {labelGiaoA}
                        </Link>
                      </td>
                      <td className="px-2 py-2">
                        {r.scanned_by_ho_ten?.trim() || "—"}
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums font-medium">
                        {r.tong_ct}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                            daGiaoHet
                              ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200"
                              : "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                          }`}
                          title="Số công trình đã giao / tổng"
                        >
                          {r.da_giao_ct}/{r.tong_ct} CT
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="inline-flex items-center justify-center gap-0.5">
                          <Link
                            href={suaHref}
                            className={`inline-flex p-1 transition ${t.softText} hover:opacity-70`}
                            title="Sửa / bổ sung thông tin Giao A (cấp điện áp, loại hình…)"
                            aria-label="Sửa Giao A"
                          >
                            <PencilIcon />
                          </Link>
                          {canXoaGiaoA ? (
                            <button
                              type="button"
                              disabled={deletingId === r.id}
                              onClick={() => void onDelete(r)}
                              className="inline-flex p-1 text-rose-500 transition hover:text-rose-700 disabled:opacity-50"
                              title="Xóa Giao A"
                              aria-label="Xóa Giao A"
                            >
                              {deletingId === r.id ? (
                                <span className="text-[11px]">…</span>
                              ) : (
                                <TrashIcon />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div
          className={`flex items-center justify-between border-t px-3 py-2 text-[12px] ${t.footerBg} ${t.footerText}`}
        >
          <span>
            {filtered.length} Giao A
            {search.trim() ? ` (lọc từ ${rows.length})` : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border px-2 py-0.5 disabled:opacity-40"
            >
              Trước
            </button>
            <span>
              {page}/{totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border px-2 py-0.5 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
