import Link from "next/link";
import { redirect } from "next/navigation";
import { HeThongForbidden } from "@/components/HeThongForbidden";
import { NhanSuAdminClient } from "@/components/NhanSuAdminClient";
import { getSessionProfile } from "@/lib/session";

export default async function HeThongNhanSuPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) return <HeThongForbidden />;

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-teal-900">Nhân sự</h1>
          <p className="mt-0.5 text-xs text-teal-700/60">
            Admin riêng (Quản trị) + danh bạ Phòng Kinh doanh. Cấp login theo
            vai trò; đề nghị đổi MK, không bắt buộc.
          </p>
        </div>
        <Link
          href="/he-thong"
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          ← Quản lý hệ thống
        </Link>
      </div>
      <NhanSuAdminClient />
    </div>
  );
}
