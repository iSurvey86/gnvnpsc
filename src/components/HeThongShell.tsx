"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODULES = [
  {
    href: "/he-thong/giam-sat",
    label: "Nhật ký hoạt động",
    match: (p: string) =>
      p === "/he-thong" || p.startsWith("/he-thong/giam-sat"),
    active: "bg-indigo-600 text-white shadow-sm",
    idle: "bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
  },
  {
    href: "/he-thong/nhan-su",
    label: "Danh sách tài khoản",
    match: (p: string) => p.startsWith("/he-thong/nhan-su"),
    active: "bg-amber-600 text-white shadow-sm",
    idle: "bg-amber-50 text-amber-900 hover:bg-amber-100",
  },
  {
    href: "/he-thong/xi-nghiep",
    label: "Danh sách Xí nghiệp",
    match: (p: string) => p.startsWith("/he-thong/xi-nghiep"),
    active: "bg-emerald-600 text-white shadow-sm",
    idle: "bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
  },
] as const;

type Props = {
  children: React.ReactNode;
  /** Nút phụ bên phải (vd. + Thêm mới) — sau các tab chuyển mục */
  actions?: React.ReactNode;
  subtitle?: string;
};

export function HeThongShell({
  children,
  actions,
  subtitle = "Giám sát hoạt động và quản trị danh mục hệ thống",
}: Props) {
  const pathname = usePathname() || "/he-thong";

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="inline-flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-200"
              aria-hidden
            >
              <GearIcon />
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
              Quản lý hệ thống
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/"
              className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-bold whitespace-nowrap text-teal-800 transition hover:bg-teal-50"
            >
              ← Chọn phân hệ
            </Link>
            {MODULES.map((m) => {
              const on = m.match(pathname);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition ${
                    on ? m.active : m.idle
                  }`}
                >
                  {m.label}
                </Link>
              );
            })}
            {actions}
          </div>
        </div>

        <p className="mt-2 ml-10 text-sm text-slate-500">{subtitle}</p>
      </header>

      {children}
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4M18.4 5.6 17 7m-10 10-1.4 1.4" />
    </svg>
  );
}
