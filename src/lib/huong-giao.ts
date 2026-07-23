import type { HuongGiao } from "@/lib/types";

export const HUONG_GIAO_OPTIONS: Array<{
  value: HuongGiao;
  label: string;
}> = [
  { value: "tvtk", label: "TVTK" },
  { value: "tn", label: "TN" },
  { value: "tvtk_tn", label: "TVTK & TN" },
];

export function labelHuongGiao(v: string | null | undefined): string {
  const found = HUONG_GIAO_OPTIONS.find((o) => o.value === v);
  return found?.label ?? "—";
}
