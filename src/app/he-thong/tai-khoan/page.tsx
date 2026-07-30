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
        <h1 className="text-xl font-bold text-teal-900 uppercase">
          Tài khoản đăng nhập
        </h1>
        <Link
          href={profile.isAdmin ? "/he-thong/giam-sat" : "/"}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          {profile.isAdmin ? "← Quản lý hệ thống" : "← Chọn phân hệ"}
        </Link>
      </div>

      <section className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-50/70 to-cyan-50 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
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
