import { redirect } from "next/navigation";
import { GiamSatHeThongClient } from "@/components/GiamSatHeThongClient";
import { HeThongShell } from "@/components/HeThongShell";
import { getSessionProfile } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Giám sát: nhật ký (Admin) + danh sách tài khoản non-admin.
 * Đây là màn mặc định khi vào Quản lý hệ thống.
 */
export default async function GiamSatHeThongPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) {
    // Non-admin vẫn xem danh sách tài khoản qua route cũ nhưng không vào shell QLHT
    return (
      <div className="mx-auto max-w-6xl space-y-5 p-6">
        <h1 className="text-xl font-bold tracking-tight text-teal-900 uppercase">
          Danh sách tài khoản
        </h1>
        <GiamSatHeThongClient isAdmin={false} />
      </div>
    );
  }

  return (
    <HeThongShell subtitle="Giám sát hoạt động và quản trị tài khoản người dùng">
      <GiamSatHeThongClient isAdmin />
    </HeThongShell>
  );
}
