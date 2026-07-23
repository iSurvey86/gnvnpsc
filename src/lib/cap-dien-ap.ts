/** Cấp điện áp dự án PCM */
export type CapDienAp = "110kv" | "trung_ha_ap";

export const CAP_DIEN_AP_OPTIONS: Array<{ value: CapDienAp; label: string }> = [
  { value: "110kv", label: "110 kV" },
  { value: "trung_ha_ap", label: "Trung hạ áp" },
];

export function labelCapDienAp(v: string | null | undefined): string {
  if (v === "110kv") return "110 kV";
  if (v === "trung_ha_ap") return "Trung hạ áp";
  return "—";
}

export function normalizeCapDienAp(
  raw: string | null | undefined,
): CapDienAp | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (
    s.includes("110") ||
    s === "110kv" ||
    s === "110 kv" ||
    s.includes("cao áp") ||
    s.includes("cao ap")
  ) {
    return "110kv";
  }
  if (
    s.includes("trung") ||
    s.includes("hạ áp") ||
    s.includes("ha ap") ||
    s === "tha" ||
    s === "trung_ha_ap"
  ) {
    return "trung_ha_ap";
  }
  return null;
}
