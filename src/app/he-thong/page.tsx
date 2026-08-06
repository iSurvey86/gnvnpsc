import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";

/** Vào QLHT → Admin: nhật ký; User: danh sách tài khoản */
export default async function HeThongPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  redirect(profile.isAdmin ? "/he-thong/giam-sat" : "/he-thong/nhan-su");
}
