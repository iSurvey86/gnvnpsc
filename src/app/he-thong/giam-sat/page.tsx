import Link from "next/link";
import { redirect } from "next/navigation";
import { GiamSatHeThongClient } from "@/components/GiamSatHeThongClient";
import { getSessionProfile } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Giám sát: nhật ký (Admin) + danh sách tài khoản non-admin
 * (mọi user đăng nhập xem danh sách; cột cấp login / thao tác chỉ Admin).
 */
export default async function GiamSatHeThongPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className={`text-xl font-bold tracking-tight text-teal-900 ${
              profile.isAdmin ? "" : "uppercase"
            }`}
          >
            {profile.isAdmin ? "Giám sát hoạt động" : "Danh sách tài khoản"}
          </h1>
        </div>
        <Link
          href={profile.isAdmin ? "/he-thong" : "/"}
          className="rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-50"
        >
          {profile.isAdmin ? "← Quản lý hệ thống" : "← Chọn phân hệ"}
        </Link>
      </div>

      <GiamSatHeThongClient isAdmin={profile.isAdmin} />
    </div>
  );
}
