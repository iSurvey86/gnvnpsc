"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  isPhoPhong,
  isTruongPhong,
  nhanLabelChucDanh,
} from "@/lib/chuc-danh";
import { HeThongShell } from "@/components/HeThongShell";
import { PHAN_HE, type PhanHeCode } from "@/lib/phan-he";
import type { NhanSu } from "@/lib/types";

type NhanSuForm = {
  ma_nv: string;
  ho_ten: string;
  email: string;
  don_vi: string;
  chuc_danh: string;
  dien_thoai: string;
  phan_he: PhanHeCode[];
};

const emptyForm: NhanSuForm = {
  ma_nv: "",
  ho_ten: "",
  email: "",
  don_vi: "Phòng Kinh doanh",
  chuc_danh: "",
  dien_thoai: "",
  phan_he: ["tvtk"],
};

const PHAN_HE_OPTIONS: Array<{ code: PhanHeCode; label: string }> = [
  { code: "tvtk", label: "TV" },
  { code: "thi_nghiem", label: "TN" },
  { code: "tvgs", label: "GS" },
];

const cellInput =
  "w-full rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200";

function formFromRow(row: NhanSu): NhanSuForm {
  return {
    ma_nv: row.ma_nv ?? "",
    ho_ten: row.ho_ten,
    email: row.email,
    don_vi: row.don_vi ?? "",
    chuc_danh: row.chuc_danh ?? "",
    dien_thoai: row.dien_thoai ?? "",
    phan_he:
      row.vai_tro === "admin" || isTruongPhong(row.chuc_danh)
        ? ["tvtk", "thi_nghiem", "tvgs"]
        : (row.nhan_su_phan_he ?? [])
            .filter((item) => item.active)
            .map((item) => item.phan_he),
  };
}

function roleBadgeClass(vaiTro: string | null | undefined, chucDanh: string | null | undefined) {
  if (vaiTro === "admin") return "bg-rose-50 text-rose-700";
  if (isTruongPhong(chucDanh)) return "bg-emerald-50 text-emerald-700";
  if (isPhoPhong(chucDanh)) return "bg-sky-50 text-sky-700";
  return "bg-slate-100 text-slate-500";
}

export function NhanSuAdminClient() {
  const [rows, setRows] = useState<NhanSu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [provisioningId, setProvisioningId] = useState<string | null>(null);
  const [lastPassword, setLastPassword] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/nhan-su");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lỗi tải");
      setRows(json.data as NhanSu[]);
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

  function startEdit(row: NhanSu) {
    setShowAddForm(false);
    setEditingId(row.id);
    setForm(formFromRow(row));
    setMessage(null);
    setLastPassword(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setLastPassword(null);
    setShowAddForm(true);
  }

  function cancelAdd() {
    setShowAddForm(false);
    setForm(emptyForm);
  }

  function togglePhanHe(code: PhanHeCode) {
    if (isTruongPhong(form.chuc_danh)) return;
    setForm((current) => ({
      ...current,
      phan_he: current.phan_he.includes(code)
        ? current.phan_he.filter((item) => item !== code)
        : [...current.phan_he, code],
    }));
  }

  async function savePayload(mode: "create" | "update") {
    setSaving(true);
    setError(null);
    setMessage(null);
    setLastPassword(null);
    try {
      if (!form.ho_ten.trim() || !form.email.trim()) {
        throw new Error("Thiếu họ tên hoặc email");
      }
      const payload = {
        ma_nv: form.ma_nv.trim() || null,
        ho_ten: form.ho_ten.trim(),
        email: form.email.trim(),
        don_vi: form.don_vi.trim() || null,
        chuc_danh: form.chuc_danh.trim() || null,
        dien_thoai: form.dien_thoai.trim() || null,
        phan_he: isTruongPhong(form.chuc_danh)
          ? (["tvtk", "thi_nghiem", "tvgs"] satisfies PhanHeCode[])
          : form.phan_he,
      };
      const res = await fetch(
        mode === "update" && editingId
          ? `/api/nhan-su/${editingId}`
          : "/api/nhan-su",
        {
          method: mode === "update" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      setMessage(mode === "update" ? "Đã cập nhật nhân sự." : "Đã thêm nhân sự.");
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

  async function saveInline() {
    await savePayload("update");
  }

  async function capDangNhap(row: NhanSu) {
    setProvisioningId(row.id);
    setError(null);
    setMessage(null);
    setLastPassword(null);
    try {
      const res = await fetch(`/api/nhan-su/${row.id}/cap-dang-nhap`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lỗi cấp đăng nhập");
      setMessage(
        json.hint ??
          "Đã cấp đăng nhập. Đề nghị người dùng đổi mật khẩu (không bắt buộc).",
      );
      if (typeof json.default_password === "string") {
        setLastPassword(json.default_password);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setProvisioningId(null);
    }
  }

  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50";

  return (
    <HeThongShell
      subtitle="Nhân sự, cấp đăng nhập và phân tổ TV / TN / GS"
      actions={
        <button
          type="button"
          onClick={startAdd}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
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
          className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm"
        >
          <h2 className="mb-3 text-sm font-extrabold text-amber-950">
            Thêm nhân sự
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">Mã NV</span>
              <input
                value={form.ma_nv}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ma_nv: e.target.value }))
                }
                className={field}
                placeholder="NV011"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Họ tên *
              </span>
              <input
                required
                value={form.ho_ten}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ho_ten: e.target.value }))
                }
                className={field}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-slate-600">
                Email *
              </span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className={field}
                placeholder="name@gmail.com"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Chức danh
              </span>
              <input
                value={form.chuc_danh}
                onChange={(e) =>
                  setForm((f) => ({ ...f, chuc_danh: e.target.value }))
                }
                className={field}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Điện thoại
              </span>
              <input
                value={form.dien_thoai}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dien_thoai: e.target.value }))
                }
                className={field}
                placeholder="09xx…"
              />
            </label>
            <fieldset className="text-sm sm:col-span-2">
              <legend className="mb-1 font-medium text-slate-600">
                Tổ làm việc
              </legend>
              <ToPicker
                selected={form.phan_he}
                locked={isTruongPhong(form.chuc_danh)}
                onToggle={togglePhanHe}
              />
              {isTruongPhong(form.chuc_danh) ? (
                <span className="mt-1 block text-[11px] font-medium text-emerald-700">
                  Trưởng phòng được quản lý cả 3 phân hệ.
                </span>
              ) : null}
            </fieldset>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-60"
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
        <p className="text-sm font-semibold text-amber-900">{message}</p>
      ) : null}
      {lastPassword ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
          Mật khẩu mặc định vừa cấp:{" "}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs font-bold">
            {lastPassword}
          </code>
          <span className="mt-1 block text-xs text-sky-700/80">
            Đề nghị người dùng đổi sau khi đăng nhập — không bắt buộc.
          </span>
        </div>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[28%]" />
              <col className="w-[19%]" />
              <col className="w-[12%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="bg-amber-100/70 text-xs font-bold tracking-wide text-amber-900 uppercase">
              <tr>
                <th className="px-3 py-2.5 text-center">Mã</th>
                <th className="px-3 py-2.5 text-center">Họ và tên</th>
                <th className="px-3 py-2.5 text-center">Email</th>
                <th className="px-3 py-2.5 text-center">Điện thoại</th>
                <th className="px-3 py-2.5 text-center">Vai trò</th>
                <th className="px-3 py-2.5 text-center">Tổ</th>
                <th className="px-3 py-2.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Đang tải…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Chưa có nhân sự — chạy SQL{" "}
                    <code className="text-xs">006</code> +{" "}
                    <code className="text-xs">007</code>.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const editing = editingId === r.id;
                  const lockedTo =
                    r.vai_tro === "admin" || isTruongPhong(form.chuc_danh);

                  if (editing) {
                    return (
                      <tr
                        key={r.id}
                        className="border-t border-amber-100 bg-amber-50/40"
                      >
                        <td className="px-2 py-2 align-middle">
                          <input
                            value={form.ma_nv}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, ma_nv: e.target.value }))
                            }
                            className={`${cellInput} font-mono`}
                            placeholder="Mã NV"
                          />
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <input
                            value={form.ho_ten}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                ho_ten: e.target.value,
                              }))
                            }
                            className={`${cellInput} mb-1 font-semibold`}
                            placeholder="Họ và tên"
                          />
                          <input
                            value={form.chuc_danh}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                chuc_danh: e.target.value,
                              }))
                            }
                            className={cellInput}
                            placeholder="Chức danh"
                          />
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                email: e.target.value,
                              }))
                            }
                            className={cellInput}
                            placeholder="Email"
                          />
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <input
                            value={form.dien_thoai}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                dien_thoai: e.target.value,
                              }))
                            }
                            className={cellInput}
                            placeholder="Điện thoại"
                          />
                        </td>
                        <td className="px-3 py-2 text-center align-middle">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${roleBadgeClass(
                              r.vai_tro,
                              form.chuc_danh,
                            )}`}
                          >
                            {nhanLabelChucDanh(r.vai_tro, form.chuc_danh)}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <ToPicker
                            selected={
                              lockedTo
                                ? ["tvtk", "thi_nghiem", "tvgs"]
                                : form.phan_he
                            }
                            locked={lockedTo}
                            onToggle={togglePhanHe}
                            compact
                          />
                        </td>
                        <td className="px-2 py-2 text-center align-middle">
                          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void saveInline()}
                              title="Lưu"
                              aria-label={`Lưu ${form.ho_ten || r.ho_ten}`}
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
                        {r.ma_nv || "—"}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {r.ho_ten}
                        {r.chuc_danh ? (
                          <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                            {r.chuc_danh}
                          </span>
                        ) : null}
                      </td>
                      <td className="truncate px-3 py-2 text-[11px] text-slate-700">
                        {r.email}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-600">
                        {r.dien_thoai || "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${roleBadgeClass(
                            r.vai_tro,
                            r.chuc_danh,
                          )}`}
                        >
                          {nhanLabelChucDanh(r.vai_tro, r.chuc_danh)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {PHAN_HE_OPTIONS.filter((option) =>
                            (r.nhan_su_phan_he ?? []).some(
                              (item) =>
                                item.active && item.phan_he === option.code,
                            ),
                          ).map((option) => (
                            <span
                              key={option.code}
                              title={PHAN_HE[option.code].title}
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${PHAN_HE[option.code].theme.chip}`}
                            >
                              {option.label}
                            </span>
                          ))}
                          {(r.nhan_su_phan_he ?? []).filter(
                            (item) => item.active,
                          ).length === 0 ? (
                            <span className="text-slate-400">—</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            title="Sửa nhân sự"
                            aria-label={`Sửa ${r.ho_ten}`}
                            className="text-amber-700 transition hover:text-amber-900"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            disabled={provisioningId === r.id || !r.active}
                            onClick={() => void capDangNhap(r)}
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
                            {provisioningId === r.id ? "…" : <KeyIcon />}
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

function ToPicker({
  selected,
  locked,
  onToggle,
  compact = false,
}: {
  selected: PhanHeCode[];
  locked: boolean;
  onToggle: (code: PhanHeCode) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center ${compact ? "justify-center gap-1" : "gap-2"}`}
    >
      {PHAN_HE_OPTIONS.map((option) => {
        const checked = locked || selected.includes(option.code);
        return (
          <button
            key={option.code}
            type="button"
            disabled={locked}
            title={PHAN_HE[option.code].title}
            onClick={() => onToggle(option.code)}
            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-black transition ${
              checked
                ? `${PHAN_HE[option.code].theme.chip} ${PHAN_HE[option.code].theme.border}`
                : "border-slate-200 bg-white text-slate-400"
            } ${locked ? "cursor-default opacity-90" : "hover:opacity-90"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
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

function KeyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8m-2 2 2 2m-5 1 2 2" />
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
