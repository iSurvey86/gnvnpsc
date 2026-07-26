"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DuAn, LoaiGiaoXn, QdGiaoA, XiNghiep } from "@/lib/types";

type Props = {
  duAn: DuAn;
  qd: QdGiaoA | null;
  xiNghiep: XiNghiep[];
  initialLoai?: LoaiGiaoXn;
  /** Khóa radio loại giao (khi mở từ thẻ) */
  lockLoai?: boolean;
  /** Ẩn khung dự án trùng với mục I */
  embedded?: boolean;
  onSaved?: () => void;
};

function defaultLoaiFromHuong(huong: DuAn["huong_giao"]): LoaiGiaoXn {
  if (huong === "tn") return "thi_nghiem";
  return "tvtk";
}

export function SoanQdGiaoXnForm({
  duAn,
  qd,
  xiNghiep,
  initialLoai,
  lockLoai = false,
  embedded = false,
  onSaved,
}: Props) {
  const router = useRouter();
  const defaultCanCu = useMemo(() => {
    if (!qd?.so_qd) return "";
    return `Căn cứ QĐ Giao A số ${qd.so_qd}${qd.ngay_qd ? ` ngày ${qd.ngay_qd}` : ""}`;
  }, [qd]);

  const [loai, setLoai] = useState<LoaiGiaoXn>(
    () => initialLoai ?? defaultLoaiFromHuong(duAn.huong_giao),
  );
  const [soQd, setSoQd] = useState("");
  const [ngay, setNgay] = useState("");
  const [xiId, setXiId] = useState("");
  const [phamVi, setPhamVi] = useState(duAn.quy_mo ?? "");
  const [thoiHan, setThoiHan] = useState("");
  const [canCu, setCanCu] = useState(defaultCanCu);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredXn = useMemo(
    () =>
      xiNghiep.filter((x) =>
        loai === "tvtk" ? x.phu_hop_tvtk : x.phu_hop_thi_nghiem,
      ),
    [xiNghiep, loai],
  );

  useEffect(() => {
    if (!xiId) return;
    const stillOk = filteredXn.some((x) => x.id === xiId);
    if (!stillOk) setXiId("");
  }, [filteredXn, xiId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!xiId) {
      setError("Chọn Xí nghiệp nhận từ danh mục");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/qd-giao-xn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          du_an_id: duAn.id,
          loai,
          so_qd_du_thao: soQd || null,
          ngay_du_thao: ngay || null,
          xi_nghiep_id: xiId,
          pham_vi: phamVi || null,
          thoi_han: thoiHan || null,
          can_cu: canCu || null,
          trang_thai: "nhap",
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      onSaved?.();
      router.refresh();
      if (!embedded) {
        router.push("/qd-giao-xn");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-200/60";

  return (
    <form
      onSubmit={onSubmit}
      className={
        embedded
          ? "space-y-4"
          : "space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      }
    >
      {!embedded ? (
        <div className="rounded-xl border border-cyan-100 bg-gradient-to-br from-[#ecfeff] to-[#cffafe]/70 px-3 py-2 text-sm text-cyan-900">
          Dự án: <strong>{duAn.ten_du_an}</strong>
          {duAn.ma_du_an ? (
            <span className="mt-0.5 block font-mono text-[11px] text-cyan-800/70">
              {duAn.ma_du_an}
            </span>
          ) : null}
        </div>
      ) : null}

      {!lockLoai ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-800">
            Loại hình giao
          </legend>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="loai"
                checked={loai === "tvtk"}
                onChange={() => setLoai("tvtk")}
              />
              Tư vấn thiết kế
              {duAn.cap_dien_ap === "110kv"
                ? " 110kV"
                : duAn.cap_dien_ap === "trung_ha_ap"
                  ? " trung, hạ áp"
                  : ""}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="loai"
                checked={loai === "thi_nghiem"}
                onChange={() => setLoai("thi_nghiem")}
              />
              Thí nghiệm, hiệu chỉnh
            </label>
          </div>
          {duAn.huong_giao === "tvtk_tn" ? (
            <p className="text-xs text-amber-700">
              Dự án đánh dấu TVTK &amp; TN — chọn đúng loại QĐ đang soạn.
            </p>
          ) : null}
        </fieldset>
      ) : (
        <p className="text-xs text-slate-500">
          Loại hình:{" "}
          <strong className="text-slate-800">
            {loai === "tvtk"
              ? duAn.cap_dien_ap === "110kv"
                ? "Tư vấn thiết kế 110kV"
                : duAn.cap_dien_ap === "trung_ha_ap"
                  ? "Tư vấn thiết kế trung, hạ áp"
                  : "Tư vấn thiết kế"
              : "Thí nghiệm, hiệu chỉnh"}
          </strong>
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">
            Số QĐ dự thảo
          </span>
          <input
            value={soQd}
            onChange={(e) => setSoQd(e.target.value)}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">
            Ngày dự thảo
          </span>
          <input
            type="date"
            value={ngay}
            onChange={(e) => setNgay(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-600">
          Tên đơn vị (Xí nghiệp nhận)
        </span>
        <select
          required
          value={xiId}
          onChange={(e) => setXiId(e.target.value)}
          className={field}
        >
          <option value="">— Chọn từ danh mục —</option>
          {filteredXn.map((x) => (
            <option key={x.id} value={x.id}>
              {x.ten}
              {x.ma ? ` (${x.ma})` : ""}
            </option>
          ))}
        </select>
        {filteredXn.length === 0 ? (
          <p className="mt-1 text-xs text-rose-600">
            Chưa có Xí nghiệp phù hợp loại này — chạy SQL seed danh mục.
          </p>
        ) : null}
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-600">
          Phạm vi / nội dung giao
        </span>
        <textarea
          value={phamVi}
          onChange={(e) => setPhamVi(e.target.value)}
          rows={3}
          className={field}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-600">Thời hạn</span>
        <input
          value={thoiHan}
          onChange={(e) => setThoiHan(e.target.value)}
          placeholder="VD: 30 ngày kể từ ngày ký"
          className={field}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-600">Căn cứ</span>
        <textarea
          value={canCu}
          onChange={(e) => setCanCu(e.target.value)}
          rows={2}
          className={field}
        />
      </label>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-slate-500">
        Xuất Word sẽ bổ sung khi có mẫu TVTK / Thí nghiệm.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
      >
        {loading ? "Đang lưu…" : "Lưu dự thảo QĐ giao XN"}
      </button>
    </form>
  );
}
