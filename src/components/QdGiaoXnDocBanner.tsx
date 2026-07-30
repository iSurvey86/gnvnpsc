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
      className={`relative border-b px-6 py-7 text-center md:px-10 ${theme.banner} ${className}`}
    >
      {showDraftStamp ? (
        <span
          className={`absolute top-3 right-3 rotate-[-8deg] rounded border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase shadow-sm md:top-4 md:right-5 md:text-[11px] ${theme.draftStamp}`}
          aria-hidden
        >
          Dự thảo
        </span>
      ) : null}
      <p
        className={`text-[17px] font-semibold leading-snug uppercase md:text-[19px] ${theme.bannerTitle}`}
      >
        Công ty Dịch vụ Điện lực miền Bắc
      </p>
      <p
        className={`mt-2 text-[14px] font-semibold leading-snug uppercase md:text-[15px] ${theme.bannerTitle}`}
      >
        Quyết định
      </p>
      <div
        className={`mx-auto mt-3 max-w-md space-y-1 text-[13px] font-normal leading-relaxed ${theme.bannerSub}`}
      >
        <p>Về việc giao nhiệm vụ {loaiNhiemVu} cho</p>
        <p className={`font-medium uppercase ${theme.bannerTitle}`}>
          {tenXiNghiep || "…"}
        </p>
      </div>
    </div>
  );
}
