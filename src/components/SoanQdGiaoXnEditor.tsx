"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  DuAn,
  LoaiGiaoXn,
  QdGiaoA,
  QdGiaoXn,
  XiNghiep,
} from "@/lib/types";

type Props = {
  duAn: DuAn;
  qdGiaoA: QdGiaoA | null;
  xiNghiep: XiNghiep[];
  loai: LoaiGiaoXn;
  initial: QdGiaoXn | null;
};

function labelLoai(loai: LoaiGiaoXn, cap: DuAn["cap_dien_ap"]): string {
  if (loai === "thi_nghiem") return "Thí nghiệm, hiệu chỉnh";
  if (cap === "110kv") return "Tư vấn thiết kế 110kV";
  if (cap === "trung_ha_ap") return "Tư vấn thiết kế trung, hạ áp";
  return "Tư vấn thiết kế";
}

export function SoanQdGiaoXnEditor({
  duAn,
  qdGiaoA,
  xiNghiep,
  loai,
  initial,
}: Props) {
  const router = useRouter();
  const backHref = `/du-an/${duAn.id}/giao-xn`;

  const defaultCanCu = useMemo(() => {
    if (!qdGiaoA?.so_qd) return "";
    return `Căn cứ QĐ Giao A số ${qdGiaoA.so_qd}${
      qdGiaoA.ngay_qd ? ` ngày ${qdGiaoA.ngay_qd}` : ""
    }`;
  }, [qdGiaoA]);

  const [qdId, setQdId] = useState<string | null>(initial?.id ?? null);
  const [soQd, setSoQd] = useState(initial?.so_qd_du_thao ?? "");
  const [ngay, setNgay] = useState(initial?.ngay_du_thao ?? "");
  const [xiId, setXiId] = useState(initial?.xi_nghiep_id ?? "");
  const [phamVi, setPhamVi] = useState(
    initial?.pham_vi ?? duAn.quy_mo ?? "",
  );
  const [thoiHan, setThoiHan] = useState(initial?.thoi_han ?? "");
  const [canCu, setCanCu] = useState(initial?.can_cu ?? defaultCanCu);
  const [tenPcTinh, setTenPcTinh] = useState("");
  const [namKeHoach, setNamKeHoach] = useState(
    () => String(new Date().getFullYear() + 1),
  );
  const [soTienTamUng, setSoTienTamUng] = useState("");
  const [soTienTamUngChu, setSoTienTamUngChu] = useState("");
  const [soLuongCt, setSoLuongCt] = useState("");
  const [busy, setBusy] = useState<"save" | "close" | "word" | "pdf" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const filteredXn = useMemo(
    () =>
      xiNghiep.filter((x) =>
        loai === "tvtk" ? x.phu_hop_tvtk : x.phu_hop_thi_nghiem,
      ),
    [xiNghiep, loai],
  );

  useEffect(() => {
    if (!xiId) return;
    if (!filteredXn.some((x) => x.id === xiId)) setXiId("");
  }, [filteredXn, xiId]);

  function payload() {
    return {
      du_an_id: duAn.id,
      loai,
      so_qd_du_thao: soQd || null,
      ngay_du_thao: ngay || null,
      xi_nghiep_id: xiId || null,
      pham_vi: phamVi || null,
      thoi_han: thoiHan || null,
      can_cu: canCu || null,
      trang_thai: "nhap" as const,
    };
  }

  async function save(): Promise<string> {
    if (!xiId) throw new Error("Chọn Xí nghiệp nhận từ danh mục");
    const body = payload();
    if (qdId) {
      const res = await fetch(`/api/qd-giao-xn/${qdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      return qdId;
    }
    const res = await fetch("/api/qd-giao-xn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
    const id = json.data.id as string;
    setQdId(id);
    router.replace(
      `/du-an/${duAn.id}/giao-xn/soan?loai=${loai}&qdId=${id}`,
    );
    return id;
  }

  async function onSave(closeAfter: boolean) {
    setBusy(closeAfter ? "close" : "save");
    setError(null);
    setOkMsg(null);
    try {
      await save();
      setOkMsg("Đã lưu dự thảo.");
      router.refresh();
      if (closeAfter) router.push(backHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setBusy(null);
    }
  }

  async function onExportWord() {
    setBusy("word");
    setError(null);
    setOkMsg(null);
    try {
      const id = await save();
      const res = await fetch(`/api/qd-giao-xn/${id}/export/word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ten_pc_tinh: tenPcTinh || null,
          nam_ke_hoach: namKeHoach || null,
          so_tien_tam_ung: soTienTamUng || null,
          so_tien_tam_ung_chu: soTienTamUngChu || null,
          so_luong_cong_trinh: soLuongCt || null,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Xuất Word thất bại");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+)"/)?.[1] ?? "QD-giao-XN.docx";
      a.click();
      URL.revokeObjectURL(url);
      setOkMsg("Đã xuất Word.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xuất Word");
    } finally {
      setBusy(null);
    }
  }

  async function onExportPdf() {
    setBusy("pdf");
    setError(null);
    setOkMsg(null);
    try {
      const id = await save();
      // Bản in trình duyệt → người dùng chọn «Save as PDF»
      window.open(
        `/du-an/${duAn.id}/giao-xn/soan/in?qdId=${id}`,
        "_blank",
        "noopener,noreferrer",
      );
      setOkMsg("Đã mở bản in — chọn máy in «Microsoft Print to PDF» / Save as PDF.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xuất PDF");
    } finally {
      setBusy(null);
    }
  }

  const field =
    "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-200/60";
  const title = labelLoai(loai, duAn.cap_dien_ap);
  const disabled = busy !== null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f6]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wider text-amber-700 uppercase">
              Soạn QĐ giao Xí nghiệp
            </p>
            <h1 className="truncate text-base font-black text-slate-800 md:text-lg">
              {title}
            </h1>
            <p className="truncate text-[11px] font-semibold text-slate-400">
              {duAn.ma_du_an ? `${duAn.ma_du_an} · ` : ""}
              {duAn.ten_du_an}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSave(false)}
              className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {busy === "save" ? "Đang lưu…" : "Lưu"}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSave(true)}
              className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              {busy === "close" ? "Đang lưu…" : "Lưu & đóng"}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void onExportWord()}
              className="rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
            >
              {busy === "word" ? "Đang xuất…" : "Xuất Word"}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void onExportPdf()}
              className="rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
            >
              {busy === "pdf" ? "Đang mở…" : "Xuất PDF"}
            </button>
            <Link
              href={backHref}
              className="rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              ← Đóng
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-6 md:px-8">
        {error ? (
          <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {okMsg ? (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {okMsg}
          </p>
        ) : null}

        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <section className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Số QĐ dự thảo
              </span>
              <input
                value={soQd}
                onChange={(e) => setSoQd(e.target.value)}
                className={field}
                placeholder="VD: 123"
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
          </section>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">
              Xí nghiệp nhận
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
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Công ty Điện lực / PC tỉnh (Word)
              </span>
              <input
                value={tenPcTinh}
                onChange={(e) => setTenPcTinh(e.target.value)}
                className={field}
                placeholder="Tự suy từ địa điểm nếu để trống"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Năm kế hoạch ĐTXD (Word)
              </span>
              <input
                value={namKeHoach}
                onChange={(e) => setNamKeHoach(e.target.value)}
                className={field}
              />
            </label>
          </div>

          {loai === "tvtk" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">
                  Số tiền tạm ứng (Word)
                </span>
                <input
                  value={soTienTamUng}
                  onChange={(e) => setSoTienTamUng(e.target.value)}
                  className={field}
                  placeholder="786.000.000"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-600">
                  Số tiền tạm ứng bằng chữ (Word)
                </span>
                <input
                  value={soTienTamUngChu}
                  onChange={(e) => setSoTienTamUngChu(e.target.value)}
                  className={field}
                />
              </label>
            </div>
          ) : (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Số lượng công trình (Word)
              </span>
              <input
                value={soLuongCt}
                onChange={(e) => setSoLuongCt(e.target.value)}
                className={field}
              />
            </label>
          )}

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">
              Phạm vi / nội dung giao
            </span>
            <textarea
              value={phamVi}
              onChange={(e) => setPhamVi(e.target.value)}
              rows={4}
              className={field}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">
              Thời hạn
            </span>
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
              rows={3}
              className={field}
            />
          </label>

          <p className="text-xs text-slate-500">
            Xuất Word dùng mẫu{" "}
            {loai === "thi_nghiem"
              ? "TN hiệu chỉnh"
              : duAn.cap_dien_ap === "trung_ha_ap"
                ? "TVTK trung hạ áp"
                : "TVTK 110 kV"}
            . Các ô ghi «Word» điền vào tag mẫu (chưa lưu DB riêng — phiên sau
            sẽ bổ sung cột).
          </p>
        </div>
      </main>
    </div>
  );
}
