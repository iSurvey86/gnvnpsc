import Link from "next/link";
import { redirect } from "next/navigation";
import { PHAN_HE } from "@/lib/phan-he";
import { getSessionProfile } from "@/lib/session";

const cards = [
  { ...PHAN_HE.tvtk, ready: true },
  { ...PHAN_HE.thi_nghiem, ready: true },
  { ...PHAN_HE.tvgs, ready: true },
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
        {cards.map((c) => {
          const t = c.theme;
          return (
            <Link
              key={c.href}
              href={c.href}
              className={`group relative overflow-hidden rounded-xl border px-5 pt-6 pb-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_24px_-16px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.07),0_16px_32px_-16px_rgba(15,23,42,0.3)] ${t.hubBox}`}
            >
              <span className={`absolute inset-x-0 top-0 h-1 ${t.hubBar}`} aria-hidden />
              <span
                className={`absolute top-3 right-3.5 text-xs transition-colors ${t.hubArrow}`}
                aria-hidden
              >
                →
              </span>
              <p
                className={`text-[11px] font-bold tracking-widest uppercase ${t.hubLabel}`}
              >
                Phân hệ
              </p>
              <h2 className={`mt-2 text-lg leading-none font-bold ${t.hubTitle}`}>
                {c.title}
              </h2>
              <p
                className={`mt-3 text-xs leading-relaxed font-medium ${t.hubDesc}`}
              >
                {c.desc}
              </p>
              <p className={`mt-4 text-[11px] font-bold ${t.hubCta}`}>
                Vào phân hệ →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
