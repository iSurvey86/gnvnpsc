import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/session";
import { VIEW_AS_COOKIE, viewAsCookieOptions } from "@/lib/view-as";

export async function POST(request: Request) {
  const profile = await getSessionProfile().catch(() => null);
  if (profile) {
    await logHoatDong({
      phanHe: "XAC_THUC",
      hanhDong: "LOGOUT",
      chiTietNgan: "Đăng xuất hệ thống",
      email: profile.email,
      hoTen: profile.actorHoTen || profile.email,
      authUserId: profile.userId,
    });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const redirectTo = new URL("/login", url.origin);
  const res = NextResponse.redirect(redirectTo, { status: 303 });
  res.cookies.set(VIEW_AS_COOKIE, "", {
    ...viewAsCookieOptions(0),
    maxAge: 0,
  });
  return res;
}

/** Cho phép mở link đăng xuất nhanh */
export async function GET(request: Request) {
  return POST(request);
}
