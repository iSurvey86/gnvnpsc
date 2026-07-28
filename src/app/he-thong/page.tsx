import Link from "next/link";
import { redirect } from "next/navigation";
import { HeThongForbidden } from "@/components/HeThongForbidden";
import { APP_CODE, APP_FULL_NAME, APP_SYSTEM_LABEL } from "@/lib/brand";
import { getSessionProfile } from "@/lib/session";

const cards = [
  {
    href: "/he-thong/giam-sat",
    title: "Giám sát hoạt động",
    desc: "Nhật ký (Admin) · Danh sách tài khoản non-admin.",
    tone: "border-teal-200 bg-gradient-to-br from-teal-50 to-white",
    badge: "bg-teal-500",
  },
  {
    href: "/he-thong/nhan-su",
    title: "Nhân sự",
    desc: "Danh mục email · cấp login · vai trò Admin/User.",
    tone: "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
    badge: "bg-amber-500",
  },
  {
    href: "/he-thong/xi-nghiep",
    title: "Danh mục Xí nghiệp",
    desc: "Thêm / sửa / ẩn đơn vị nhận giao TVTK hoặc Thí nghiệm.",
    tone: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
    badge: "bg-emerald-500",
  },
  {
    href: "/he-thong/tai-khoan",
    title: "Tài khoản đăng nhập",
    desc: "Xem phiên hiện tại · đề nghị đổi mật khẩu (không bắt buộc).",
    tone: "border-sky-200 bg-gradient-to-br from-sky-50 to-white",
    badge: "bg-sky-500",
  },
  {
    href: "/he-thong/mau-word",
    title: "Mẫu Word",
    desc: "Xem 3 mẫu QĐ giao XN đã gắn tag trong hệ thống.",
    tone: "border-rose-200 bg-gradient-to-br from-rose-50 to-white",
    badge: "bg-rose-400",
  },
];

export default async function HeThongPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) return <HeThongForbidden />;

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-teal-900">
          QUẢN LÝ HỆ THỐNG
        </h1>
        <p className="mt-0.5 text-xs text-teal-700/60">
          {APP_CODE} · {APP_SYSTEM_LABEL} · {APP_FULL_NAME}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Admin:{" "}
          <span className="font-semibold text-teal-800">{profile.email}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${c.tone}`}
          >
            <span
              className={`mb-3 inline-block h-2 w-10 rounded-full ${c.badge}`}
            />
            <h2 className="text-sm font-extrabold text-slate-900">{c.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              {c.desc}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        ← Quản lý dự án
      </Link>
    </div>
  );
}
