import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { getSessionProfile } from "@/lib/session";

export default async function TaiKhoanPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const hoTen = profile.nhanSu?.ho_ten?.trim() || "—";

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-teal-900">Tài khoản</h1>
          <p className="mt-0.5 text-xs text-teal-700/60">
            Phiên đăng nhập hiện tại
          </p>
        </div>
        <Link
          href={profile.isAdmin ? "/he-thong" : "/"}
          className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-50"
        >
          {profile.isAdmin ? "← Quản lý hệ thống" : "← Quản lý dự án"}
        </Link>
      </div>

      <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-[11px] font-bold tracking-wider text-sky-700 uppercase">
              Họ và tên
            </dt>
            <dd className="mt-0.5 text-base font-semibold text-sky-950">
              {hoTen}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold tracking-wider text-sky-700 uppercase">
              Email
            </dt>
            <dd className="mt-0.5 font-semibold text-sky-900">
              {profile.email}
            </dd>
          </div>
        </dl>

        <ChangePasswordForm />

        <form action="/auth/logout" method="post" className="mt-5">
          <button
            type="submit"
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600"
          >
            Đăng xuất
          </button>
        </form>
      </section>
    </div>
  );
}
