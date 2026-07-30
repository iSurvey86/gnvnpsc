"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDialog } from "@/components/AppDialog";
import { normalizeDiaDiem } from "@/lib/dia-diem";
import {
  badgeClassLoaiHinh,
  labelLoaiHinhTuVan,
  LOAI_HINH_TU_VAN_OPTIONS,
  resolveLoaiHinhTuVan,
  type LoaiHinhTuVan,
} from "@/lib/loai-hinh-tu-van";
import type { CapDienAp, HuongGiao } from "@/lib/types";

type QdGiaoARef = {
  id: string;
  so_qd: string | null;
  ngay_qd: string | null;
  scan_status: string;
} | null;

type QdXnRef = {
  id: string;
  loai: string;
  trang_thai: string;
  so_qd_du_thao: string | null;
  xi_nghiep:
    | { id: string; ten: string; ma: string | null }
    | { id: string; ten: string; ma: string | null }[]
    | null;
};

export type DuAnRow = {
  id: string;
  ma_du_an: string | null;
  ten_du_an: string;
  dia_diem: string | null;
  quy_mo: string | null;
  goi_cong_viec: string | null;
  cap_dien_ap: CapDienAp | null;
  huong_giao: HuongGiao | null;
  xi_nghiep_id: string | null;
  qd_giao_a_id: string | null;
  created_at: string;
  qd_giao_a: QdGiaoARef | QdGiaoARef[];
  /** Xí nghiệp chọn trên danh mục (chưa chắc đã lập QĐ) */
  xi_nghiep:
    | { id: string; ten: string; ma: string | null }
    | { id: string; ten: string; ma: string | null }[]
    | null;
  qd_giao_xn: QdXnRef[] | null;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export function DuAnDashboard() {
  const { showAlert, showConfirm } = useAppDialog();
  const [rows, setRows] = useState<DuAnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterQdGiaoA, setFilterQdGiaoA] = useState("");
  const [filterDiaDiem, setFilterDiaDiem] = useState("");
  const [filterLoaiXn, setFilterLoaiXn] = useState("");
  const [filterLoaiHinh, setFilterLoaiHinh] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pageSize = 20;

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/du-an");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lỗi tải");
      setRows((json.data ?? []) as DuAnRow[]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Lỗi tải");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const qd = filterQdGiaoA.trim().toLowerCase();
    const dd = filterDiaDiem.trim().toLowerCase();

    return rows.filter((r) => {
      const giaoA = one(r.qd_giao_a);
      const xns = r.qd_giao_xn ?? [];
      if (q) {
        const hay = `${r.ten_du_an} ${r.ma_du_an ?? ""} ${r.dia_diem ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (qd) {
        const so = (giaoA?.so_qd ?? "").toLowerCase();
        if (!so.includes(qd)) return false;
      }
      if (dd) {
        if (!(r.dia_diem ?? "").toLowerCase().includes(dd)) return false;
      }
      if (filterLoaiXn === "tvtk" && !xns.some((x) => x.loai === "tvtk")) return false;
      if (filterLoaiXn === "thi_nghiem" && !xns.some((x) => x.loai === "thi_nghiem"))
        return false;
      if (filterLoaiXn === "chua" && xns.length > 0) return false;
      if (filterLoaiHinh) {
        const tags = resolveLoaiHinhTuVan(r.huong_giao, r.cap_dien_ap);
        if (!tags.includes(filterLoaiHinh as LoaiHinhTuVan)) return false;
      }
      return true;
    });
  }, [rows, searchTerm, filterQdGiaoA, filterDiaDiem, filterLoaiXn, filterLoaiHinh]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterQdGiaoA, filterDiaDiem, filterLoaiXn, filterLoaiHinh]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setFilterQdGiaoA("");
    setFilterDiaDiem("");
    setFilterLoaiXn("");
    setFilterLoaiHinh("");
  };

  async function deleteDuAn(id: string, ten: string) {
    const ok = await showConfirm(
      `Xóa dự án «${ten}»?\nChỉ xóa được khi chưa có QĐ giao Xí nghiệp.`,
      {
        title: "Xác nhận xóa",
        variant: "warning",
        confirmLabel: "Xóa",
        cancelLabel: "Hủy",
      },
    );
    if (!ok) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/du-an/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Xóa thất bại");
      await fetchProjects();
    } catch (err) {
      await showAlert(err instanceof Error ? err.message : "Xóa thất bại", {
        title: "Lỗi",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const hasAdv =
    Boolean(filterQdGiaoA) ||
    Boolean(filterDiaDiem) ||
    Boolean(filterLoaiXn) ||
    Boolean(filterLoaiHinh);

  return (
    <div className="relative z-0 mx-auto flex min-h-full w-full max-w-[1600px] flex-1 flex-col space-y-4 p-6 antialiased">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-teal-600 uppercase">Phân hệ</p>
          <h2 className="mt-0.5 text-lg font-bold text-sky-800 uppercase">
            Giao nhiệm vụ tư vấn thiết kế
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-xs font-bold text-teal-800 shadow-sm hover:bg-teal-50"
          >
            ← Chọn phân hệ
          </Link>
          <Link href="/nhap-du-an">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-teal-500 bg-teal-50 px-6 py-2.5 text-sm font-bold text-teal-800 shadow-sm transition-all hover:bg-teal-100 hover:shadow-md"
            >
              <span className="text-base leading-none">🆕</span>
              Nhập Dự án (Giao A)
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-1 flex flex-col gap-3 xl:flex-row">
        <div className="relative flex w-full items-center rounded-lg border border-teal-200 bg-teal-50/80 p-2 shadow-sm xl:w-[28%]">
          <div className="pointer-events-none absolute left-4 text-teal-500">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm chung (tên, mã, địa điểm)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-teal-200 bg-white py-2 pr-8 pl-8 text-[13px] font-medium text-gray-800 shadow-sm placeholder:font-normal placeholder-gray-500 transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-400 focus:outline-none"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-4 cursor-pointer text-rose-400 transition hover:text-rose-600"
              title="Xóa tìm kiếm"
            >
              <XIcon />
            </button>
          ) : null}
        </div>

        <div className="relative flex flex-1 items-center rounded-lg border border-rose-200 bg-rose-50/80 p-2 shadow-sm">
          <div className="pointer-events-none absolute left-4 hidden text-rose-400 lg:block">
            <FilterIcon />
          </div>
          <div className="flex w-full gap-2 overflow-x-auto pb-1 pl-0 lg:pb-0 lg:pl-8">
            <input
              type="text"
              placeholder="Số QĐ Giao A..."
              value={filterQdGiaoA}
              onChange={(e) => setFilterQdGiaoA(e.target.value)}
              className="min-w-[120px] flex-1 rounded border border-rose-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-800 shadow-sm placeholder:font-normal placeholder-gray-500 focus:border-rose-300 focus:ring-1 focus:ring-rose-300 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Địa điểm..."
              value={filterDiaDiem}
              onChange={(e) => setFilterDiaDiem(e.target.value)}
              className="min-w-[140px] flex-1 rounded border border-rose-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-800 shadow-sm placeholder:font-normal placeholder-gray-500 focus:border-rose-300 focus:ring-1 focus:ring-rose-300 focus:outline-none"
            />
            <select
              value={filterLoaiHinh}
              onChange={(e) => setFilterLoaiHinh(e.target.value)}
              className="min-w-[150px] cursor-pointer rounded border border-rose-200 bg-white px-2 py-2 text-[13px] font-medium text-gray-600 shadow-sm focus:border-rose-300 focus:ring-1 focus:ring-rose-300 focus:outline-none"
            >
              <option value="">Loại hình tư vấn</option>
              {LOAI_HINH_TU_VAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={filterLoaiXn}
              onChange={(e) => setFilterLoaiXn(e.target.value)}
              className="min-w-[160px] cursor-pointer rounded border border-rose-200 bg-white px-2 py-2 text-[13px] font-medium text-gray-600 shadow-sm focus:border-rose-300 focus:ring-1 focus:ring-rose-300 focus:outline-none"
            >
              <option value="">Trạng thái giao XN</option>
              <option value="chua">Chưa giao XN</option>
              <option value="tvtk">Đã có TVTK</option>
              <option value="thi_nghiem">Đã có Thí nghiệm</option>
            </select>
            {hasAdv ? (
              <button
                type="button"
                onClick={clearFilters}
                className="flex shrink-0 cursor-pointer items-center justify-center rounded border border-red-200 bg-red-50 px-3 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                title="Xóa lọc nâng cao"
              >
                <XIcon />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="min-h-[58vh] flex-1 overflow-auto">
          <table className="relative min-w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-teal-700 text-center text-xs font-semibold tracking-wide text-white uppercase shadow-md">
              <tr>
                <th className="w-12 border-r border-teal-800 px-3 py-3.5">STT</th>
                <th className="border-r border-teal-800 px-4 py-3.5">
                  Tên dự án
                </th>
                <th className="w-44 whitespace-nowrap border-r border-teal-800 px-3 py-3.5">
                  Loại hình tư vấn
                </th>
                <th className="w-24 border-r border-teal-800 px-2 py-3.5">
                  Địa điểm
                </th>
                <th className="w-44 border-r border-teal-800 px-3 py-3.5">
                  Giao A
                </th>
                <th className="w-48 border-r border-teal-800 px-3 py-3.5">
                  Giao Xí nghiệp
                </th>
                <th className="w-44 px-3 py-3.5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center font-medium text-gray-500"
                  >
                    Đang tải dữ liệu dự án...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                        <p className="mb-1 font-bold">
                          Không tải được dữ liệu — kiểm tra Supabase
                        </p>
                        <p className="font-mono text-xs text-red-500">
                          {loadError}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void fetchProjects()}
                        className="rounded bg-teal-600 px-4 py-1.5 font-medium text-white shadow-sm transition hover:bg-teal-700"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center font-medium text-gray-500"
                  >
                    {rows.length === 0 ? (
                      <>
                        Chưa có dự án.{" "}
                        <Link
                          href="/nhap-du-an"
                          className="font-bold text-teal-700 hover:underline"
                        >
                          Nhập Dự án (Giao A)
                        </Link>
                      </>
                    ) : (
                      "Không tìm thấy dự án phù hợp bộ lọc."
                    )}
                  </td>
                </tr>
              ) : (
                current.map((r, idx) => {
                  const giaoA = one(r.qd_giao_a);
                  const xns = r.qd_giao_xn ?? [];
                  const loaiHinh = resolveLoaiHinhTuVan(
                    r.huong_giao,
                    r.cap_dien_ap,
                  );
                  const stt = (page - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-teal-50 transition-colors odd:bg-white even:bg-[#eef8f5] hover:bg-[#dcefea]"
                    >
                      <td className="px-3 py-3 text-center text-gray-600">
                        {stt}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <Link
                          href={`/du-an/${r.id}/giao-xn`}
                          className="font-semibold text-teal-800 hover:underline"
                        >
                          {r.ten_du_an}
                        </Link>
                        <p className="mt-0.5 text-xs font-medium text-gray-500">
                          {r.ma_du_an || "—"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {loaiHinh.length ? (
                          <div className="flex flex-col items-center gap-1">
                            {loaiHinh.map((tag) => (
                              <span
                                key={tag}
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClassLoaiHinh(tag)}`}
                              >
                                {labelLoaiHinhTuVan(tag)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center text-gray-700">
                        {normalizeDiaDiem(r.dia_diem) || "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {giaoA ? (
                          <a
                            href={`/api/giao-a/${giaoA.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-col items-center"
                            title="Xem PDF Giao A"
                          >
                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800 hover:underline">
                              {giaoA.so_qd || "Xem Giao A"}
                            </span>
                            <span className="mt-0.5 text-xs font-medium text-gray-400">
                              {giaoA.ngay_qd || ""}
                            </span>
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {xns.length === 0 ? (
                            one(r.xi_nghiep) ? (
                              <span
                                className="max-w-[11rem] text-sm leading-snug font-medium text-violet-800"
                                title="Xí nghiệp chọn trên danh mục — chưa lập QĐ"
                              >
                                {one(r.xi_nghiep)?.ten}
                                <span className="mt-0.5 block text-[11px] font-semibold text-violet-500">
                                  Chưa lập QĐ
                                </span>
                              </span>
                            ) : (
                              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
                                Chưa giao
                              </span>
                            )
                          ) : (
                            xns.map((x) => {
                              const xn = one(x.xi_nghiep);
                              const tenXn = xn?.ten?.trim() || "Chưa chọn XN";
                              return (
                                <span
                                  key={x.id}
                                  className="max-w-[11rem] text-sm leading-snug font-medium text-teal-900"
                                  title={`${tenXn} · ${x.loai === "tvtk" ? "TVTK" : "Thí nghiệm"}`}
                                >
                                  {tenXn}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          <Link
                            href={`/du-an/${r.id}/sua`}
                            className="inline-flex rounded-lg p-1.5 text-teal-700 transition hover:bg-teal-50"
                            title="Sửa thông tin chung"
                          >
                            <PencilIcon />
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === r.id}
                            onClick={() => void deleteDuAn(r.id, r.ten_du_an)}
                            className="inline-flex rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                            title="Xóa dự án"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-teal-50 bg-[#ecfdf5] px-4 py-2.5 text-xs text-teal-800/70">
          <span>
            Hiển thị {current.length}/{filtered.length} · Tổng danh mục{" "}
            {rows.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold disabled:opacity-40"
            >
              Trước
            </button>
            <span className="font-bold text-slate-700">
              {page}/{totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
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
