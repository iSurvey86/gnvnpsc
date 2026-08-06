import { notFound } from "next/navigation";
import { GiaoATheoDoiClient } from "@/components/GiaoATheoDoiClient";
import { isPhanHeCode, type PhanHeCode } from "@/lib/phan-he";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phan_he?: string }>;
};

export default async function GiaoATheoDoiPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const raw = sp.phan_he;
  if (!isPhanHeCode(raw)) notFound();
  const phanHe: PhanHeCode = raw;

  return <GiaoATheoDoiClient giaoAId={id} phanHe={phanHe} />;
}
