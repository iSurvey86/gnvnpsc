import Link from "next/link";
import { notFound } from "next/navigation";
import { SuaDuAnForm } from "@/components/SuaDuAnForm";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DuAn, XiNghiep } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function SuaDuAnPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: duAn, error }, { data: xiNghiep }] = await Promise.all([
    supabase.from("du_an").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("xi_nghiep")
      .select("*")
      .eq("active", true)
      .order("ten", { ascending: true }),
  ]);

  if (error || !duAn) notFound();

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f3f4f6] antialiased">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-teal-100 bg-gradient-to-r from-teal-50 via-emerald-50/60 to-sky-50 px-6 py-4 shadow-sm md:px-10">
        <h1 className="min-w-0 truncate text-[17px] font-black tracking-tight text-teal-900 uppercase">
          Sửa thông tin dự án
        </h1>
        <Link
          href="/tvtk"
          className="shrink-0 rounded-xl border border-teal-200 bg-white/80 px-4 py-2 text-xs font-bold text-teal-800 shadow-sm transition hover:bg-white"
        >
          ← Quản lý dự án
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 md:px-8">
        <SuaDuAnForm
          duAn={duAn as DuAn}
          xiNghiep={(xiNghiep ?? []) as XiNghiep[]}
        />
      </main>
    </div>
  );
}
