import Link from "next/link";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { createClient } from "@/lib/supabase/server";

export default async function TaiKhoanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          href="/he-thong"
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          ← Quản lý hệ thống
        </Link>
      </div>

      <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[11px] font-bold tracking-wider text-sky-700 uppercase">
              Email
            </dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {user?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold tracking-wider text-sky-700 uppercase">
              User ID
            </dt>
            <dd className="mt-0.5 font-mono text-xs text-slate-600">
              {user?.id ?? "—"}
            </dd>
          </div>
        </dl>

        <ChangePasswordForm />

        <form action="/auth/logout" method="post" className="mt-5">
          <button
            type="submit"
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
          >
            Đăng xuất
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
        <p className="font-bold">Cấp tài khoản mới</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-900/80">
          Vào <strong>Quản lý hệ thống → Nhân sự</strong> → bấm{" "}
          <strong>Cấp login</strong> (mật khẩu mặc định). Có thể sửa email sau
          khi đồng bộ HRMS.
        </p>
      </section>
    </div>
  );
}
