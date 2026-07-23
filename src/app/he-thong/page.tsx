import Link from "next/link";
import { APP_CODE, APP_FULL_NAME, APP_SYSTEM_LABEL } from "@/lib/brand";

export default function HeThongPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-teal-900">
          QUẢN LÝ HỆ THỐNG
        </h1>
        <p className="mt-0.5 text-xs text-teal-700/60">
          {APP_CODE} · {APP_SYSTEM_LABEL} · {APP_FULL_NAME}
        </p>
      </div>

      <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-[#f0fdfa] to-[#ccfbf1]/40 p-6 shadow-sm">
        <p className="text-sm text-teal-900/80">
          Module đang chuẩn bị: người dùng, phân quyền, danh mục Xí nghiệp, cấu
          hình mẫu Word.
        </p>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-teal-800/70">
          <li>Danh mục Xí nghiệp (TVTK / Thí nghiệm)</li>
          <li>Tài khoản & quyền (sau khi gắn Auth)</li>
          <li>Mẫu Word QĐ giao XN</li>
        </ul>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border-2 border-teal-500 bg-teal-50 px-5 py-2.5 text-sm font-bold text-teal-800 hover:bg-teal-100"
        >
          ← Quản lý dự án
        </Link>
      </div>
    </div>
  );
}
