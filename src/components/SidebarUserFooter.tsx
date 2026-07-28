"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MeInfo = {
  email: string | null;
  ho_ten: string | null;
  is_admin: boolean;
};

export function SidebarUserFooter({
  pinned,
  isAdmin = false,
}: {
  pinned: boolean;
  labelClass?: string;
  isAdmin?: boolean;
}) {
  const [me, setMe] = useState<MeInfo | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetch("/api/me")
      .then((r) => r.json())
      .then((json) => {
        if (json?.ok && json.data) {
          setMe({
            email: json.data.email ?? null,
            ho_ten: json.data.ho_ten ?? null,
            is_admin: Boolean(json.data.is_admin),
          });
        } else {
          setMe(null);
        }
      })
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayName =
    me?.ho_ten?.trim() ||
    me?.email?.split("@")[0] ||
    (me ? "Người dùng" : "…");
  const initial = (displayName[0] ?? "?").toUpperCase();
  const admin = isAdmin || me?.is_admin;

  return (
    <div ref={rootRef} className="relative shrink-0 border-t border-teal-100/50 px-1.5 py-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center rounded-lg px-2.5 py-2 text-left transition hover:bg-white/70 ${
          pinned ? "" : "justify-center group-hover:justify-start"
        }`}
        title={displayName}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
            admin
              ? "bg-rose-100 text-rose-800"
              : "bg-teal-100 text-teal-800"
          }`}
        >
          {initial}
        </span>
        <span
          className={`ml-2.5 min-w-0 flex-1 truncate text-xs font-semibold text-teal-900 ${
            pinned
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          }`}
        >
          {displayName}
          {admin ? (
            <span className="ml-1 text-[10px] font-bold text-rose-600">
              Admin
            </span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-[calc(100%+0.35rem)] left-1.5 z-50 w-[min(16rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-teal-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-teal-100 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-teal-950">
              {displayName}
            </p>
            {me?.email ? (
              <p className="mt-0.5 truncate text-[11px] text-teal-700/70">
                {me.email}
              </p>
            ) : null}
          </div>
          <Link
            href="/he-thong/tai-khoan"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
          >
            <span aria-hidden>👤</span>
            Tài khoản
          </Link>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <span aria-hidden>🚪</span>
              Đăng xuất
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
