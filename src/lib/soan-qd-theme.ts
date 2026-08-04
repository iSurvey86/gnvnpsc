import type { CapDienAp, LoaiGiaoXn } from "@/lib/types";

/**
 * Palette trang soạn QĐ — pastel có màu (không xám/ghi, không chói).
 */
export type SoanQdTone = "sky" | "emerald" | "amber" | "cyan";

export function resolveSoanQdTone(
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
): SoanQdTone {
  if (loai === "tvgs") return "cyan";
  if (loai === "thi_nghiem") return "amber";
  if (cap === "110kv") return "sky";
  return "emerald";
}

export type SoanQdTheme = {
  pageBg: string;
  headerBorder: string;
  title: string;
  label: string;
  field: string;
  btnPrimary: string;
  btnSecondary: string;
  btnWord: string;
  btnOutline: string;
  articleBorder: string;
  articleShadow: string;
  topBar: string;
  banner: string;
  bannerTitle: string;
  bannerSub: string;
  badge: string;
  sectionTitle: string;
  /** Nền khung mục (đồng bộ, không cầu vồng) */
  panel: string;
  panelAlt: string;
  fieldset: string;
  tableHead: string;
  tableBorder: string;
  tableRowBorder: string;
  tableFoot: string;
  hintBox: string;
  btnRecalc: string;
  draftStamp: string;
  textMuted: string;
  textBody: string;
  closeBtn: string;
  lockedRow: string;
  checkboxAccent: string;
  placeholder: string;
};

export const SOAN_QD_THEME: Record<SoanQdTone, SoanQdTheme> = {
  /** TVTK 110kV — xanh dương pastel */
  sky: {
    pageBg: "from-sky-50 via-[#f3f9fd] to-cyan-50/40",
    headerBorder: "border-sky-200",
    title: "text-sky-900",
    label: "text-sky-700",
    field:
      "border-sky-200 bg-sky-50/30 focus:border-sky-400 focus:ring-sky-100",
    btnPrimary: "bg-sky-600 text-white hover:bg-sky-700",
    btnSecondary:
      "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
    btnWord: "border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-200",
    btnOutline: "border-sky-200 bg-white text-sky-800 hover:bg-sky-50",
    articleBorder: "border-sky-200",
    articleShadow: "shadow-[0_10px_32px_-14px_rgba(14,165,233,0.22)]",
    topBar: "from-sky-300 via-cyan-200 to-sky-200",
    banner: "border-sky-200 bg-gradient-to-b from-sky-100 to-sky-50",
    bannerTitle: "text-sky-950",
    bannerSub: "text-sky-800",
    badge: "bg-sky-500 text-white",
    sectionTitle: "text-sky-900",
    panel: "rounded-lg border border-sky-100 bg-sky-50/55 px-2.5 py-2",
    panelAlt: "rounded-lg border border-sky-100/90 bg-[#f2f8fc] px-2.5 py-2",
    fieldset: "rounded-md border border-sky-200/80 bg-white/95 px-2.5 pb-1.5 pt-0",
    tableHead: "bg-sky-100 text-sky-900",
    tableBorder: "border-sky-200",
    tableRowBorder: "border-sky-100",
    tableFoot: "border-sky-200 bg-sky-50 font-semibold text-sky-900",
    hintBox: "border-sky-200 bg-sky-50 text-sky-800",
    btnRecalc: "border-sky-200 bg-white text-sky-800 hover:bg-sky-50",
    draftStamp: "border-rose-300 bg-rose-50 text-rose-600",
    textMuted: "text-sky-700/75",
    textBody: "text-sky-950",
    closeBtn: "border-sky-200 bg-white text-sky-800 hover:bg-sky-50",
    lockedRow: "bg-sky-50/70 text-sky-700/55",
    checkboxAccent: "accent-sky-600",
    placeholder: "text-sky-400",
  },
  /** TVTK THA — xanh ngọc pastel */
  emerald: {
    pageBg: "from-teal-50 via-[#f0faf7] to-emerald-50/35",
    headerBorder: "border-teal-200",
    title: "text-teal-900",
    label: "text-teal-700",
    field:
      "border-teal-200 bg-teal-50/30 focus:border-teal-400 focus:ring-teal-100",
    btnPrimary: "bg-teal-600 text-white hover:bg-teal-700",
    btnSecondary:
      "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100",
    btnWord: "border-teal-300 bg-teal-100 text-teal-900 hover:bg-teal-200",
    btnOutline: "border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
    articleBorder: "border-teal-200",
    articleShadow: "shadow-[0_10px_32px_-14px_rgba(20,184,166,0.22)]",
    topBar: "from-teal-300 via-emerald-200 to-teal-200",
    banner: "border-teal-200 bg-gradient-to-b from-teal-100 to-teal-50",
    bannerTitle: "text-teal-950",
    bannerSub: "text-teal-800",
    badge: "bg-teal-500 text-white",
    sectionTitle: "text-teal-900",
    panel: "rounded-lg border border-teal-100 bg-teal-50/55 px-2.5 py-2",
    panelAlt: "rounded-lg border border-teal-100/90 bg-[#f0f8f5] px-2.5 py-2",
    fieldset: "rounded-md border border-teal-200/80 bg-white/95 px-2.5 pb-1.5 pt-0",
    tableHead: "bg-teal-100 text-teal-900",
    tableBorder: "border-teal-200",
    tableRowBorder: "border-teal-100",
    tableFoot: "border-teal-200 bg-teal-50 font-semibold text-teal-900",
    hintBox: "border-teal-200 bg-teal-50 text-teal-800",
    btnRecalc: "border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
    draftStamp: "border-rose-300 bg-rose-50 text-rose-600",
    textMuted: "text-teal-700/75",
    textBody: "text-teal-950",
    closeBtn: "border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
    lockedRow: "bg-teal-50/70 text-teal-700/55",
    checkboxAccent: "accent-teal-600",
    placeholder: "text-teal-400",
  },
  /** Thí nghiệm / TNHC — vàng cát trầm */
  amber: {
    pageBg: "from-amber-50/50 via-[#fbfaf6] to-orange-50/25",
    headerBorder: "border-amber-200/70",
    title: "text-amber-950",
    label: "text-amber-800",
    field:
      "border-amber-200 bg-amber-50/20 focus:border-amber-400 focus:ring-amber-100",
    btnPrimary: "bg-amber-700 text-white hover:bg-amber-800",
    btnSecondary:
      "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100",
    btnWord: "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200",
    btnOutline: "border-amber-200 bg-white text-amber-900 hover:bg-amber-50",
    articleBorder: "border-amber-200",
    articleShadow: "shadow-[0_6px_20px_-16px_rgba(120,86,25,0.28)]",
    topBar: "from-amber-200 via-amber-100 to-orange-100",
    banner: "border-amber-200 bg-amber-50/60",
    bannerTitle: "text-amber-950",
    bannerSub: "text-amber-900",
    badge: "bg-amber-700 text-white",
    sectionTitle: "text-amber-900",
    panel: "rounded-lg border border-amber-100 bg-amber-50/45 px-2.5 py-2",
    panelAlt: "rounded-lg border border-amber-100/90 bg-[#faf6ee] px-2.5 py-2",
    fieldset: "rounded-md border border-amber-200/80 bg-white/95 px-2.5 pb-1.5 pt-0",
    tableHead: "bg-amber-100/70 text-amber-900",
    tableBorder: "border-amber-200",
    tableRowBorder: "border-amber-100",
    tableFoot: "border-amber-200 bg-amber-50 font-semibold text-amber-900",
    hintBox: "border-amber-200 bg-amber-50 text-amber-900",
    btnRecalc: "border-amber-200 bg-white text-amber-900 hover:bg-amber-50",
    draftStamp: "border-rose-300 bg-rose-50 text-rose-600",
    textMuted: "text-amber-800/70",
    textBody: "text-amber-950",
    closeBtn: "border-amber-200 bg-white text-amber-900 hover:bg-amber-50",
    lockedRow: "bg-amber-50/60 text-amber-800/50",
    checkboxAccent: "accent-amber-700",
    placeholder: "text-amber-400",
  },
  /**
   * TVGS — xanh cyan dịu (một tone thống nhất, không cầu vồng / không xám).
   */
  cyan: {
    pageBg: "from-cyan-50/70 via-[#f2fafb] to-teal-50/30",
    headerBorder: "border-cyan-200/80",
    title: "text-cyan-950",
    label: "text-cyan-800",
    field:
      "border-cyan-200 bg-cyan-50/25 focus:border-cyan-400 focus:ring-cyan-100",
    btnPrimary: "bg-cyan-700 text-white hover:bg-cyan-800",
    btnSecondary:
      "border-cyan-200 bg-cyan-50 text-cyan-900 hover:bg-cyan-100",
    btnWord: "border-cyan-300 bg-cyan-100 text-cyan-950 hover:bg-cyan-200",
    btnOutline: "border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-50",
    articleBorder: "border-cyan-200",
    articleShadow: "shadow-[0_8px_28px_-16px_rgba(8,145,178,0.28)]",
    topBar: "from-cyan-300 via-teal-200 to-cyan-100",
    banner: "border-cyan-200 bg-gradient-to-b from-cyan-50 to-[#f4fbfc]",
    bannerTitle: "text-cyan-950",
    bannerSub: "text-cyan-800",
    badge: "bg-cyan-700 text-white",
    sectionTitle: "text-cyan-900",
    panel: "rounded-lg border border-cyan-100 bg-cyan-50/50 px-2.5 py-2",
    panelAlt: "rounded-lg border border-cyan-100/90 bg-[#eef8fa] px-2.5 py-2",
    fieldset: "rounded-md border border-cyan-200/80 bg-white/95 px-2.5 pb-1.5 pt-0",
    tableHead: "bg-cyan-100/80 text-cyan-950",
    tableBorder: "border-cyan-200",
    tableRowBorder: "border-cyan-100",
    tableFoot: "border-cyan-200 bg-cyan-50/80 font-semibold text-cyan-950",
    hintBox: "border-cyan-200 bg-cyan-50 text-cyan-900",
    btnRecalc: "border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-50",
    draftStamp: "border-rose-300 bg-rose-50 text-rose-600",
    textMuted: "text-cyan-800/70",
    textBody: "text-cyan-950",
    closeBtn: "border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-50",
    lockedRow: "bg-cyan-50/80 text-cyan-800/50",
    checkboxAccent: "accent-cyan-700",
    placeholder: "text-cyan-400",
  },
};

/** Số QĐ trống trên Word → 10 khoảng trắng (chỗ điền tay sau). */
export const SO_QD_PLACEHOLDER_SPACES = "          ";

export function soQdForWord(raw: string | null | undefined): string {
  const t = raw?.trim();
  return t ? t : SO_QD_PLACEHOLDER_SPACES;
}
