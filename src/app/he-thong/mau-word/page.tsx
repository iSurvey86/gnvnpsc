import Link from "next/link";
import { redirect } from "next/navigation";
import { HeThongForbidden } from "@/components/HeThongForbidden";
import { getSessionProfile } from "@/lib/session";

const templates = [
  {
    file: "qd-giao-nhiem-vu-tvtk_110.docx",
    label: "TVTK — 110 kV",
  },
  {
    file: "qd-giao-nhiem-vu-tvtk_tha.docx",
    label: "TVTK — Trung hạ áp",
  },
  {
    file: "qd-giao-nhiem-vu-tnhc.docx",
    label: "Thí nghiệm hiệu chỉnh",
  },
];

export default async function MauWordPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) return <HeThongForbidden />;

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-teal-900">Mẫu Word</h1>
          <p className="mt-0.5 text-xs text-teal-700/60">
            File trong thư mục templates — đã gắn tag xuất QĐ
          </p>
        </div>
        <Link
          href="/he-thong"
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          ← Quản lý hệ thống
        </Link>
      </div>

      <ul className="space-y-3">
        {templates.map((t) => (
          <li
            key={t.file}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-sm font-bold text-violet-950">{t.label}</p>
              <p className="font-mono text-[11px] text-violet-700/70">{t.file}</p>
            </div>
            <a
              href={`/templates/${t.file}`}
              download
              className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
            >
              Tải mẫu
            </a>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">
        Chi tiết tag: xem tài liệu map tag trong thư mục docs/templates.
      </p>
    </div>
  );
}
