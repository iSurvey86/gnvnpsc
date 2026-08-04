import { notFound, redirect } from "next/navigation";
import { SoanQdGiaoXnEditor } from "@/components/SoanQdGiaoXnEditor";
import { isPhanHeCode, PHAN_HE, type PhanHeCode } from "@/lib/phan-he";
import { loadPhuLucGiaoXnContext } from "@/lib/qd-giao-xn-map";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DuAn, LoaiGiaoXn, QdGiaoA, QdGiaoXn, XiNghiep } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ loai?: string; qdId?: string }>;
};

function oneRel<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function parseLoaiGiao(
  raw: string | undefined,
  fallback: LoaiGiaoXn,
): LoaiGiaoXn {
  if (raw === "tvtk" || raw === "thi_nghiem" || raw === "tvgs") return raw;
  return fallback;
}

export default async function SoanQdGiaoXnPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = createAdminClient();
  const { data: duAn, error } = await supabase
    .from("du_an")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !duAn) notFound();

  const phanHe: PhanHeCode = isPhanHeCode(duAn.phan_he) ? duAn.phan_he : "tvtk";
  const loaiMacDinh = PHAN_HE[phanHe].defaultLoaiGiao;
  const loai: LoaiGiaoXn = parseLoaiGiao(sp.loai, loaiMacDinh);

  if (loai === "tvtk" && !(duAn as DuAn).cap_dien_ap) {
    redirect(`/du-an/${id}/giao-xn?phan_he=${phanHe}`);
  }

  if (!sp.qdId) {
    const { data: owned } = await supabase
      .from("qd_giao_xn")
      .select("id, loai, du_an_id")
      .eq("du_an_id", id)
      .eq("loai", loai)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (owned) {
      redirect(
        `/du-an/${id}/giao-xn/soan?loai=${owned.loai}&qdId=${owned.id}`,
      );
    }

    const { data: maps } = await supabase
      .from("qd_giao_xn_du_an")
      .select("qd_giao_xn:qd_giao_xn_id ( id, loai, du_an_id )")
      .eq("du_an_id", id);
    for (const m of maps ?? []) {
      const q = oneRel(
        m.qd_giao_xn as
          | { id: string; loai: string; du_an_id: string }
          | { id: string; loai: string; du_an_id: string }[]
          | null,
      );
      if (q?.loai === loai) {
        redirect(
          `/du-an/${q.du_an_id}/giao-xn/soan?loai=${q.loai}&qdId=${q.id}`,
        );
      }
    }
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
      .maybeSingle();
    const qd = (data as QdGiaoXn) ?? null;
    if (qd) {
      if (qd.du_an_id !== id) {
        const { data: mapOk } = await supabase
          .from("qd_giao_xn_du_an")
          .select("du_an_id")
          .eq("qd_giao_xn_id", qd.id)
          .eq("du_an_id", id)
          .maybeSingle();
        if (mapOk) {
          redirect(
            `/du-an/${qd.du_an_id}/giao-xn/soan?loai=${qd.loai}&qdId=${qd.id}`,
          );
        }
      } else {
        initial = qd;
      }
    }
  }

  const loaiHieuLuc: LoaiGiaoXn =
    phanHe === "tvgs"
      ? "tvgs"
      : phanHe === "thi_nghiem"
        ? "thi_nghiem"
        : ((initial?.loai ?? loai) as LoaiGiaoXn);
  const phuLucCtx = await loadPhuLucGiaoXnContext(supabase, {
    qdGiaoAId: (duAn.qd_giao_a_id as string | null) ?? null,
    phanHe,
    loai: loaiHieuLuc,
    excludeQdId: initial?.id ?? null,
  }).catch(() => ({
    daGiaoKhac: [],
    tenTrongQdHienTai: [] as string[],
    soDaChuaGiao: 0,
  }));

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
      loai={loaiHieuLuc}
      initial={initial}
      phuLucCtx={phuLucCtx}
    />
  );
}
