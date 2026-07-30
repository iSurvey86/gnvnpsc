"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { XiNghiepPicker } from "@/components/XiNghiepPicker";
import { CAP_DIEN_AP_OPTIONS } from "@/lib/cap-dien-ap";
import { normalizeDiaDiem } from "@/lib/dia-diem";
import type { CapDienAp, DuAn, XiNghiep } from "@/lib/types";

type Props = {
  duAn: DuAn;
  xiNghiep: XiNghiep[];
};

const field =
  "w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-200";

export function SuaDuAnForm({ duAn, xiNghiep }: Props) {
  const router = useRouter();
  const [maDuAn, setMaDuAn] = useState(duAn.ma_du_an ?? "");
  const [tenDuAn, setTenDuAn] = useState(duAn.ten_du_an);
  const [diaDiem, setDiaDiem] = useState(duAn.dia_diem ?? "");
  const [capDienAp, setCapDienAp] = useState<CapDienAp | "">(
    duAn.cap_dien_ap ?? "",
  );
  const [xiId, setXiId] = useState<string | null>(duAn.xi_nghiep_id ?? null);
  const [quyMo, setQuyMo] = useState(duAn.quy_mo ?? "");
  const [ghiChu, setGhiChu] = useState(duAn.ghi_chu ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenDuAn.trim()) {
      setError("Tên dự án không được trống");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/du-an/${duAn.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_du_an: maDuAn.trim() || null,
          ten_du_an: tenDuAn.trim(),
          dia_diem: normalizeDiaDiem(diaDiem) || null,
          cap_dien_ap: capDienAp || null,
          xi_nghiep_id: xiId,
          quy_mo: quyMo.trim() || null,
          ghi_chu: ghiChu.trim() || null,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      router.push("/tvtk");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="rounded-2xl border border-teal-200/80 bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-[13px] font-black tracking-wider text-teal-800 uppercase">
          Thông tin chung
        </h2>

        <div className="grid gap-4 lg:grid-cols-12">
          <label className="block lg:col-span-4">
            <FieldLabel>Mã dự án</FieldLabel>
            <input
              value={maDuAn}
              onChange={(e) => setMaDuAn(e.target.value)}
              className={`${field} font-mono text-[13px]`}
              placeholder="TỈNH-NĂM-110|THA-VIẾTTẮT"
            />
          </label>

          <label className="block lg:col-span-8">
            <FieldLabel>Tên dự án</FieldLabel>
            <textarea
              value={tenDuAn}
              onChange={(e) => setTenDuAn(e.target.value)}
              rows={2}
              className={`${field} resize-none leading-snug`}
            />
          </label>

          <label className="block lg:col-span-4">
            <FieldLabel>Địa điểm</FieldLabel>
            <input
              value={diaDiem}
              onChange={(e) => setDiaDiem(e.target.value)}
              className={field}
              placeholder="Tỉnh / thành phố"
            />
          </label>

          <label className="block lg:col-span-4">
            <FieldLabel>Cấp điện áp</FieldLabel>
            <select
              value={capDienAp}
              onChange={(e) =>
                setCapDienAp((e.target.value || "") as CapDienAp | "")
              }
              className={`${field} cursor-pointer`}
            >
              <option value="">— Chưa chọn —</option>
              {CAP_DIEN_AP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="lg:col-span-4">
            <FieldLabel>Xí nghiệp được giao</FieldLabel>
            <XiNghiepPicker
              options={xiNghiep}
              value={xiId}
              onChange={setXiId}
            />
          </div>

          <label className="block lg:col-span-12">
            <FieldLabel>Quy mô</FieldLabel>
            <textarea
              value={quyMo}
              onChange={(e) => setQuyMo(e.target.value)}
              rows={8}
              className={`${field} resize-y leading-relaxed font-medium`}
            />
          </label>

          <label className="block lg:col-span-12">
            <FieldLabel>Ghi chú</FieldLabel>
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              rows={2}
              className={`${field} resize-y leading-snug font-medium`}
            />
          </label>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/tvtk")}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl border-2 border-teal-500 bg-teal-50 px-6 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-100 disabled:opacity-60"
        >
          {saving ? "Đang lưu…" : "Lưu thông tin"}
        </button>
      </div>
    </form>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-teal-700 uppercase">
      {children}
    </span>
  );
}
