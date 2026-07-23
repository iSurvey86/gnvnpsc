import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewGiaoAClient } from "@/components/ReviewGiaoAClient";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DuAn, QdGiaoA } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function GiaoADetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: qd, error: qdErr } = await supabase
    .from("qd_giao_a")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (qdErr || !qd) notFound();

  const { data: duAn } = await supabase
    .from("du_an")
    .select("*")
    .eq("qd_giao_a_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f3f4f6] antialiased">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm md:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-[17px] font-black tracking-tight text-slate-800 uppercase">
              Review sau ScanAI
            </h1>
            <p className="mt-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Chỉnh danh mục dự án · rồi soạn QĐ giao Xí nghiệp
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-200"
        >
          ← Về Quản lý dự án
        </Link>
      </header>
      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-5 px-4 py-6 md:px-8">
        <ReviewGiaoAClient
          qd={qd as QdGiaoA}
          initialDuAn={(duAn ?? []) as DuAn[]}
        />
      </main>
    </div>
  );
}
