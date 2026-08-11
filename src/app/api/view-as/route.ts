import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/session";
import {
  parseViewAsCap,
  VIEW_AS_COOKIE,
  viewAsCookieOptions,
  type ViewAsCap,
} from "@/lib/view-as";

/** Bật / đổi chế độ xem với quyền (chỉ Admin thật). */
export async function POST(request: Request) {
  try {
    const profile = await getSessionProfile();
    if (!profile?.realIsAdmin) {
      return NextResponse.json(
        { ok: false, error: "Chỉ Admin hệ thống mới dùng được chế độ xem với quyền." },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      cap?: string;
    };
    const cap = parseViewAsCap(body.cap);
    if (!cap) {
      return NextResponse.json(
        { ok: false, error: "Thiếu hoặc sai cấp xem (truong_phong | pho_phong | nhan_vien)." },
        { status: 400 },
      );
    }

    const res = NextResponse.json({ ok: true, data: { cap } });
    res.cookies.set(VIEW_AS_COOKIE, cap, viewAsCookieOptions());
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** Thoát chế độ xem với quyền. */
export async function DELETE() {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "Chưa đăng nhập" },
        { status: 401 },
      );
    }
    if (!profile.realIsAdmin && !profile.viewAs) {
      return NextResponse.json(
        { ok: false, error: "Không đang ở chế độ xem với quyền." },
        { status: 400 },
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(VIEW_AS_COOKIE, "", {
      ...viewAsCookieOptions(0),
      maxAge: 0,
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/** Đọc cookie hiện tại (tiện debug / client). */
export async function GET() {
  const jar = await cookies();
  const cap = parseViewAsCap(jar.get(VIEW_AS_COOKIE)?.value) as ViewAsCap | null;
  const profile = await getSessionProfile();
  return NextResponse.json({
    ok: true,
    data: {
      cap,
      active: Boolean(profile?.viewAs),
      real_is_admin: Boolean(profile?.realIsAdmin),
    },
  });
}
