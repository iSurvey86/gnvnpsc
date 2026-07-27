"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserInfo = {
  email: string | null;
};

export function SidebarUserFooter({
  pinned,
  labelClass,
  isAdmin = false,
}: {
  pinned: boolean;
  labelClass: string;
  isAdmin?: boolean;
}) {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email ?? null });
      } else {
        setUser(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? null } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const short = user?.email?.split("@")[0] ?? (user ? "User" : "…");

  return (
    <div className="shrink-0 border-t border-teal-100/50 px-1.5 py-2">
      <div
        className={`mb-1 flex items-center rounded-lg px-2.5 py-2 text-xs ${
          pinned ? "" : "justify-center group-hover:justify-start"
        }`}
        title={user?.email ?? undefined}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
            isAdmin
              ? "bg-rose-100 text-rose-800"
              : "bg-teal-100 text-teal-800"
          }`}
        >
          {(short[0] ?? "?").toUpperCase()}
        </span>
        <span
          className={`${labelClass} min-w-0 truncate font-semibold text-slate-700`}
        >
          {user?.email ?? "Chưa đăng nhập"}
          {isAdmin ? (
            <span className="ml-1 text-[10px] text-rose-600">Admin</span>
          ) : null}
        </span>
      </div>
      <Link
        href="/he-thong/tai-khoan"
        className={`mb-0.5 flex w-full items-center rounded-lg px-2.5 py-2 text-sm font-bold text-slate-700 transition hover:bg-white/70 ${
          pinned ? "" : "justify-center group-hover:justify-start"
        }`}
        title="Tài khoản"
      >
        <span className="flex w-5 shrink-0 justify-center text-base">👤</span>
        <span className={labelClass}>Tài khoản</span>
      </Link>
      <form action="/auth/logout" method="post">
        <button
          type="submit"
          className={`flex w-full cursor-pointer items-center rounded-lg px-2.5 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50 ${
            pinned ? "" : "justify-center group-hover:justify-start"
          }`}
          title="Đăng xuất"
        >
          <span className="flex w-5 shrink-0 justify-center text-base">🚪</span>
          <span className={labelClass}>Đăng xuất</span>
        </button>
      </form>
    </div>
  );
}
