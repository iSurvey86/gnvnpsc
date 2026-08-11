"use client";

type Props = {
  hoTen: string;
  label: string;
  exiting?: boolean;
  onExit: () => void;
};

export function ViewAsPermissionBanner({
  hoTen,
  label,
  exiting = false,
  onExit,
}: Props) {
  return (
    <div className="shrink-0 border-b border-teal-700 bg-teal-700 text-teal-50 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <p className="min-w-0 text-[12px] font-bold leading-snug sm:text-[13px]">
          <span className="mr-1.5 inline-block rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-black tracking-wide text-teal-900 uppercase">
            Xem quyền
          </span>
          Đang xem như{" "}
          <span className="font-black text-white">{hoTen}</span>
          <span className="font-semibold text-teal-100"> · {label}</span>
        </p>
        <button
          type="button"
          disabled={exiting}
          onClick={onExit}
          className="shrink-0 rounded-lg border border-teal-900/20 bg-white px-3 py-1.5 text-[11px] font-black tracking-wide text-teal-900 uppercase shadow-sm hover:bg-teal-50 disabled:opacity-50"
        >
          {exiting ? "Đang thoát…" : "Thoát chế độ xem"}
        </button>
      </div>
    </div>
  );
}
