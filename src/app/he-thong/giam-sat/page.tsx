import { redirect } from "next/navigation";
import { GiamSatHeThongClient } from "@/components/GiamSatHeThongClient";
import { HeThongShell } from "@/components/HeThongShell";
import { getSessionProfile } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Admin: nhật ký hoạt động.
 * User: chuyển sang danh sách tài khoản (không xem nhật ký).
 */
export default async function GiamSatHeThongPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  if (!profile.isAdmin) {
    redirect("/he-thong/nhan-su");
  }

  return (
    <HeThongShell
      isAdmin
      subtitle="Giám sát hoạt động và quản trị tài khoản người dùng"
    >
      <GiamSatHeThongClient isAdmin />
    </HeThongShell>
  );
}
