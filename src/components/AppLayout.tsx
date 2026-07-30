"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  APP_FULL_NAME,
  APP_SYSTEM_LABEL,
} from "@/lib/brand";
import { isHubPath, isTvtkPath } from "@/lib/phan-he";
import { SidebarUserFooter } from "@/components/SidebarUserFooter";

const PIN_KEY = "gnvnpsc_sidebar_pinned";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  match: (p: string) => boolean;
  adminOnly?: boolean;
  hideIfAdmin?: boolean;
  hubOnly?: boolean;
  tvtkOnly?: boolean;
};

const nav: NavItem[] = [
  {
    href: "/",
    label: "Chọn phân hệ",
    icon: "⌂",
    match: (p) => isHubPath(p),
    adminOnly: false,
  },
  {
    href: "/tvtk",
    label: "Quản lý Dự án",
    icon: "📁",
    match: (p) => p === "/tvtk" || p.startsWith("/du-an"),
    adminOnly: false,
    tvtkOnly: true,
  },
  {
    href: "/qd-giao-xn",
    label: "QĐ giao Xí nghiệp",
    icon: "📄",
    match: (p) => p.startsWith("/qd-giao-xn"),
    adminOnly: false,
    tvtkOnly: true,
  },
  {
    href: "/he-thong/giam-sat",
    label: "Danh sách tài khoản",
    icon: "👥",
    match: (p) => p.startsWith("/he-thong/giam-sat"),
    adminOnly: false,
    hideIfAdmin: true,
  },
  {
    href: "/he-thong",
    label: "Quản lý hệ thống",
    icon: "⚙️",
    match: (p) => p.startsWith("/he-thong"),
    adminOnly: true,
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [pinned, setPinned] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      setPinned(localStorage.getItem(PIN_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetch("/api/me")
      .then((r) => r.json())
      .then((json) => {
        if (json?.ok) setIsAdmin(Boolean(json.data?.is_admin));
      })
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const togglePin = () => {
    setPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PIN_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const hideChrome =
    pathname.startsWith("/nhap-du-an") ||
    pathname.startsWith("/giao-a/") ||
    pathname === "/login" ||
    pathname.startsWith("/auth/");

  if (hideChrome) {
    return <>{children}</>;
  }

  const labelClass = pinned
    ? "ml-2.5 opacity-100 whitespace-nowrap"
    : "ml-2.5 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200";

  const inTvtk = isTvtkPath(pathname);
  const onHub = isHubPath(pathname);

  const visibleNav = nav.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.hideIfAdmin && isAdmin) return false;
    if (item.tvtkOnly && !inTvtk) return false;
    if (onHub && item.tvtkOnly) return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7fbfa]">
      <aside
        className={`${
          pinned ? "w-52" : "group w-14 hover:w-52"
        } z-30 flex shrink-0 flex-col overflow-visible border-r border-teal-100/60 bg-[#f0fdf9] transition-all duration-300`}
      >
        <div className="relative flex h-[4.5rem] shrink-0 items-center justify-center border-b border-teal-100/50 bg-[#e8f6f3] px-2">
          <button
            type="button"
            onClick={togglePin}
            className={`absolute top-1.5 right-1.5 z-10 cursor-pointer rounded-md p-1 transition-colors ${
              pinned
                ? "text-rose-500 hover:bg-teal-100/80 hover:text-rose-600"
                : "text-teal-400 hover:bg-teal-100/80 hover:text-teal-700"
            }`}
            title={
              pinned
                ? "Bỏ ghim — sidebar tự thu khi rời chuột"
                : "Ghim sidebar — luôn mở rộng"
            }
            aria-label={pinned ? "Bỏ ghim sidebar" : "Ghim sidebar"}
            aria-pressed={pinned}
          >
            <PinIcon filled={pinned} />
          </button>

          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              pinned
                ? "pointer-events-none opacity-0"
                : "opacity-100 group-hover:opacity-0"
            }`}
          >
            <span className="text-sm font-black tracking-tight text-teal-800">
              HT
            </span>
          </div>

          <div
            className={`flex w-full flex-col items-center justify-center gap-1.5 px-3 text-center transition-opacity duration-300 ${
              pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span className="text-[10px] leading-none font-extrabold tracking-[0.2em] text-teal-800 uppercase">
              {APP_SYSTEM_LABEL}
            </span>
            <span className="text-[10px] leading-none font-extrabold tracking-wide text-[#f67081] uppercase">
              {APP_FULL_NAME}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-1.5 py-5">
          {visibleNav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex cursor-pointer items-center rounded-lg px-2.5 py-2.5 text-sm font-bold transition-all ${
                    active
                      ? "bg-white text-teal-700 shadow-sm ring-1 ring-teal-100"
                      : "text-slate-800 hover:bg-white/70 hover:text-teal-700 hover:shadow-sm"
                  } ${pinned ? "" : "justify-center group-hover:justify-start"}`}
                >
                  <span className="flex w-5 shrink-0 justify-center text-base">
                    {item.icon}
                  </span>
                  <span className={labelClass}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <SidebarUserFooter
          pinned={pinned}
          labelClass={labelClass}
          isAdmin={isAdmin}
        />
      </aside>

      <main className="min-w-0 flex-1 overflow-auto bg-[#f7fbfa]">{children}</main>
    </div>
  );
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}
