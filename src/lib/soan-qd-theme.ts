import type { CapDienAp, LoaiGiaoXn } from "@/lib/types";

/**
 * Palette trang soạn QĐ — pastel có màu (không xám/ghi, không chói).
 */
export type SoanQdTone = "sky" | "emerald" | "rose";

export function resolveSoanQdTone(
  loai: LoaiGiaoXn,
  cap: CapDienAp | null | undefined,
): SoanQdTone {
  if (loai === "thi_nghiem") return "rose";
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
};

export const SOAN_QD_THEME: Record<SoanQdTone, SoanQdTheme> = {
  /** TVTK 110kV — xanh dương pastel */
  sky: {
    pageBg: "from-sky-50 via-[#f3f9fd] to-cyan-50/50",
    headerBorder: "border-sky-200",
    title: "text-sky-900",
    label: "text-sky-700",
    field:
      "border-sky-200 bg-sky-50/30 focus:border-sky-400 focus:ring-sky-100",
    btnPrimary: "bg-sky-500 text-white hover:bg-sky-600",
    btnSecondary:
      "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
    btnWord: "border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-200",
    btnOutline: "border-sky-200 bg-white text-sky-800 hover:bg-sky-50",
    articleBorder: "border-sky-200",
    articleShadow: "shadow-[0_10px_32px_-14px_rgba(14,165,233,0.28)]",
    topBar: "from-sky-300 via-cyan-200 to-sky-200",
    banner: "border-sky-200 bg-gradient-to-b from-sky-100 to-sky-50",
    bannerTitle: "text-sky-950",
    bannerSub: "text-sky-800",
    badge: "bg-sky-400 text-white",
    sectionTitle: "text-sky-900",
    tableHead: "bg-sky-100 text-sky-900",
    tableBorder: "border-sky-200",
    tableRowBorder: "border-sky-100",
    tableFoot: "border-sky-200 bg-sky-50 font-semibold text-sky-900",
    hintBox: "border-sky-200 bg-sky-50 text-sky-800",
    btnRecalc: "border-sky-200 bg-white text-sky-800 hover:bg-sky-50",
    draftStamp: "border-rose-300 bg-rose-50 text-rose-600",
    textMuted: "text-sky-700/70",
    textBody: "text-sky-950",
    closeBtn: "border-sky-200 bg-white text-sky-800 hover:bg-sky-50",
  },
  /** TVTK THA — xanh ngọc pastel */
  emerald: {
    pageBg: "from-teal-50 via-[#f0faf7] to-emerald-50/40",
    headerBorder: "border-teal-200",
    title: "text-teal-900",
    label: "text-teal-700",
    field:
      "border-teal-200 bg-teal-50/30 focus:border-teal-400 focus:ring-teal-100",
    btnPrimary: "bg-teal-500 text-white hover:bg-teal-600",
    btnSecondary:
      "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100",
    btnWord: "border-teal-300 bg-teal-100 text-teal-900 hover:bg-teal-200",
    btnOutline: "border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
    articleBorder: "border-teal-200",
    articleShadow: "shadow-[0_10px_32px_-14px_rgba(20,184,166,0.28)]",
    topBar: "from-teal-300 via-emerald-200 to-teal-200",
    banner: "border-teal-200 bg-gradient-to-b from-teal-100 to-teal-50",
    bannerTitle: "text-teal-950",
    bannerSub: "text-teal-800",
    badge: "bg-teal-400 text-white",
    sectionTitle: "text-teal-900",
    tableHead: "bg-teal-100 text-teal-900",
    tableBorder: "border-teal-200",
    tableRowBorder: "border-teal-100",
    tableFoot: "border-teal-200 bg-teal-50 font-semibold text-teal-900",
    hintBox: "border-teal-200 bg-teal-50 text-teal-800",
    btnRecalc: "border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
    draftStamp: "border-rose-300 bg-rose-50 text-rose-600",
    textMuted: "text-teal-700/70",
    textBody: "text-teal-950",
    closeBtn: "border-teal-200 bg-white text-teal-800 hover:bg-teal-50",
  },
  /** Thí nghiệm / TNHC — hồng đào pastel */
  rose: {
    pageBg: "from-rose-50 via-[#fff7f8] to-orange-50/30",
    headerBorder: "border-rose-200",
    title: "text-rose-950",
    label: "text-rose-700",
    field:
      "border-rose-200 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100",
    btnPrimary: "bg-rose-400 text-white hover:bg-rose-500",
    btnSecondary:
      "border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100",
    btnWord: "border-rose-300 bg-rose-100 text-rose-900 hover:bg-rose-200",
    btnOutline: "border-rose-200 bg-white text-rose-800 hover:bg-rose-50",
    articleBorder: "border-rose-200",
    articleShadow: "shadow-[0_10px_32px_-14px_rgba(251,113,133,0.28)]",
    topBar: "from-rose-300 via-orange-200 to-rose-200",
    banner: "border-rose-200 bg-gradient-to-b from-rose-100 to-rose-50",
    bannerTitle: "text-rose-950",
    bannerSub: "text-rose-800",
    badge: "bg-rose-400 text-white",
    sectionTitle: "text-rose-900",
    tableHead: "bg-rose-100 text-rose-900",
    tableBorder: "border-rose-200",
    tableRowBorder: "border-rose-100",
    tableFoot: "border-rose-200 bg-rose-50 font-semibold text-rose-900",
    hintBox: "border-rose-200 bg-rose-50 text-rose-800",
    btnRecalc: "border-rose-200 bg-white text-rose-800 hover:bg-rose-50",
    draftStamp: "border-rose-400 bg-rose-100 text-rose-700",
    textMuted: "text-rose-700/70",
    textBody: "text-rose-950",
    closeBtn: "border-rose-200 bg-white text-rose-800 hover:bg-rose-50",
  },
};

/** Số QĐ trống trên Word → 10 khoảng trắng (chỗ điền tay sau). */
export const SO_QD_PLACEHOLDER_SPACES = "          ";

export function soQdForWord(raw: string | null | undefined): string {
  const t = raw?.trim();
  return t ? t : SO_QD_PLACEHOLDER_SPACES;
}
