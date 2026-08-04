"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAppDialog } from "@/components/AppDialog";
import { normalizeDiaDiem } from "@/lib/dia-diem";
import { formatNgayVN } from "@/lib/word/format-ngay";
import {
  badgeClassLoaiHinh,
  labelLoaiHinhTuVan,
  LOAI_HINH_TU_VAN_OPTIONS,
  resolveLoaiHinhTuVan,
  shortLoaiHinhTuVan,
  type LoaiHinhTuVan,
} from "@/lib/loai-hinh-tu-van";
import {
  LOAI_HINH_DU_AN_OPTIONS,
  resolveLoaiHinhDuAn,
} from "@/lib/loai-hinh-du-an";
import type { CapDienAp, HuongGiao, LoaiHinhDuAn } from "@/lib/types";
import { PHAN_HE, type PhanHeCode } from "@/lib/phan-he";

type ColKey =
  | "stt"
  | "ten"
  | "loaiTv"
  | "diaDiem"
  | "giaoA"
  | "thaoTac";

const COL_ORDER: ColKey[] = [
  "stt",
  "ten",
  "loaiTv",
  "diaDiem",
  "giaoA",
  "thaoTac",
];

const COL_DEFAULT: Record<ColKey, number> = {
  stt: 48,
  ten: 480,
  loaiTv: 88,
  diaDiem: 100,
  giaoA: 140,
  thaoTac: 64,
};

const COL_MIN: Record<ColKey, number> = {
  stt: 40,
  ten: 200,
  loaiTv: 56,
  diaDiem: 64,
  giaoA: 96,
  thaoTac: 52,
};

const COL_STORAGE_KEY = "gnvnpsc.du-an-dashboard.col-widths";

function loadColWidths(): Record<ColKey, number> {
  if (typeof window === "undefined") return { ...COL_DEFAULT };
  try {
    const raw = localStorage.getItem(COL_STORAGE_KEY);
    if (!raw) return { ...COL_DEFAULT };
    const parsed = JSON.parse(raw) as Partial<Record<ColKey, number>>;
    const next = { ...COL_DEFAULT };
    for (const k of COL_ORDER) {
      const v = parsed[k];
      if (typeof v === "number" && Number.isFinite(v)) {
        next[k] = Math.max(COL_MIN[k], Math.round(v));
      }
    }
    return next;
  } catch {
    return { ...COL_DEFAULT };
  }
}

type QdGiaoARef = {
  id: string;
  so_qd: string | null;
  ngay_qd: string | null;
  scan_status: string;
  scanned_by_ho_ten?: string | null;
} | null;

type QdXnRef = {
  id: string;
  loai: string;
  trang_thai: string;
  so_qd_du_thao: string | null;
  pdf_ky_storage_path?: string | null;
  /** Dự án chủ sở hữu QĐ — có khi lấy từ map phủ */
  du_an_id?: string;
  /** true = dự án này chỉ được phủ bởi QĐ của dự án khác */
  mapped?: boolean;
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
  loai_hinh_du_an?: LoaiHinhDuAn | null;
  huong_giao: HuongGiao | null;
  xi_nghiep_id: string | null;
  phan_he?: PhanHeCode;
  qd_giao_a_id: string | null;
  created_at: string;
  qd_giao_a: QdGiaoARef | QdGiaoARef[];
  /** Xí nghiệp chọn trên danh mục (chưa chắc đã lập QĐ) */
  xi_nghiep:
    | { id: string; ten: string; ma: string | null }
    | { id: string; ten: string; ma: string | null }[]
    | null;
  qd_giao_xn: QdXnRef[] | null;
  /** QĐ phủ công trình này (map nhiều DA → một QĐ) */
  qd_giao_xn_map?: QdXnRef[] | null;
};

/** QĐ gắn trực tiếp + QĐ phủ qua map (không trùng id). */
function effectiveQds(r: DuAnRow): QdXnRef[] {
  const owned = r.qd_giao_xn ?? [];
  const mapped = r.qd_giao_xn_map ?? [];
  const byId = new Map<string, QdXnRef>();
  for (const x of owned) {
    byId.set(x.id, { ...x, mapped: false });
  }
  for (const x of mapped) {
    if (!byId.has(x.id)) byId.set(x.id, { ...x, mapped: true });
  }
  return [...byId.values()];
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export function DuAnDashboard({
  phanHe = "tvtk",
}: {
  phanHe?: PhanHeCode;
}) {
  const cfg = PHAN_HE[phanHe];
  const t = cfg.theme;
  const { showAlert, showConfirm } = useAppDialog();
  const [rows, setRows] = useState<DuAnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterQdGiaoA, setFilterQdGiaoA] = useState("");
  const [filterDiaDiem, setFilterDiaDiem] = useState("");
  const [filterLoaiXn, setFilterLoaiXn] = useState("");
  const [filterLoaiHinh, setFilterLoaiHinh] = useState("");
  const [filterLoaiHinhDuAn, setFilterLoaiHinhDuAn] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [colWidths, setColWidths] = useState<Record<ColKey, number>>(COL_DEFAULT);
  const [colsReady, setColsReady] = useState(false);
  const colWidthsRef = useRef(colWidths);
  colWidthsRef.current = colWidths;
  const pageSize = 20;

  useEffect(() => {
    const id = window.setTimeout(() => {
      setColWidths(loadColWidths());
      setColsReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!colsReady) return;
    try {
      localStorage.setItem(COL_STORAGE_KEY, JSON.stringify(colWidths));
    } catch {
      /* ignore quota */
    }
  }, [colWidths, colsReady]);

  const startResize = useCallback((key: ColKey, clientX: number) => {
    const startW = colWidthsRef.current[key];
    const onMove = (e: MouseEvent) => {
      const next = Math.max(
        COL_MIN[key],
        Math.round(startW + (e.clientX - clientX)),
      );
      setColWidths((prev) =>
        prev[key] === next ? prev : { ...prev, [key]: next },
      );
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  const resetColWidths = useCallback(() => {
    setColWidths({ ...COL_DEFAULT });
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/du-an?phan_he=${phanHe}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lỗi tải");
      setRows((json.data ?? []) as DuAnRow[]);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Lỗi tải");
    } finally {
      setLoading(false);
    }
  }, [phanHe]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const qd = filterQdGiaoA.trim().toLowerCase();
    const dd = filterDiaDiem.trim().toLowerCase();

    return rows.filter((r) => {
      const giaoA = one(r.qd_giao_a);
      const xns = effectiveQds(r);
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
      if (
        filterLoaiHinhDuAn &&
        resolveLoaiHinhDuAn(r.cap_dien_ap, r.loai_hinh_du_an) !==
          filterLoaiHinhDuAn
      ) {
        return false;
      }
      return true;
    });
  }, [
    rows,
    searchTerm,
    filterQdGiaoA,
    filterDiaDiem,
    filterLoaiXn,
    filterLoaiHinh,
    filterLoaiHinhDuAn,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filterQdGiaoA,
    filterDiaDiem,
    filterLoaiXn,
    filterLoaiHinh,
    filterLoaiHinhDuAn,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setFilterQdGiaoA("");
    setFilterDiaDiem("");
    setFilterLoaiXn("");
    setFilterLoaiHinh("");
    setFilterLoaiHinhDuAn("");
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
    Boolean(filterLoaiHinh) ||
    Boolean(filterLoaiHinhDuAn);

  return (
    <div className="relative z-0 mx-auto flex min-h-full w-full max-w-[1600px] flex-1 flex-col space-y-4 p-6 antialiased">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-medium uppercase ${t.softText}`}>Phân hệ</p>
          <h2 className={`mt-0.5 text-lg font-semibold uppercase ${t.primaryText}`}>
            {cfg.titleFull}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className={`rounded-xl px-4 py-2.5 text-xs font-medium shadow-sm ${t.btnOutline}`}
          >
            ← Chọn phân hệ
          </Link>
          <Link href={cfg.nhapDuAnHref}>
            <button
              type="button"
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium shadow-sm transition-all ${t.btnPrimary}`}
            >
              <span className="text-base leading-none">+</span>
              Nhập Dự án (Giao A)
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-1 flex flex-col gap-3 xl:flex-row">
        <div className={`relative flex w-full items-center rounded-lg border p-2 shadow-sm xl:w-[28%] ${t.searchBorder} ${t.searchBg}`}>
          <div className={`pointer-events-none absolute left-4 ${t.softText}`}>
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm chung (tên, mã, địa điểm)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded border bg-white py-2 pr-8 pl-8 text-[13px] font-normal text-gray-800 shadow-sm placeholder:font-light placeholder-gray-500 transition-all focus:ring-2 focus:outline-none ${t.searchBorder}`}
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

        <div className={`relative flex flex-1 items-center rounded-lg border p-2 shadow-sm ${t.filterBorder} ${t.filterBg}`}>
          <div className={`pointer-events-none absolute left-4 hidden lg:block ${t.softText}`}>
            <FilterIcon />
          </div>
          <div className="flex w-full gap-2 overflow-x-auto pb-1 pl-0 lg:pb-0 lg:pl-8">
            <input
              type="text"
              placeholder="Số QĐ Giao A..."
              value={filterQdGiaoA}
              onChange={(e) => setFilterQdGiaoA(e.target.value)}
              className={`min-w-[120px] flex-1 rounded border bg-white px-3 py-2 text-[13px] font-normal text-gray-800 shadow-sm placeholder:font-normal placeholder-gray-500 focus:outline-none ${t.filterBorder}`}
            />
            <input
              type="text"
              placeholder="Địa điểm..."
              value={filterDiaDiem}
              onChange={(e) => setFilterDiaDiem(e.target.value)}
              className={`min-w-[140px] flex-1 rounded border bg-white px-3 py-2 text-[13px] font-normal text-gray-800 shadow-sm placeholder:font-normal placeholder-gray-500 focus:outline-none ${t.filterBorder}`}
            />
            <select
              value={filterLoaiHinh}
              onChange={(e) => setFilterLoaiHinh(e.target.value)}
              className={`min-w-[150px] cursor-pointer rounded border bg-white px-2 py-2 text-[13px] font-normal text-gray-600 shadow-sm focus:outline-none ${t.filterBorder}`}
            >
              <option value="">Loại hình tư vấn</option>
              {LOAI_HINH_TU_VAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={filterLoaiHinhDuAn}
              onChange={(e) => setFilterLoaiHinhDuAn(e.target.value)}
              className={`min-w-[140px] cursor-pointer rounded border bg-white px-2 py-2 text-[13px] font-normal text-gray-600 shadow-sm focus:outline-none ${t.filterBorder}`}
            >
              <option value="">Loại hình dự án</option>
              {LOAI_HINH_DU_AN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.short}
                </option>
              ))}
            </select>
            <select
              value={filterLoaiXn}
              onChange={(e) => setFilterLoaiXn(e.target.value)}
              className={`min-w-[160px] cursor-pointer rounded border bg-white px-2 py-2 text-[13px] font-normal text-gray-600 shadow-sm focus:outline-none ${t.filterBorder}`}
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
          <table
            className="relative border-collapse text-left"
            style={{
              tableLayout: "fixed",
              width: COL_ORDER.reduce((s, k) => s + colWidths[k], 0),
              minWidth: "100%",
            }}
          >
            <colgroup>
              {COL_ORDER.map((k) => (
                <col key={k} style={{ width: colWidths[k] }} />
              ))}
            </colgroup>
            <thead
              className={`sticky top-0 z-10 text-center text-xs font-medium tracking-wide uppercase shadow-md ${t.headerBg} ${t.headerText}`}
            >
              <tr>
                <ResizableTh
                  label="STT"
                  colKey="stt"
                  onResizeStart={startResize}
                />
                <ResizableTh
                  label="Tên dự án"
                  colKey="ten"
                  onResizeStart={startResize}
                />
                <ResizableTh
                  label={
                    <>
                      Loại hình
                      <br />
                      tư vấn
                    </>
                  }
                  colKey="loaiTv"
                  onResizeStart={startResize}
                />
                <ResizableTh
                  label="Địa điểm"
                  colKey="diaDiem"
                  onResizeStart={startResize}
                />
                <ResizableTh
                  label="Giao A"
                  colKey="giaoA"
                  onResizeStart={startResize}
                />
                <ResizableTh
                  label="Thao tác"
                  colKey="thaoTac"
                  onResizeStart={startResize}
                  resizable={false}
                />
              </tr>
            </thead>
            <tbody className="text-sm font-normal text-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center font-medium text-gray-500"
                  >
                    Đang tải dữ liệu dự án...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
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
                    colSpan={6}
                    className="px-4 py-12 text-center font-medium text-gray-500"
                  >
                    {rows.length === 0 ? (
                      <>
                        Chưa có dự án.{" "}
                        <Link
                          href={cfg.nhapDuAnHref}
                          className={`font-bold hover:underline ${t.primaryText}`}
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
                  const loaiHinh = resolveLoaiHinhTuVan(
                    r.huong_giao,
                    r.cap_dien_ap,
                  );
                  const stt = (page - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-black/5 transition-colors ${t.rowOdd} ${t.rowEven} ${t.rowHover}`}
                    >
                      <td className="px-2 py-3 text-center align-middle font-light text-gray-500">
                        {stt}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Link
                          href={`/du-an/${r.id}/giao-xn?phan_he=${phanHe}`}
                          className={`block text-justify font-normal leading-snug hover:underline ${t.primaryText}`}
                        >
                          {r.ten_du_an}
                        </Link>
                        <p className="mt-0.5 text-justify text-xs font-light text-gray-500">
                          {r.ma_du_an || "—"}
                        </p>
                      </td>
                      <td className="px-1.5 py-3 text-center align-middle">
                        {loaiHinh.length ? (
                          <div className="flex flex-col items-center gap-0.5">
                            {loaiHinh.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-normal whitespace-nowrap ${badgeClassLoaiHinh(tag)}`}
                                title={labelLoaiHinhTuVan(tag)}
                              >
                                {shortLoaiHinhTuVan(tag)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-1.5 py-3 text-center align-middle text-gray-700">
                        {normalizeDiaDiem(r.dia_diem) || "—"}
                      </td>
                      <td className="px-2 py-3 text-center align-middle">
                        {giaoA ? (
                          <a
                            href={`/api/giao-a/${giaoA.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-col items-center"
                            title="Xem PDF Giao A"
                          >
                            <span className={`rounded px-1.5 py-0.5 text-[11px] font-normal hover:underline ${t.chip}`}>
                              {giaoA.so_qd || "Xem Giao A"}
                            </span>
                            <span className="mt-0.5 text-[11px] font-light text-gray-400">
                              {formatNgayVN(giaoA.ngay_qd, "")}
                            </span>
                            {giaoA.scanned_by_ho_ten ? (
                              <span
                                className="mt-0.5 max-w-[7.5rem] truncate text-[10px] font-light text-slate-400"
                                title={`Người quét: ${giaoA.scanned_by_ho_ten}`}
                              >
                                Quét: {giaoA.scanned_by_ho_ten}
                              </span>
                            ) : null}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-1 py-3 text-center align-middle">
                        <div className="inline-flex items-center justify-center gap-0.5">
                          <Link
                            href={`/du-an/${r.id}/sua`}
                            className={`inline-flex p-1 transition ${t.softText} hover:opacity-70`}
                            title="Sửa thông tin chung"
                          >
                            <PencilIcon />
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === r.id}
                            onClick={() => void deleteDuAn(r.id, r.ten_du_an)}
                            className="inline-flex p-1 text-rose-500 transition hover:text-rose-700 disabled:opacity-50"
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

        <div
          className={`flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-xs ${t.border} ${t.footerBg} ${t.footerText}`}
        >
          <span>
            Hiển thị {current.length}/{filtered.length} · Tổng danh mục{" "}
            {rows.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetColWidths}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-normal text-slate-600 hover:bg-slate-50"
              title="Khôi phục độ rộng cột mặc định"
            >
              Cột mặc định
            </button>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-normal disabled:opacity-40"
            >
              Trước
            </button>
            <span className="font-medium text-slate-700">
              {page}/{totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-normal disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResizableTh({
  label,
  colKey,
  onResizeStart,
  resizable = true,
}: {
  label: ReactNode;
  colKey: ColKey;
  onResizeStart: (key: ColKey, clientX: number) => void;
  resizable?: boolean;
}) {
  return (
    <th
      className={`relative border-r border-black/10 px-1.5 py-3.5 text-center leading-tight select-none ${
        colKey === "thaoTac" ? "border-r-0" : ""
      }`}
    >
      {label}
      {resizable ? (
        <span
          role="separator"
          aria-orientation="vertical"
          aria-label={`Kéo chỉnh cột ${typeof label === "string" ? label : colKey}`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizeStart(colKey, e.clientX);
          }}
          className="absolute top-0 right-0 z-20 h-full w-2 cursor-col-resize touch-none hover:bg-white/30"
          title="Kéo để chỉnh độ rộng cột"
        />
      ) : null}
    </th>
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
