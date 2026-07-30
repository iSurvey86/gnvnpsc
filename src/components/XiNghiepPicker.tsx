"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { XiNghiep } from "@/lib/types";

type Props = {
  options: XiNghiep[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

function boDau(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/** Chọn 1 Xí nghiệp — có ô tìm kiếm, panel bám theo nút nên không bị bảng cắt mất. */
export function XiNghiepPicker({
  options,
  value,
  onChange,
  placeholder = "Chọn Xí nghiệp",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = boDau(term.trim());
    if (!q) return options;
    return options.filter((o) => boDau(`${o.ten} ${o.ma ?? ""}`).includes(q));
  }, [options, term]);

  useEffect(() => {
    if (!open) return;

    function place() {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = Math.max(r.width, 280);
      setPos({
        top: r.bottom + 4,
        left: Math.min(r.left, window.innerWidth - width - 12),
        width,
      });
    }
    place();

    function onPointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  function pick(id: string | null) {
    onChange(id);
    setOpen(false);
    setTerm("");
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full rounded-lg border px-2 py-1.5 text-left text-[12px] leading-tight font-semibold transition ${
          selected
            ? "border-violet-200 bg-white text-violet-900 hover:border-violet-300"
            : "border-dashed border-violet-200 bg-white/60 text-violet-400 hover:border-violet-300"
        } disabled:cursor-not-allowed disabled:opacity-60`}
        title={selected ? selected.ten : placeholder}
      >
        <span className="line-clamp-2">{selected?.ten ?? placeholder}</span>
      </button>

      {open && pos
        ? createPortal(
            <div
              ref={panelRef}
              style={{ top: pos.top, left: pos.left, width: pos.width }}
              className="fixed z-50 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-xl"
            >
              <div className="border-b border-violet-100 p-2">
                <input
                  autoFocus
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Tìm Xí nghiệp…"
                  className="w-full rounded-lg border border-violet-200 px-2.5 py-1.5 text-[12px] font-medium text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div className="max-h-64 overflow-auto py-1">
                {selected ? (
                  <button
                    type="button"
                    onClick={() => pick(null)}
                    className="block w-full px-3 py-1.5 text-left text-[12px] font-semibold text-rose-500 hover:bg-rose-50"
                  >
                    Bỏ chọn Xí nghiệp
                  </button>
                ) : null}
                {filtered.length === 0 ? (
                  <p className="px-3 py-3 text-[12px] text-slate-400">
                    Không tìm thấy Xí nghiệp
                  </p>
                ) : (
                  filtered.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => pick(o.id)}
                      className={`block w-full px-3 py-1.5 text-left text-[12px] leading-snug transition hover:bg-violet-50 ${
                        o.id === value
                          ? "bg-violet-50 font-bold text-violet-900"
                          : "font-medium text-slate-700"
                      }`}
                    >
                      {o.ten}
                      {o.ma ? (
                        <span className="ml-1 font-mono text-[10px] text-slate-400">
                          {o.ma}
                        </span>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
