"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

/** Đổi mật khẩu tùy chọn — không bắt buộc lần đầu */
export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (password.length < 8) {
      setError("Mật khẩu mới tối thiểu 8 ký tự");
      return;
    }
    if (password !== confirm) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setOk("Đã đổi mật khẩu.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/50";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 space-y-3 rounded-xl border border-dashed border-sky-200 bg-white/70 p-4"
    >
      <p className="text-xs font-semibold text-sky-800">
        Đề nghị đổi mật khẩu nếu đang dùng mật khẩu mặc định (không bắt buộc).
      </p>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-600">
          Mật khẩu mới
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
          autoComplete="new-password"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-600">Xác nhận</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={field}
          autoComplete="new-password"
        />
      </label>
      {error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : null}
      {ok ? <p className="text-sm font-semibold text-emerald-700">{ok}</p> : null}
      <button
        type="submit"
        disabled={loading || !password}
        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {loading ? "Đang đổi…" : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
