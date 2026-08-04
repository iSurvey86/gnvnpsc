"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { resolveLoginIdentifier } from "@/lib/auth-defaults";
import { APP_VERSION } from "@/lib/app-version";
import { createClient } from "@/lib/supabase/client";

const REMEMBER_KEY = "gnvnpsc_login_remember";
const REMEMBER_ID_KEY = "gnvnpsc_login_id";

const FEATURES = [
  "Giao việc tập trung",
  "Theo dõi trực quan",
  "Điều hành xuyên suốt",
  "Đánh giá toàn diện",
];

function mapLoginError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid_credentials")
  ) {
    return "Sai tài khoản hoặc mật khẩu.";
  }
  if (m.includes("email not confirmed")) {
    return "Email chưa xác nhận.";
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(REMEMBER_KEY) === "1") {
        setRemember(true);
        setIdentifier(localStorage.getItem(REMEMBER_ID_KEY) ?? "");
      }
    } catch {
      // ignore
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const email = resolveLoginIdentifier(identifier);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) throw err;

      try {
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, "1");
          localStorage.setItem(REMEMBER_ID_KEY, identifier.trim());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
          localStorage.removeItem(REMEMBER_ID_KEY);
        }
      } catch {
        // ignore
      }

      void fetch("/api/nhat-ky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phan_he: "XAC_THUC",
          hanh_dong: "LOGIN",
          chi_tiet_ngan: "Đăng nhập hệ thống",
          email,
        }),
      }).catch(() => null);

      router.replace(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      const raw =
        err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(mapLoginError(raw));
      void fetch("/api/nhat-ky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phan_he: "XAC_THUC",
          hanh_dong: "LOGIN_FAIL",
          chi_tiet_ngan: "Đăng nhập thất bại",
          trang_thai: "Thất bại",
          email,
        }),
      }).catch(() => null);
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1e4b8c] focus:ring-1 focus:ring-[#1e4b8c]/30";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <label className="block">
        <span className="mb-1 block text-[11px] font-bold tracking-wide text-slate-600 uppercase">
          Tên đăng nhập
        </span>
        <input
          type="text"
          required
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className={field}
          placeholder="Nhập email HRMS"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[11px] font-bold tracking-wide text-slate-600 uppercase">
          Mật khẩu
        </span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${field} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </label>

      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-0.5 w-full rounded-md bg-[#1e4b8c] py-2.5 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-[#163a6e] disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>

      <div className="flex justify-end">
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-slate-300 text-[#1e4b8c] focus:ring-[#1e4b8c]"
          />
          Ghi nhớ đăng nhập
        </label>
      </div>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-3 py-6">
      {/* Background */}
      <Image
        src="/images/gnv_login.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[1px]" />

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-[340px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20">
        {/* Brand */}
        <div className="flex flex-col items-center px-6 pt-7 pb-2 text-center">
          <Image
            src="/images/logo-notext.png"
            alt="Logo"
            width={72}
            height={72}
            className="h-[72px] w-[72px] object-contain"
            priority
          />
          <p className="mt-2 text-[22px] leading-none font-black tracking-tight">
            <span className="text-[#1e4b8c]">EVN</span>
            <span className="text-[#c41e3a] italic">NPC</span>
          </p>
          <p className="mt-1 text-[13px] font-semibold tracking-wide text-[#1e4b8c] italic">
            NPSC
          </p>
          <h1 className="mt-2 text-[17px] font-extrabold tracking-tight text-[#1e4b8c] uppercase">
            Phòng Kinh doanh
          </h1>
        </div>

        {/* Form */}
        <div className="px-6 pt-3 pb-4">
          <Suspense
            fallback={
              <p className="text-center text-xs text-slate-400">Đang tải…</p>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <div className="mx-6 border-t border-slate-200" />

        {/* Slogan + features */}
        <div className="px-6 py-4 text-center">
          <p className="text-[12px] leading-snug font-semibold text-[#1e4b8c]">
            Chuẩn xác nhiệm vụ – Vững vàng mục tiêu
          </p>
          <ul className="mt-3 space-y-1.5 text-left">
            {FEATURES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[12px] text-slate-700"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-6 border-t border-slate-200" />

        <footer className="px-4 py-3 text-center text-[10px] leading-relaxed text-slate-400">
          <p>© 2026 NPSC System — Phát triển bởi Phòng Kinh doanh</p>
          <p className="mt-0.5">Phiên bản {APP_VERSION}</p>
        </footer>
      </div>
    </div>
  );
}
