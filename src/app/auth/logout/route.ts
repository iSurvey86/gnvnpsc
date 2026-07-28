import { NextResponse } from "next/server";
import { logHoatDong } from "@/lib/activity-log";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/session";

export async function POST(request: Request) {
  const profile = await getSessionProfile().catch(() => null);
  if (profile) {
    await logHoatDong({
      phanHe: "XAC_THUC",
      hanhDong: "LOGOUT",
      chiTietNgan: "Đăng xuất hệ thống",
      email: profile.email,
      hoTen: profile.nhanSu?.ho_ten || profile.email,
      authUserId: profile.userId,
    });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const redirectTo = new URL("/login", url.origin);
  return NextResponse.redirect(redirectTo, { status: 303 });
}

/** Cho phép mở link đăng xuất nhanh */
export async function GET(request: Request) {
  return POST(request);
}
