import Link from "next/link";

export function HeThongForbidden() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8 text-center">
      <h1 className="text-lg font-bold text-rose-800">Không có quyền Admin</h1>
      <p className="text-sm text-slate-600">
        Mục Quản lý hệ thống chỉ dành cho tài khoản Admin.
      </p>
      <Link
        href="/"
        className="inline-flex rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"
      >
        Về chọn phân hệ
      </Link>
    </div>
  );
}
