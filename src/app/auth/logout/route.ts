import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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
