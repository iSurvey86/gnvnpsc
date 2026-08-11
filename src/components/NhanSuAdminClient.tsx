"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CAP_QUAN_LY_OPTIONS,
  capQuanLyFromChucDanh,
  chucDanhFromCapQuanLy,
  isPhoPhong,
  isTruongPhong,
  nhanLabelChucDanh,
  type CapQuanLy,
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
  chuc_danh: chucDanhFromCapQuanLy("nhan_vien"),
  dien_thoai: "",
  phan_he: ["tvtk"],
};

const PHAN_HE_OPTIONS: Array<{ code: PhanHeCode; label: string }> = [
  { code: "tvtk", label: "TV" },
  { code: "thi_nghiem", label: "TN" },
  { code: "tvgs", label: "GS" },
];

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50";

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

function roleBadgeClass(
  vaiTro: string | null | undefined,
  chucDanh: string | null | undefined,
) {
  if (vaiTro === "admin") return "bg-rose-50 text-rose-700";
  if (isTruongPhong(chucDanh)) return "bg-emerald-50 text-emerald-700";
  if (isPhoPhong(chucDanh)) return "bg-sky-50 text-sky-700";
  return "bg-slate-100 text-slate-500";
}

export function NhanSuAdminClient({ isAdmin = false }: { isAdmin?: boolean }) {
  const [rows, setRows] = useState<NhanSu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [provisioningId, setProvisioningId] = useState<string | null>(null);
  const [lastPassword, setLastPassword] = useState<string | null>(null);

  const displayRows = useMemo(
    () => rows.filter((r) => r.vai_tro !== "admin"),
    [rows],
  );

  const editingRow = useMemo(
    () => displayRows.find((r) => r.id === editingId) ?? null,
    [displayRows, editingId],
  );

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

  function openPhanQuyen(row: NhanSu) {
    if (row.vai_tro === "admin") return;
    setShowAddForm(false);
    setEditingId(row.id);
    setForm(formFromRow(row));
    setDrawerOpen(true);
    setMessage(null);
    setLastPassword(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function startAdd() {
    closeDrawer();
    setForm(emptyForm);
    setMessage(null);
    setLastPassword(null);
    setShowAddForm(true);
  }

  function cancelAdd() {
    setShowAddForm(false);
    setForm(emptyForm);
  }

  function setCapQuanLy(cap: CapQuanLy) {
    setForm((current) => ({
      ...current,
      chuc_danh: chucDanhFromCapQuanLy(cap),
      phan_he:
        cap === "truong_phong"
          ? (["tvtk", "thi_nghiem", "tvgs"] satisfies PhanHeCode[])
          : current.phan_he.length > 0
            ? current.phan_he
            : (["tvtk"] satisfies PhanHeCode[]),
    }));
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
      setMessage(
        mode === "update"
          ? "Đã cập nhật phân quyền / nhân sự."
          : "Đã thêm nhân sự.",
      );
      if (mode === "update") closeDrawer();
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

  const lockedTo = isTruongPhong(form.chuc_danh);
  const currentCap = capQuanLyFromChucDanh(form.chuc_danh);

  return (
    <HeThongShell
      isAdmin={isAdmin}
      subtitle={
        isAdmin
          ? "Nhân sự, cấp đăng nhập và phân tổ TV / TN / GS"
          : "Danh sách tài khoản (chỉ xem)"
      }
      actions={
        isAdmin ? (
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
          >
            <span className="text-base leading-none">+</span>
            Thêm mới
          </button>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {isAdmin && showAddForm ? (
          <form
            onSubmit={onAddSubmit}
            className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm"
          >
            <h2 className="mb-3 text-sm font-extrabold text-amber-950">
              Thêm nhân sự
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">
                  Mã NV
                </span>
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
                  Phân quyền *
                </span>
                <select
                  value={currentCap}
                  onChange={(e) => setCapQuanLy(e.target.value as CapQuanLy)}
                  className={`${field} font-semibold text-amber-900`}
                >
                  {CAP_QUAN_LY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                  locked={lockedTo}
                  onToggle={togglePhanHe}
                />
                {lockedTo ? (
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
                <col className={isAdmin ? "w-[28%]" : "w-[32%]"} />
                <col className="w-[19%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                {isAdmin ? <col className="w-[8%]" /> : null}
              </colgroup>
              <thead className="bg-amber-100/70 text-xs font-bold tracking-wide text-amber-900 uppercase">
                <tr>
                  <th className="px-3 py-2.5 text-center">Mã</th>
                  <th className="px-3 py-2.5 text-center">Họ và tên</th>
                  <th className="px-3 py-2.5 text-center">Email</th>
                  <th className="px-3 py-2.5 text-center">Điện thoại</th>
                  <th className="px-3 py-2.5 text-center">Vai trò</th>
                  <th className="px-3 py-2.5 text-center">Tổ</th>
                  {isAdmin ? (
                    <th className="px-3 py-2.5 text-center">Thao tác</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 7 : 6}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      Đang tải…
                    </td>
                  </tr>
                ) : displayRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 7 : 6}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      {isAdmin ? (
                        <>
                          Chưa có nhân sự — chạy SQL{" "}
                          <code className="text-xs">006</code> +{" "}
                          <code className="text-xs">007</code>.
                        </>
                      ) : (
                        "Chưa có tài khoản."
                      )}
                    </td>
                  </tr>
                ) : (
                  displayRows.map((r) => (
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
                          {(r.nhan_su_phan_he ?? []).filter((item) => item.active)
                            .length === 0 ? (
                            <span className="text-slate-400">—</span>
                          ) : null}
                        </div>
                      </td>
                      {isAdmin ? (
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openPhanQuyen(r)}
                              title="Phân quyền"
                              aria-label={`Phân quyền ${r.ho_ten}`}
                              className="text-violet-700 transition hover:text-violet-900"
                            >
                              <ShieldIcon />
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
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAdmin && drawerOpen && editingRow ? (
        <div
          className="fixed inset-0 z-[60] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="phan-quyen-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/40"
            aria-label="Đóng"
            onClick={closeDrawer}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <header className="shrink-0 border-b border-slate-200 bg-violet-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wide text-violet-600 uppercase">
                    Quản lý hệ thống
                  </p>
                  <h2
                    id="phan-quyen-title"
                    className="mt-0.5 text-base font-extrabold text-slate-900"
                  >
                    Phân quyền
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={saving}
                  className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-violet-100 hover:text-slate-800 disabled:opacity-50"
                  title="Đóng"
                >
                  <XIcon />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Nhân sự
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {editingRow.ho_ten}
                </p>
                <p className="text-[11px] text-slate-500">{editingRow.email}</p>
                {editingRow.ma_nv ? (
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                    {editingRow.ma_nv}
                  </p>
                ) : null}
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">
                  Phân quyền
                </span>
                <select
                  value={currentCap}
                  onChange={(e) => setCapQuanLy(e.target.value as CapQuanLy)}
                  disabled={saving}
                  className="w-full rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm font-semibold text-violet-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
                >
                  {CAP_QUAN_LY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="mb-1.5 text-xs font-bold text-slate-700">
                  Tổ làm việc
                </p>
                <ToPicker
                  selected={
                    lockedTo
                      ? ["tvtk", "thi_nghiem", "tvgs"]
                      : form.phan_he
                  }
                  locked={lockedTo}
                  onToggle={togglePhanHe}
                />
                {lockedTo ? (
                  <p className="mt-2 text-[11px] font-medium text-emerald-700">
                    Trưởng phòng được quản lý cả 3 tổ (TV / TN / GS).
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Phó phòng và Nhân viên chỉ thao tác các tổ được chọn.
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                  Thông tin liên hệ
                </p>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-600">
                    Họ tên *
                  </span>
                  <input
                    value={form.ho_ten}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ho_ten: e.target.value }))
                    }
                    disabled={saving}
                    className={field}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-600">
                    Email *
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    disabled={saving}
                    className={field}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-600">
                    Mã NV
                  </span>
                  <input
                    value={form.ma_nv}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ma_nv: e.target.value }))
                    }
                    disabled={saving}
                    className={field}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-600">
                    Điện thoại
                  </span>
                  <input
                    value={form.dien_thoai}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dien_thoai: e.target.value }))
                    }
                    disabled={saving}
                    className={field}
                  />
                </label>
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void savePayload("update")}
                  className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 disabled:opacity-60"
                >
                  {saving ? "Đang lưu…" : "Lưu phân quyền"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeDrawer}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Hủy
                </button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
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

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M12 3 4 6v5c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
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
