import Link from "next/link";
import { PHAN_HE } from "@/lib/phan-he";

type Props = {
  code: keyof typeof PHAN_HE;
};

export function PhanHePlaceholder({ code }: Props) {
  const ph = PHAN_HE[code];
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-[11px] font-bold tracking-[0.18em] text-teal-700/60 uppercase">
        {ph.short}
      </p>
      <h1 className="text-xl font-bold text-teal-950">{ph.title}</h1>
      <p className="text-sm text-teal-800/70">{ph.desc}</p>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
        Phân hệ đang xây dựng — quay lại chọn phân hệ khác.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50"
      >
        ← Chọn phân hệ
      </Link>
    </div>
  );
}
