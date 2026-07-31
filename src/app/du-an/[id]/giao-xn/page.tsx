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

function oneQd(
  v: QdGiaoXnWithXn | QdGiaoXnWithXn[] | null | undefined,
): QdGiaoXnWithXn | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

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

  const [{ data: xiNghiep }, { data: ownedQds }, { data: mapRows }] =
    await Promise.all([
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
      supabase
        .from("qd_giao_xn_du_an")
        .select(
          `qd_giao_xn:qd_giao_xn_id (
             *, xi_nghiep:xi_nghiep_id ( id, ten, ma )
           )`,
        )
        .eq("du_an_id", id),
    ]);

  const byId = new Map<string, QdGiaoXnWithXn>();
  for (const row of (ownedQds ?? []) as QdGiaoXnWithXn[]) {
    byId.set(row.id, row);
  }
  for (const m of mapRows ?? []) {
    const q = oneQd(
      m.qd_giao_xn as QdGiaoXnWithXn | QdGiaoXnWithXn[] | null,
    );
    if (q && !byId.has(q.id)) byId.set(q.id, q);
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f3f4f6] antialiased">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-teal-100 bg-gradient-to-r from-teal-50 via-emerald-50/60 to-sky-50 px-6 py-4 shadow-sm md:px-10">
        <h1 className="min-w-0 truncate text-[17px] font-black tracking-tight text-teal-900 uppercase">
          Giao nhiệm vụ tư vấn thiết kế
        </h1>
        <Link
          href="/tvtk"
          className="shrink-0 rounded-xl border border-teal-200 bg-white/80 px-4 py-2 text-xs font-bold text-teal-800 shadow-sm transition hover:bg-white"
        >
          ← Quản lý dự án
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 md:px-8">
        <GiaoNhiemVuSection
          duAn={duAn as DuAn}
          qd={qd}
          xiNghiep={(xiNghiep ?? []) as XiNghiep[]}
          existingQds={[...byId.values()]}
        />
      </main>
    </div>
  );
}
