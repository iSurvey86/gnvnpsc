/** Banner tiêu đề Quyết định — dùng chung trang soạn & bản in */

import type { SoanQdTone } from "@/lib/soan-qd-theme";
import { SOAN_QD_THEME } from "@/lib/soan-qd-theme";

type Props = {
  /** VD: «thí nghiệm, hiệu chỉnh» / «tư vấn thiết kế 110kV» */
  loaiNhiemVu: string;
  tenXiNghiep: string;
  /** Hiện dấu Dự thảo (trang soạn) */
  showDraftStamp?: boolean;
  /** Màu theo loại: 110 → sky, THA → emerald, TN → vàng cát */
  tone?: SoanQdTone;
  className?: string;
};

export function QdGiaoXnDocBanner({
  loaiNhiemVu,
  tenXiNghiep,
  showDraftStamp = false,
  tone = "emerald",
  className = "",
}: Props) {
  const theme = SOAN_QD_THEME[tone];
  return (
    <div
      className={`relative border-b px-4 py-3.5 text-center md:px-8 md:py-4 ${theme.banner} ${className}`}
    >
      {showDraftStamp ? (
        <span
          className={`absolute top-3 right-3 rotate-[-8deg] rounded border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase shadow-sm md:top-4 md:right-5 md:text-[11px] ${theme.draftStamp}`}
          aria-hidden
        >
          Dự thảo
        </span>
      ) : null}
      {/* Cùng leading + gap đều giữa các dòng */}
      <div className="mx-auto flex max-w-3xl flex-col gap-1 px-10 leading-snug md:px-12">
        <p
          className={`text-[13px] font-bold uppercase tracking-wide md:text-[15px] ${theme.bannerTitle}`}
        >
          Về việc giao nhiệm vụ {loaiNhiemVu}
          {"\u00A0"}cho
        </p>
        <p
          className={`text-[12px] font-medium uppercase md:text-[13px] ${theme.bannerTitle}`}
        >
          {tenXiNghiep || "…"}
        </p>
      </div>
    </div>
  );
}
