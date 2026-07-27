import { ADMIN_EMAIL } from "@/lib/auth-defaults";
import type { NhanSu, VaiTro } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SessionProfile = {
  userId: string;
  email: string;
  nhanSu: NhanSu | null;
  vaiTro: VaiTro;
  isAdmin: boolean;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();
  const email = user.email.toLowerCase();
  const { data: ns } = await admin
    .from("nhan_su")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  const metaRole =
    (user.app_metadata?.vai_tro as string | undefined) ||
    (user.user_metadata?.vai_tro as string | undefined);

  const vaiTro: VaiTro =
    ns?.vai_tro === "admin" ||
    metaRole === "admin" ||
    email === ADMIN_EMAIL
      ? "admin"
      : "user";

  return {
    userId: user.id,
    email: user.email,
    nhanSu: (ns as NhanSu | null) ?? null,
    vaiTro,
    isAdmin: vaiTro === "admin",
  };
}
