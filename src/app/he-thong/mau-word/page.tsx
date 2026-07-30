import Link from "next/link";
import { redirect } from "next/navigation";
import { HeThongForbidden } from "@/components/HeThongForbidden";
import { getSessionProfile } from "@/lib/session";

const templates = [
  {
    file: "qd-giao-nhiem-vu-tvtk_110.docx",
    label: "Tư vấn thiết kế — 110 kV",
    short: "TV · 110",
    tone: "border-teal-200 from-teal-50 to-cyan-50 text-teal-950",
    chip: "bg-teal-50 text-teal-800",
    btn: "bg-teal-600 hover:bg-teal-700",
  },
  {
    file: "qd-giao-nhiem-vu-tvtk_tha.docx",
    label: "Tư vấn thiết kế — Trung hạ áp",
    short: "TV · THA",
    tone: "border-sky-200 from-sky-50 to-cyan-50 text-sky-950",
    chip: "bg-sky-50 text-sky-800",
    btn: "bg-sky-600 hover:bg-sky-700",
  },
  {
    file: "qd-giao-nhiem-vu-tnhc.docx",
    label: "Thí nghiệm hiệu chỉnh",
    short: "TN",
    tone: "border-indigo-200 from-indigo-50 to-violet-50 text-indigo-950",
    chip: "bg-indigo-50 text-indigo-800",
    btn: "bg-indigo-600 hover:bg-indigo-700",
  },
];

export default async function MauWordPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) return <HeThongForbidden />;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-teal-900 uppercase">
          Mẫu quyết định Word
        </h1>
        <Link
          href="/he-thong/giam-sat"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          ← Quản lý hệ thống
        </Link>
      </div>

      <ul className="space-y-3">
        {templates.map((t) => (
          <li
            key={t.file}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-r px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${t.tone}`}
          >
            <div className="min-w-0">
              <span
                className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-black ${t.chip}`}
              >
                {t.short}
              </span>
              <p className="mt-1.5 text-sm font-bold">{t.label}</p>
              <p className="mt-0.5 font-mono text-[11px] opacity-60">{t.file}</p>
            </div>
            <a
              href={`/templates/${t.file}`}
              download
              className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white ${t.btn}`}
            >
              Tải mẫu
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
