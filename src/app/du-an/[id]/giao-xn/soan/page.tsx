import { notFound, redirect } from "next/navigation";
import { SoanQdGiaoXnEditor } from "@/components/SoanQdGiaoXnEditor";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DuAn, LoaiGiaoXn, QdGiaoA, QdGiaoXn, XiNghiep } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ loai?: string; qdId?: string }>;
};

export default async function SoanQdGiaoXnPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const loai: LoaiGiaoXn =
    sp.loai === "thi_nghiem" ? "thi_nghiem" : "tvtk";

  const supabase = createAdminClient();
  const { data: duAn, error } = await supabase
    .from("du_an")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !duAn) notFound();

  if (loai === "tvtk" && !(duAn as DuAn).cap_dien_ap) {
    redirect(`/du-an/${id}/giao-xn`);
  }

  let qdGiaoA: QdGiaoA | null = null;
  if (duAn.qd_giao_a_id) {
    const { data } = await supabase
      .from("qd_giao_a")
      .select("*")
      .eq("id", duAn.qd_giao_a_id)
      .maybeSingle();
    qdGiaoA = (data as QdGiaoA) ?? null;
  }

  let initial: QdGiaoXn | null = null;
  if (sp.qdId) {
    const { data } = await supabase
      .from("qd_giao_xn")
      .select("*")
      .eq("id", sp.qdId)
      .eq("du_an_id", id)
      .maybeSingle();
    initial = (data as QdGiaoXn) ?? null;
  }

  const { data: xiNghiep } = await supabase
    .from("xi_nghiep")
    .select("*")
    .eq("active", true)
    .order("ten", { ascending: true });

  return (
    <SoanQdGiaoXnEditor
      duAn={duAn as DuAn}
      qdGiaoA={qdGiaoA}
      xiNghiep={(xiNghiep ?? []) as XiNghiep[]}
      loai={initial?.loai ?? loai}
      initial={initial}
    />
  );
}
