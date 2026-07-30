"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { HeThongShell } from "@/components/HeThongShell";
import type { XiNghiep } from "@/lib/types";

type XiForm = {
  ma: string;
  ten: string;
  phu_hop_tvtk: boolean;
  phu_hop_thi_nghiem: boolean;
  phu_hop_tvgs: boolean;
};

const emptyForm: XiForm = {
  ma: "",
  ten: "",
  phu_hop_tvtk: true,
  phu_hop_thi_nghiem: true,
  phu_hop_tvgs: true,
};

const cellInput =
  "w-full rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200";

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/50";

export function XiNghiepAdminClient() {
  const [rows, setRows] = useState<XiNghiep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function startEdit(row: XiNghiep) {
    setShowAddForm(false);
    setEditingId(row.id);
    setForm({
      ma: row.ma ?? "",
      ten: row.ten,
      phu_hop_tvtk: row.phu_hop_tvtk,
      phu_hop_thi_nghiem: row.phu_hop_thi_nghiem,
      phu_hop_tvgs: row.phu_hop_tvgs ?? true,
    });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setShowAddForm(true);
  }

  function cancelAdd() {
    setShowAddForm(false);
    setForm(emptyForm);
  }

  async function savePayload(mode: "create" | "update") {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (!form.ten.trim()) throw new Error("Thiếu tên Xí nghiệp");
      const payload = {
        ma: form.ma.trim() || null,
        ten: form.ten.trim(),
        phu_hop_tvtk: form.phu_hop_tvtk,
        phu_hop_thi_nghiem: form.phu_hop_thi_nghiem,
        phu_hop_tvgs: form.phu_hop_tvgs,
      };
      const res = await fetch(
        mode === "update" && editingId
          ? `/api/xi-nghiep/${editingId}`
          : "/api/xi-nghiep",
        {
          method: mode === "update" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      setMessage(mode === "update" ? "Đã cập nhật Xí nghiệp." : "Đã thêm Xí nghiệp.");
      if (mode === "update") cancelEdit();
      else cancelAdd();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  async function onAddSubmit(e: FormEvent) {
    e.preventDefault();
    await savePayload("create");
  }

  return (
    <HeThongShell
      subtitle="Đơn vị nhận giao nhiệm vụ theo phân hệ TV / TN / GS"
      actions={
        <button
          type="button"
          onClick={startAdd}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-100"
        >
          <span className="text-base leading-none">+</span>
          Thêm mới
        </button>
      }
    >
      <div className="space-y-5">
      {showAddForm ? (
        <form
          onSubmit={onAddSubmit}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm"
        >
          <h2 className="mb-3 text-sm font-extrabold text-emerald-900">
            Thêm Xí nghiệp
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
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">Tên *</span>
              <input
                required
                value={form.ten}
                onChange={(e) => setForm((f) => ({ ...f, ten: e.target.value }))}
                className={field}
              />
            </label>
            <fieldset className="text-sm sm:col-span-2">
              <legend className="mb-1 font-medium text-slate-600">
                Phù hợp phân hệ
              </legend>
              <PhuHopPicker
                form={form}
                onChange={setForm}
              />
            </fieldset>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Đang lưu…" : "Thêm mới"}
            </button>
            <button
              type="button"
              onClick={cancelAdd}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : null}

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
          <table className="w-full min-w-[780px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[46%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead className="bg-emerald-100/70 text-xs font-bold tracking-wide text-emerald-900 uppercase">
              <tr>
                <th className="px-3 py-2.5 text-center">Mã</th>
                <th className="px-3 py-2.5 text-center">Tên</th>
                <th className="px-3 py-2.5 text-center">TV</th>
                <th className="px-3 py-2.5 text-center">TN</th>
                <th className="px-3 py-2.5 text-center">GS</th>
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
                    Chưa có Xí nghiệp — bấm + Thêm mới.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const editing = editingId === r.id;
                  if (editing) {
                    return (
                      <tr
                        key={r.id}
                        className="border-t border-emerald-100 bg-emerald-50/40"
                      >
                        <td className="px-2 py-2 align-middle">
                          <input
                            value={form.ma}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, ma: e.target.value }))
                            }
                            className={`${cellInput} font-mono`}
                            placeholder="Mã"
                          />
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <input
                            value={form.ten}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, ten: e.target.value }))
                            }
                            className={`${cellInput} font-semibold`}
                            placeholder="Tên Xí nghiệp"
                          />
                        </td>
                        <td className="px-2 py-2 text-center align-middle" colSpan={3}>
                          <PhuHopPicker form={form} onChange={setForm} compact />
                        </td>
                        <td className="px-2 py-2 text-center align-middle">
                          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void savePayload("update")}
                              title="Lưu"
                              aria-label={`Lưu ${form.ten || r.ten}`}
                              className="text-emerald-700 transition hover:text-emerald-900 disabled:opacity-50"
                            >
                              {saving ? "…" : <CheckIcon />}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              title="Hủy"
                              aria-label="Hủy sửa"
                              className="text-slate-400 transition hover:text-slate-700"
                            >
                              <XIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
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
                        <FlagOk ok={r.phu_hop_tvtk} label="TV" tone="teal" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <FlagOk
                          ok={r.phu_hop_thi_nghiem}
                          label="TN"
                          tone="indigo"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <FlagOk
                          ok={r.phu_hop_tvgs ?? true}
                          label="GS"
                          tone="amber"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            title="Sửa Xí nghiệp"
                            aria-label={`Sửa ${r.ten}`}
                            className="text-emerald-700 transition hover:text-emerald-900"
                          >
                            <PencilIcon />
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
      </div>
      </div>
    </HeThongShell>
  );
}

function PhuHopPicker({
  form,
  onChange,
  compact = false,
}: {
  form: XiForm;
  onChange: (next: XiForm) => void;
  compact?: boolean;
}) {
  const opts = [
    {
      key: "phu_hop_tvtk" as const,
      label: "TV",
      title: "Tư vấn thiết kế",
      on: "bg-teal-50 text-teal-800 border-teal-200",
    },
    {
      key: "phu_hop_thi_nghiem" as const,
      label: "TN",
      title: "Thí nghiệm hiệu chỉnh",
      on: "bg-indigo-50 text-indigo-800 border-indigo-200",
    },
    {
      key: "phu_hop_tvgs" as const,
      label: "GS",
      title: "Tư vấn giám sát",
      on: "bg-amber-50 text-amber-900 border-amber-200",
    },
  ];

  return (
    <div
      className={`flex flex-wrap items-center ${compact ? "justify-center gap-1" : "gap-2"}`}
    >
      {opts.map((option) => {
        const checked = form[option.key];
        return (
          <button
            key={option.key}
            type="button"
            title={option.title}
            onClick={() =>
              onChange({ ...form, [option.key]: !form[option.key] })
            }
            className={`rounded-md border px-2 py-0.5 text-[10px] font-black transition ${
              checked
                ? option.on
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FlagOk({
  ok,
  label,
  tone,
}: {
  ok: boolean;
  label: string;
  tone: "teal" | "indigo" | "amber";
}) {
  if (!ok) return <span className="text-slate-300">—</span>;
  const cls =
    tone === "teal"
      ? "bg-teal-50 text-teal-800"
      : tone === "indigo"
        ? "bg-indigo-50 text-indigo-800"
        : "bg-amber-50 text-amber-900";
  return (
    <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-black ${cls}`}>
      {label}
    </span>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
