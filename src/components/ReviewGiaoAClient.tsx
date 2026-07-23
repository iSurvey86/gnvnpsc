"use client";

import { useEffect, useMemo, useState } from "react";
import { CAP_DIEN_AP_OPTIONS } from "@/lib/cap-dien-ap";
import { HUONG_GIAO_OPTIONS } from "@/lib/huong-giao";
import {
  assignMaDuAnList,
  extractNamFromQd,
  generateMaDuAn,
} from "@/lib/ma-du-an";
import type { CapDienAp, DuAn, HuongGiao, QdGiaoA } from "@/lib/types";

type Props = {
  qd: QdGiaoA;
  initialDuAn: DuAn[];
};

const cellInput =
  "w-full px-1.5 py-1.5 border-0 bg-transparent rounded-none text-[13px] font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-inset focus:ring-violet-400/40 focus:bg-violet-50/50 transition-colors";

const cellTextarea =
  "w-full px-1.5 py-1.5 border-0 bg-transparent rounded-none leading-relaxed text-[13px] text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-inset focus:ring-violet-400/40 focus:bg-violet-50/50 transition-colors resize-none overflow-hidden [field-sizing:content] min-h-[2.5rem]";

export function ReviewGiaoAClient({ qd, initialDuAn }: Props) {
  const nam = useMemo(
    () => extractNamFromQd(qd.so_qd, qd.ngay_qd),
    [qd.so_qd, qd.ngay_qd],
  );

  const [rows, setRows] = useState<DuAn[]>(() =>
    assignMaDuAnList(initialDuAn, nam) as DuAn[],
  );
  const [savingAll, setSavingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setRows(assignMaDuAnList(initialDuAn, nam) as DuAn[]);
  }, [initialDuAn, nam]);

  function updateLocal(id: string, patch: Partial<DuAn>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...patch };
        if (
          patch.ten_du_an !== undefined ||
          patch.dia_diem !== undefined ||
          patch.cap_dien_ap !== undefined
        ) {
          const taken = prev
            .filter((x) => x.id !== id)
            .map((x) => x.ma_du_an)
            .filter(Boolean) as string[];
          next.ma_du_an = generateMaDuAn(
            {
              ten_du_an: next.ten_du_an,
              dia_diem: next.dia_diem,
              cap_dien_ap: next.cap_dien_ap,
              nam,
            },
            taken,
          );
        }
        return next;
      }),
    );
  }

  async function saveAll() {
    if (!rows.length) return;
    setSavingAll(true);
    setError(null);
    setMessage(null);
    try {
      const withMa = assignMaDuAnList(rows, nam) as DuAn[];
      setRows(withMa);
      for (const row of withMa) {
        if (!row.ten_du_an?.trim()) {
          throw new Error("Có dòng thiếu tên dự án");
        }
        const res = await fetch(`/api/du-an/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ma_du_an: row.ma_du_an,
            ten_du_an: row.ten_du_an,
            dia_diem: row.dia_diem,
            quy_mo: row.quy_mo,
            ghi_chu: row.ghi_chu,
            cap_dien_ap: row.cap_dien_ap,
            huong_giao: row.huong_giao,
          }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      }
      setMessage(`Đã lưu ${withMa.length} dự án`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setSavingAll(false);
    }
  }

  async function addDuAn() {
    setAdding(true);
    setError(null);
    try {
      const taken = rows.map((r) => r.ma_du_an).filter(Boolean) as string[];
      const ten = "Dự án mới";
      const ma = generateMaDuAn({ ten_du_an: ten, nam }, taken);
      const res = await fetch("/api/du-an", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qd_giao_a_id: qd.id,
          ten_du_an: ten,
          ma_du_an: ma,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Thêm thất bại");
      setRows((prev) => [...prev, json.data as DuAn]);
      setMessage("Đã thêm dòng dự án");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi thêm");
    } finally {
      setAdding(false);
    }
  }

  async function deleteRow(id: string) {
    if (!window.confirm("Xóa dự án này khỏi danh mục?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/du-an/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Xóa thất bại");
      setRows((prev) => prev.filter((r) => r.id !== id));
      setMessage("Đã xóa dự án");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xóa");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Khuông thông tin QĐ — pastel sky */}
      <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50/80 p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-bold tracking-wider text-sky-700 uppercase">
          Thông tin Quyết định Giao A
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-sky-600 uppercase">
              Số QĐ Giao A
            </label>
            <div className="rounded-xl border border-sky-200 bg-white/90 p-2.5 text-sm font-semibold text-slate-800">
              {qd.so_qd || "—"}
            </div>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-sky-600 uppercase">
              Ngày QĐ
            </label>
            <div className="rounded-xl border border-sky-200 bg-white/90 p-2.5 text-sm font-semibold text-slate-800">
              {qd.ngay_qd || "—"}
            </div>
          </div>
          <div className="min-w-[220px] flex-[2.5]">
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-sky-600 uppercase">
              Trích yếu
            </label>
            <div className="rounded-xl border border-sky-200 bg-white/90 p-2.5 text-sm font-medium text-slate-800">
              {qd.trich_yeu || "—"}
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <p className="text-sm font-semibold text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {/* Khuông bảng — pastel violet */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50/60 px-4 py-2.5">
          <p className="text-[11px] font-bold tracking-wider text-violet-700 uppercase">
            Danh mục dự án
          </p>
        </div>
        <div className="max-h-[650px] overflow-auto">
          <table className="relative w-full min-w-[1100px] border-collapse text-left text-[13px] [&_td]:border-r [&_td]:border-b [&_td]:border-violet-100/80 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-b [&_th]:border-violet-200 [&_th:last-child]:border-r-0 [&_tbody_tr:last-child_td]:border-b-0">
            <colgroup>
              <col className="w-11" />
              <col />
              <col className="w-[120px]" />
              <col style={{ width: "22%" }} />
              <col className="w-[110px]" />
              <col className="w-[148px]" />
              <col className="w-14" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-violet-100 text-[12px] font-extrabold tracking-wide text-violet-900 uppercase shadow-sm">
              <tr>
                <th className="bg-violet-100 px-2 py-3 text-center">STT</th>
                <th className="bg-violet-100 px-3 py-3 text-center">Tên dự án</th>
                <th className="bg-violet-100 px-2 py-3 text-center">Địa điểm</th>
                <th className="bg-violet-100 px-3 py-3 text-center">Quy mô</th>
                <th className="bg-violet-100 px-2 py-3 text-center">Cấp ĐA</th>
                <th className="bg-violet-100 px-2 py-3 text-center">Ghi chú</th>
                <th className="bg-violet-100 px-1 py-3 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="bg-[#faf8ff]">
                  <td colSpan={7} className="px-4 py-20 text-center">
                    <p className="text-sm font-bold text-violet-800/70">
                      Chưa có dữ liệu dự án
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="transition hover:bg-violet-50/40 odd:bg-white even:bg-[#faf8ff]"
                  >
                    <td className="px-2 py-3 text-center align-middle font-bold text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <textarea
                        className={cellTextarea}
                        value={row.ten_du_an}
                        onChange={(e) =>
                          updateLocal(row.id, { ten_du_an: e.target.value })
                        }
                        rows={1}
                      />
                      <input
                        type="text"
                        className={`${cellInput} mt-0.5 font-mono text-[11px] font-medium text-gray-500`}
                        value={row.ma_du_an ?? ""}
                        onChange={(e) =>
                          updateLocal(row.id, { ma_du_an: e.target.value })
                        }
                        title="TỈNH-NĂM-110|THA|PCM-VIẾTTẮT"
                        placeholder="Mã dự án"
                      />
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <input
                        type="text"
                        className={`${cellInput} text-center`}
                        value={row.dia_diem ?? ""}
                        onChange={(e) =>
                          updateLocal(row.id, { dia_diem: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <textarea
                        className={`${cellTextarea} font-medium text-violet-950`}
                        value={row.quy_mo ?? ""}
                        onChange={(e) =>
                          updateLocal(row.id, { quy_mo: e.target.value })
                        }
                        rows={1}
                      />
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <select
                        className={`${cellInput} cursor-pointer appearance-none text-center`}
                        value={row.cap_dien_ap ?? ""}
                        onChange={(e) =>
                          updateLocal(row.id, {
                            cap_dien_ap: (e.target.value ||
                              null) as CapDienAp | null,
                          })
                        }
                      >
                        <option value="">—</option>
                        {CAP_DIEN_AP_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <div className="flex flex-col gap-1 py-0.5">
                        {HUONG_GIAO_OPTIONS.map((o) => (
                          <label
                            key={o.value}
                            className="flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-violet-950"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-violet-300 text-violet-600 focus:ring-violet-400"
                              checked={row.huong_giao === o.value}
                              onChange={() =>
                                updateLocal(row.id, {
                                  huong_giao:
                                    row.huong_giao === o.value
                                      ? null
                                      : (o.value as HuongGiao),
                                })
                              }
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-1 py-2 text-center align-middle">
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => void deleteRow(row.id)}
                        className="rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                        title="Xóa dự án"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Chân bảng — pastel amber */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/70 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={adding}
              onClick={() => void addDuAn()}
              className="rounded-xl border-2 border-amber-500 bg-white px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
            >
              {adding ? "Đang thêm…" : "+ Thêm dòng"}
            </button>
            <span className="text-xs font-medium text-amber-800/70">
              {rows.length} dự án
            </span>
          </div>
          <button
            type="button"
            disabled={savingAll || rows.length === 0}
            onClick={() => void saveAll()}
            className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
          >
            {savingAll ? "Đang lưu…" : "Lưu tất cả vào CSDL"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="mx-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
