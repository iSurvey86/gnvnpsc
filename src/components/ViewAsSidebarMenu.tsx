"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VIEW_AS_PRESETS, type ViewAsCap } from "@/lib/view-as";

type ViewAsInfo = {
  cap: ViewAsCap;
  ma_nv: string;
  ho_ten: string;
  label: string;
} | null;

type Props = {
  pinned: boolean;
  labelClass: string;
  viewAs: ViewAsInfo;
  onChanged: () => void;
};

export function ViewAsSidebarMenu({
  pinned,
  labelClass,
  viewAs,
  onChanged,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(viewAs));
  const [switching, setSwitching] = useState(false);
  const [exiting, setExiting] = useState(false);

  async function pick(cap: ViewAsCap) {
    if (switching || viewAs?.cap === cap) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/view-as", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cap }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Không đổi được chế độ xem");
      onChanged();
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setSwitching(false);
    }
  }

  async function exitViewAs() {
    if (exiting || switching) return;
    setExiting(true);
    try {
      const res = await fetch("/api/view-as", { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Không thoát được");
      onChanged();
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setExiting(false);
    }
  }

  const active = Boolean(viewAs);

  return (
    <div className="mt-0.5">
      <div className="my-2 h-px bg-teal-200/70" />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full cursor-pointer items-center rounded-lg px-2.5 py-2.5 text-sm font-bold transition-all ${
          active
            ? "bg-teal-100 text-teal-950 shadow-sm ring-1 ring-teal-300"
            : "text-teal-800 hover:bg-teal-50 hover:text-teal-950"
        } ${pinned ? "" : "justify-center group-hover:justify-start"}`}
        aria-expanded={open}
        title="Xem với quyền (persona test)"
      >
        <span className="flex w-5 shrink-0 justify-center text-base">👁️</span>
        <span className={`${labelClass} flex-1 text-left`}>
          {viewAs?.ho_ten ?? "Xem với quyền"}
        </span>
        <span
          className={`shrink-0 text-[10px] transition-transform ${
            pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
      </button>

      {open ? (
        <div className="mt-0.5 ml-2 space-y-0.5 border-l border-teal-300/80 pb-1 pl-2">
          {VIEW_AS_PRESETS.map((preset) => {
            const isActive = viewAs?.cap === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={switching}
                onClick={() => void pick(preset.id)}
                className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[12px] font-semibold transition-all disabled:opacity-50 ${
                  isActive
                    ? "bg-teal-200/80 text-teal-950"
                    : "text-slate-800 hover:bg-teal-50 hover:text-teal-950"
                }`}
                title={preset.mo_ta}
              >
                <span className="flex w-5 shrink-0 justify-center text-sm">
                  {isActive ? "●" : "○"}
                </span>
                <span className={labelClass}>
                  <span className="block leading-tight">{preset.ho_ten}</span>
                  <span className="block text-[10px] font-medium leading-tight text-slate-500">
                    {preset.label}
                  </span>
                </span>
              </button>
            );
          })}
          {active ? (
            <button
              type="button"
              disabled={exiting || switching}
              onClick={() => void exitViewAs()}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[12px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <span className="flex w-5 shrink-0 justify-center text-sm">↩</span>
              <span className={labelClass}>Thoát chế độ xem</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
