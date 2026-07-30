import Link from "next/link";
import { redirect } from "next/navigation";
import { PHAN_HE } from "@/lib/phan-he";
import { getSessionProfile } from "@/lib/session";

const cards = [
  {
    ...PHAN_HE.tvtk,
    bar: "bg-sky-500",
    box: "border-sky-200 bg-gradient-to-br from-sky-50 via-sky-50/70 to-cyan-50",
    labelCls: "text-sky-600",
    titleCls: "text-sky-950",
    descCls: "text-sky-800/75",
    ctaCls: "text-sky-700",
    arrowCls: "text-sky-300 group-hover:text-sky-500",
    ready: true,
  },
  {
    ...PHAN_HE.thi_nghiem,
    bar: "bg-teal-500",
    box: "border-teal-200 bg-gradient-to-br from-teal-50 via-teal-50/70 to-emerald-50",
    labelCls: "text-teal-600",
    titleCls: "text-teal-950",
    descCls: "text-teal-800/75",
    ctaCls: "text-teal-700",
    arrowCls: "text-teal-300 group-hover:text-teal-500",
    ready: false,
  },
  {
    ...PHAN_HE.tvgs,
    bar: "bg-amber-500",
    box: "border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50/70 to-orange-50",
    labelCls: "text-amber-700",
    titleCls: "text-amber-950",
    descCls: "text-amber-900/70",
    ctaCls: "text-amber-700",
    arrowCls: "text-amber-300 group-hover:text-amber-500",
    ready: false,
  },
];

export default async function PhanHeHubPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-center gap-9 p-6 md:p-10">
      <div className="text-center">
        <p className="text-sm font-bold text-teal-600 uppercase md:text-base">
          Phòng Kinh doanh - NPSC
        </p>
        <p className="mt-2 text-base font-bold text-sky-800 uppercase md:text-lg">
          Hệ thống
        </p>
        <h1 className="mt-1 pb-1.5 text-3xl leading-[1.25] font-extrabold text-sky-800 md:text-5xl">
          GIAO NHIỆM VỤ
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative overflow-hidden rounded-xl border px-5 pt-6 pb-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_24px_-16px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.07),0_16px_32px_-16px_rgba(15,23,42,0.3)] ${c.box}`}
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${c.bar}`} aria-hidden />
            <span
              className={`absolute top-3 right-3.5 text-xs transition-colors ${c.arrowCls}`}
              aria-hidden
            >
              →
            </span>
            <p
              className={`text-[11px] font-bold tracking-widest uppercase ${c.labelCls}`}
            >
              Phân hệ
            </p>
            <h2 className={`mt-2 text-lg leading-none font-bold ${c.titleCls}`}>
              {c.title}
            </h2>
            <p
              className={`mt-3 text-xs leading-relaxed font-medium ${c.descCls}`}
            >
              {c.desc}
            </p>
            <p className={`mt-4 text-[11px] font-bold ${c.ctaCls}`}>
              {c.ready ? "Vào phân hệ →" : "Sắp triển khai"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
