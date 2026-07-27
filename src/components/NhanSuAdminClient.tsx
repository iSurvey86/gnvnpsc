"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { NhanSu } from "@/lib/types";

const emptyForm = {
  ma_nv: "",
  ho_ten: "",
  email: "",
  don_vi: "Phòng Kinh doanh",
  chuc_danh: "",
  dien_thoai: "",
};

export function NhanSuAdminClient() {
  const [rows, setRows] = useState<NhanSu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    void load();
  }, [load]);

  function startEdit(row: NhanSu) {
    setEditingId(row.id);
    setForm({
      ma_nv: row.ma_nv ?? "",
      ho_ten: row.ho_ten,
      email: row.email,
      don_vi: row.don_vi ?? "",
      chuc_danh: row.chuc_danh ?? "",
      dien_thoai: row.dien_thoai ?? "",
    });
    setMessage(null);
    setLastPassword(null);
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
    setLastPassword(null);
    try {
      const payload = {
        ma_nv: form.ma_nv.trim() || null,
        ho_ten: form.ho_ten.trim(),
        email: form.email.trim(),
        don_vi: form.don_vi.trim() || null,
        chuc_danh: form.chuc_danh.trim() || null,
        dien_thoai: form.dien_thoai.trim() || null,
      };
      const res = await fetch(
        editingId ? `/api/nhan-su/${editingId}` : "/api/nhan-su",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      setMessage(editingId ? "Đã cập nhật nhân sự." : "Đã thêm nhân sự.");
      cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: NhanSu) {
    setError(null);
    try {
      const res = await fetch(`/api/nhan-su/${row.id}`, {
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
    <div className="space-y-5">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm"
      >
        <h2 className="mb-3 text-sm font-extrabold text-amber-950">
          {editingId ? "Sửa nhân sự" : "Thêm nhân sự"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Mã NV</span>
            <input
              value={form.ma_nv}
              onChange={(e) => setForm((f) => ({ ...f, ma_nv: e.target.value }))}
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
            <span className="mb-1 block font-medium text-slate-600">Đơn vị</span>
            <input
              value={form.don_vi}
              onChange={(e) =>
                setForm((f) => ({ ...f, don_vi: e.target.value }))
              }
              className={field}
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
          <label className="text-sm sm:col-span-2">
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
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-60"
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
          <table className="min-w-full text-left text-sm">
            <thead className="bg-amber-700 text-xs font-bold tracking-wide text-white uppercase">
              <tr>
                <th className="px-3 py-2.5">Mã</th>
                <th className="px-3 py-2.5">Họ tên</th>
                <th className="px-3 py-2.5">Email</th>
                <th className="px-3 py-2.5">Điện thoại</th>
                <th className="px-3 py-2.5">Đơn vị</th>
                <th className="px-3 py-2.5 text-center">Vai trò</th>
                <th className="px-3 py-2.5 text-center">Login</th>
                <th className="px-3 py-2.5 text-center">TT</th>
                <th className="px-3 py-2.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Đang tải…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Chưa có nhân sự — chạy SQL{" "}
                    <code className="text-xs">006</code> +{" "}
                    <code className="text-xs">007</code>.
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
                    <td className="px-3 py-2 text-xs text-slate-700">
                      {r.email}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {r.dien_thoai || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {r.don_vi || "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.vai_tro === "admin"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {r.vai_tro === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.da_cap_dang_nhap
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {r.da_cap_dang_nhap ? "Đã cấp" : "Chưa"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          r.active
                            ? "bg-amber-50 text-amber-900"
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
                          className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={provisioningId === r.id || !r.active}
                          onClick={() => void capDangNhap(r)}
                          className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-100 disabled:opacity-50"
                        >
                          {provisioningId === r.id
                            ? "…"
                            : r.da_cap_dang_nhap
                              ? "Reset MK"
                              : "Cấp login"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleActive(r)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {r.active ? "Ẩn" : "Hiện"}
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
