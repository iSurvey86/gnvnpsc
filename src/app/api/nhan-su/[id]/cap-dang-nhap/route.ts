import { NextResponse } from "next/server";
import { passwordForRole } from "@/lib/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/session";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

/**
 * Cấp / đặt lại đăng nhập — chỉ Admin.
 * MK: Admin@123 nếu vai_tro=admin, ngược lại Gnvnpsc@2026.
 */
export async function POST(_request: Request, { params }: Props) {
  try {
    const profile = await getSessionProfile();
    if (!profile?.isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Chỉ Admin được cấp đăng nhập" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: ns, error: nsErr } = await supabase
      .from("nhan_su")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (nsErr) throw new Error(nsErr.message);
    if (!ns) {
      return NextResponse.json(
        { ok: false, error: "Không tìm thấy nhân sự" },
        { status: 404 },
      );
    }
    if (!ns.active) {
      return NextResponse.json(
        { ok: false, error: "Nhân sự đang ẩn — hiện lại trước khi cấp login" },
        { status: 400 },
      );
    }

    const vaiTro = ns.vai_tro === "admin" ? "admin" : "user";
    const password = passwordForRole(vaiTro);
    const email = String(ns.email).trim().toLowerCase();

    let authUserId = ns.auth_user_id as string | null;

    const authPayload = {
      password,
      email,
      email_confirm: true,
      user_metadata: {
        ho_ten: ns.ho_ten,
        ma_nv: ns.ma_nv,
        goi_y_doi_mk: true,
        vai_tro: vaiTro,
      },
      app_metadata: { vai_tro: vaiTro },
    };

    if (authUserId) {
      const { error: updErr } = await supabase.auth.admin.updateUserById(
        authUserId,
        authPayload,
      );
      if (updErr) throw new Error(updErr.message);
    } else {
      const { data: created, error: createErr } =
        await supabase.auth.admin.createUser({
          email,
          ...authPayload,
        });

      if (createErr) {
        const { data: listed } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        const found = listed?.users?.find(
          (u) => u.email?.toLowerCase() === email,
        );
        if (!found) throw new Error(createErr.message);
        authUserId = found.id;
        const { error: updErr } = await supabase.auth.admin.updateUserById(
          authUserId,
          authPayload,
        );
        if (updErr) throw new Error(updErr.message);
      } else {
        authUserId = created.user.id;
      }
    }

    const { data: updated, error: linkErr } = await supabase
      .from("nhan_su")
      .update({
        auth_user_id: authUserId,
        da_cap_dang_nhap: true,
        goi_y_doi_mk: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (linkErr) throw new Error(linkErr.message);

    return NextResponse.json({
      ok: true,
      data: updated,
      default_password: password,
      hint: "Đã cấp đăng nhập. Đề nghị đổi mật khẩu (không bắt buộc).",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Lỗi cấp đăng nhập";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
