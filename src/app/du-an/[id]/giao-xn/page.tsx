import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GiaoNhiemVuSection,
  type QdGiaoXnWithXn,
} from "@/components/GiaoNhiemVuSection";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DuAn, QdGiaoA, XiNghiep } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function SoanGiaoXnPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: duAn, error } = await supabase
    .from("du_an")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !duAn) notFound();

  let qd: QdGiaoA | null = null;
  if (duAn.qd_giao_a_id) {
    const { data } = await supabase
      .from("qd_giao_a")
      .select("*")
      .eq("id", duAn.qd_giao_a_id)
      .maybeSingle();
    qd = (data as QdGiaoA) ?? null;
  }

  const [{ data: xiNghiep }, { data: existingQds }] = await Promise.all([
    supabase
      .from("xi_nghiep")
      .select("*")
      .eq("active", true)
      .order("ten", { ascending: true }),
    supabase
      .from("qd_giao_xn")
      .select("*, xi_nghiep:xi_nghiep_id ( id, ten, ma )")
      .eq("du_an_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f3f4f6] antialiased">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm md:px-10">
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-black tracking-tight text-slate-800 uppercase">
            Giao nhiệm vụ
          </h1>
          <p className="mt-1 truncate text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {(duAn as DuAn).ma_du_an
              ? `${(duAn as DuAn).ma_du_an} · `
              : ""}
            {(duAn as DuAn).ten_du_an}
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-200"
        >
          ← Quản lý dự án
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 md:px-8">
        <GiaoNhiemVuSection
          duAn={duAn as DuAn}
          qd={qd}
          xiNghiep={(xiNghiep ?? []) as XiNghiep[]}
          existingQds={(existingQds ?? []) as QdGiaoXnWithXn[]}
        />
      </main>
    </div>
  );
}
