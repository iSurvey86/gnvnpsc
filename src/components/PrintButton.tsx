"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white"
    >
      In / PDF
    </button>
  );
}
