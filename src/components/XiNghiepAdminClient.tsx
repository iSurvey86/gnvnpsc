"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { XiNghiep } from "@/lib/types";

const emptyForm = {
  ma: "",
  ten: "",
  phu_hop_tvtk: true,
  phu_hop_thi_nghiem: true,
};

export function XiNghiepAdminClient() {
  const [rows, setRows] = useState<XiNghiep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/xi-nghiep?all=1");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lỗi tải");
      setRows(json.data as XiNghiep[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(row: XiNghiep) {
    setEditingId(row.id);
    setForm({
      ma: row.ma ?? "",
      ten: row.ten,
      phu_hop_tvtk: row.phu_hop_tvtk,
      phu_hop_thi_nghiem: row.phu_hop_thi_nghiem,
    });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        ma: form.ma.trim() || null,
        ten: form.ten.trim(),
        phu_hop_tvtk: form.phu_hop_tvtk,
        phu_hop_thi_nghiem: form.phu_hop_thi_nghiem,
      };
      const res = await fetch(
        editingId ? `/api/xi-nghiep/${editingId}` : "/api/xi-nghiep",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      setMessage(editingId ? "Đã cập nhật." : "Đã thêm Xí nghiệp.");
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: XiNghiep) {
    setError(null);
    try {
      const res = await fetch(`/api/xi-nghiep/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !row.active }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lỗi");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  }

  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/50";

  return (
    <div className="space-y-5">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm"
      >
        <h2 className="mb-3 text-sm font-extrabold text-emerald-900">
          {editingId ? "Sửa Xí nghiệp" : "Thêm Xí nghiệp"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Mã</span>
            <input
              value={form.ma}
              onChange={(e) => setForm((f) => ({ ...f, ma: e.target.value }))}
              className={field}
              placeholder="VD: DVDL-TH"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-600">Tên *</span>
            <input
              required
              value={form.ten}
              onChange={(e) => setForm((f) => ({ ...f, ten: e.target.value }))}
              className={field}
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.phu_hop_tvtk}
              onChange={(e) =>
                setForm((f) => ({ ...f, phu_hop_tvtk: e.target.checked }))
              }
            />
            Phù hợp TVTK
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.phu_hop_thi_nghiem}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  phu_hop_thi_nghiem: e.target.checked,
                }))
              }
            />
            Phù hợp Thí nghiệm
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : editingId ? "Cập nhật" : "Thêm mới"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>

      {message ? (
        <p className="text-sm font-semibold text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-emerald-700 text-xs font-bold tracking-wide text-white uppercase">
              <tr>
                <th className="px-3 py-2.5">Mã</th>
                <th className="px-3 py-2.5">Tên</th>
                <th className="px-3 py-2.5 text-center">TVTK</th>
                <th className="px-3 py-2.5 text-center">TN</th>
                <th className="px-3 py-2.5 text-center">Trạng thái</th>
                <th className="px-3 py-2.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    Đang tải…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    Chưa có Xí nghiệp — chạy SQL seed hoặc thêm mới.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-t border-slate-100 ${
                      r.active ? "bg-white" : "bg-slate-50 opacity-70"
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">
                      {r.ma || "—"}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">
                      {r.ten}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {r.phu_hop_tvtk ? "✓" : "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {r.phu_hop_thi_nghiem ? "✓" : "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.active
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {r.active ? "Hiện" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleActive(r)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {r.active ? "Ẩn" : "Hiện lại"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
