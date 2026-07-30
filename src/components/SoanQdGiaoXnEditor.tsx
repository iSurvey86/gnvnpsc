"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QdGiaoXnDocBanner } from "@/components/QdGiaoXnDocBanner";
import type {
  DuAn,
  LoaiGiaoXn,
  PhuLucCongTrinh,
  QdGiaoA,
  QdGiaoXn,
  XiNghiep,
} from "@/lib/types";
import {
  buildDefaultCanCuGiaoDanhMuc,
  defaultTenPcTinh,
  matchXiNghiepByTinh,
} from "@/lib/soan-qd-defaults";
import {
  shouldTinhTienGiao,
  tinhChiPhiL1TuPhuLuc,
  TY_LE_L1_TVTK_THA,
} from "@/lib/tinh-tien-giao-xn";
import { soTienBangChu, formatVndTuTrieu } from "@/lib/so-tien-bang-chu";
import {
  resolveSoanQdTone,
  SOAN_QD_THEME,
} from "@/lib/soan-qd-theme";

/** Tạm ẩn — bật `true` khi mở lại nút Xuất PDF. */
const SHOW_EXPORT_PDF = false;

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

function phuLucRows(qd: QdGiaoA | null): PhuLucCongTrinh[] {
  const pl = qd?.phu_luc;
  if (!pl || !Array.isArray(pl.cong_trinh)) return [];
  return pl.cong_trinh;
}

function SectionHead({
  n,
  children,
  className = "",
  badgeClass,
  titleClass,
}: {
  n: number;
  children: ReactNode;
  className?: string;
  badgeClass: string;
  titleClass: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${badgeClass}`}
      >
        {n}
      </span>
      <h2 className={`text-sm font-semibold ${titleClass}`}>{children}</h2>
    </div>
  );
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
  const isTvtkTha = loai === "tvtk" && duAn.cap_dien_ap === "trung_ha_ap";
  const showTinhTien = shouldTinhTienGiao(loai, duAn.cap_dien_ap);

  const congTrinhBase = useMemo(() => phuLucRows(qdGiaoA), [qdGiaoA]);

  const phuLucTenGop = useMemo(
    () =>
      congTrinhBase
        .map((r) => r.ct_ten)
        .filter(Boolean)
        .join("\n"),
    [congTrinhBase],
  );

  const tenPcMacDinh = useMemo(
    () =>
      defaultTenPcTinh({
        ten_pc_tinh: qdGiaoA?.ten_pc_tinh,
        trich_yeu: qdGiaoA?.trich_yeu,
        phu_luc_ten: phuLucTenGop,
        dia_diem: duAn.dia_diem,
      }),
    [qdGiaoA, phuLucTenGop, duAn.dia_diem],
  );

  const filteredXn = useMemo(
    () =>
      xiNghiep.filter((x) =>
        loai === "tvtk" ? x.phu_hop_tvtk : x.phu_hop_thi_nghiem,
      ),
    [xiNghiep, loai],
  );

  const defaultXiId = useMemo(() => {
    if (initial?.xi_nghiep_id) return initial.xi_nghiep_id;
    // Xí nghiệp đã chọn trên bảng danh mục dự án
    if (
      duAn.xi_nghiep_id &&
      filteredXn.some((x) => x.id === duAn.xi_nghiep_id)
    ) {
      return duAn.xi_nghiep_id;
    }
    return (
      matchXiNghiepByTinh(filteredXn, duAn.dia_diem, tenPcMacDinh)?.id ?? ""
    );
  }, [
    initial?.xi_nghiep_id,
    duAn.xi_nghiep_id,
    filteredXn,
    duAn.dia_diem,
    tenPcMacDinh,
  ]);

  const [qdId, setQdId] = useState<string | null>(initial?.id ?? null);
  const [soQd, setSoQd] = useState(initial?.so_qd_du_thao ?? "");
  const [ngay, setNgay] = useState(
    () =>
      initial?.ngay_du_thao?.trim() ||
      new Date().toISOString().slice(0, 10),
  );
  const [xiId, setXiId] = useState(defaultXiId);
  const [phamVi, setPhamVi] = useState(
    initial?.pham_vi ?? duAn.quy_mo ?? "",
  );
  const [thoiHan, setThoiHan] = useState(initial?.thoi_han ?? "");
  const [canCu, setCanCu] = useState(
    () =>
      (initial?.can_cu?.trim() ? initial.can_cu : null) ??
      buildDefaultCanCuGiaoDanhMuc(qdGiaoA),
  );
  const [tenPcTinh, setTenPcTinh] = useState(tenPcMacDinh);
  const [namKeHoach, setNamKeHoach] = useState(
    () => String(new Date().getFullYear() + 1),
  );
  const [soTienTamUng, setSoTienTamUng] = useState("");
  const [soTienTamUngChu, setSoTienTamUngChu] = useState("");
  /** User đã sửa tạm ứng tay → không ghi đè khi L1 đổi */
  const [tamUngDirty, setTamUngDirty] = useState(false);
  const [soLuongCt, setSoLuongCt] = useState("");
  const [tmdtOverrides, setTmdtOverrides] = useState<string[]>(() =>
    congTrinhBase.map((r) => (r.ct_tmdt ?? "").toString()),
  );
  const [busy, setBusy] = useState<"save" | "close" | "word" | "pdf" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    setTmdtOverrides(
      congTrinhBase.map((r) => (r.ct_tmdt ?? "").toString()),
    );
  }, [congTrinhBase]);

  const ketQuaTien = useMemo(
    () =>
      tinhChiPhiL1TuPhuLuc({
        loai,
        cap: duAn.cap_dien_ap,
        cong_trinh: congTrinhBase,
        tmdtOverrides,
      }),
    [loai, duAn.cap_dien_ap, congTrinhBase, tmdtOverrides],
  );

  // Tạm ứng mặc định = tổng chi phí L1 (triệu → đồng), kèm bằng chữ
  useEffect(() => {
    if (!isTvtkTha || tamUngDirty) return;
    const trieu = ketQuaTien.tong_chi_phi_l1_so;
    if (trieu == null) return;
    const vnd = formatVndTuTrieu(trieu);
    if (!vnd) return;
    setSoTienTamUng(vnd);
    setSoTienTamUngChu(soTienBangChu(vnd));
  }, [isTvtkTha, tamUngDirty, ketQuaTien.tong_chi_phi_l1_so]);

  useEffect(() => {
    if (!xiId) {
      const matched = matchXiNghiepByTinh(
        filteredXn,
        duAn.dia_diem,
        tenPcTinh || tenPcMacDinh,
      );
      if (matched) setXiId(matched.id);
      return;
    }
    if (!filteredXn.some((x) => x.id === xiId)) {
      const matched = matchXiNghiepByTinh(
        filteredXn,
        duAn.dia_diem,
        tenPcTinh || tenPcMacDinh,
      );
      setXiId(matched?.id ?? "");
    }
  }, [filteredXn, xiId, duAn.dia_diem, tenPcTinh, tenPcMacDinh]);

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
          tmdt_overrides: showTinhTien ? tmdtOverrides : undefined,
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
      window.open(
        `/du-an/${duAn.id}/giao-xn/soan/in?qdId=${id}`,
        "_blank",
        "noopener,noreferrer",
      );
      setOkMsg(
        "Đã mở bản in — chọn máy in «Microsoft Print to PDF» / Save as PDF.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xuất PDF");
    } finally {
      setBusy(null);
    }
  }

  const tone = resolveSoanQdTone(loai, duAn.cap_dien_ap);
  const theme = SOAN_QD_THEME[tone];
  const field =
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${theme.field} ${theme.textBody}`;
  const fieldAuto =
    `${field} resize-none overflow-hidden [field-sizing:content] min-h-[2.75rem]`;
  const labelCls =
    `mb-1.5 block text-[11px] font-medium tracking-wide uppercase ${theme.label}`;
  const title = labelLoai(loai, duAn.cap_dien_ap);
  const disabled = busy !== null;
  const tenXiNhan =
    filteredXn.find((x) => x.id === xiId)?.ten?.trim() || "…";

  return (
    <div
      className={`flex min-h-screen flex-col bg-gradient-to-br ${theme.pageBg}`}
    >
      <header
        className={`sticky top-0 z-20 border-b bg-white/90 shadow-sm backdrop-blur ${theme.headerBorder}`}
      >
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-5">
          <div className="min-w-0 flex-1">
            <h1
              className={`line-clamp-2 text-[15px] font-medium leading-snug md:text-base ${theme.title}`}
            >
              <span className={`font-normal ${theme.textMuted}`}>Dự án:</span>{" "}
              {duAn.ten_du_an}
            </h1>
            <p className={`mt-0.5 truncate text-[11px] font-normal ${theme.textMuted}`}>
              <span>Mã dự án:</span>{" "}
              <span className={`font-mono tracking-wide ${theme.textBody}`}>
                {duAn.ma_du_an || "—"}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSave(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm disabled:opacity-50 ${theme.btnPrimary}`}
            >
              {busy === "save" ? "Đang lưu…" : "Lưu"}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSave(true)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${theme.btnSecondary}`}
            >
              {busy === "close" ? "Đang lưu…" : "Lưu & đóng"}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void onExportWord()}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm disabled:opacity-50 ${theme.btnWord}`}
            >
              {busy === "word" ? "Đang xuất…" : "Xuất Word"}
            </button>
            {SHOW_EXPORT_PDF ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => void onExportPdf()}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${theme.btnOutline}`}
              >
                {busy === "pdf" ? "Đang mở…" : "Xuất PDF"}
              </button>
            ) : null}
            <Link
              href={backHref}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${theme.closeBtn}`}
            >
              ← Đóng
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[920px] flex-1 px-4 py-6 md:px-5">
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

        {/* Giấy quyết định */}
        <article
          className={`overflow-hidden rounded-2xl border bg-white ${theme.articleBorder} ${theme.articleShadow}`}
        >
          <div className={`h-1 bg-gradient-to-r ${theme.topBar}`} />

          <QdGiaoXnDocBanner
            loaiNhiemVu={title.toLowerCase()}
            tenXiNghiep={tenXiNhan}
            showDraftStamp
            tone={tone}
          />

          <div className="space-y-7 px-5 py-7 md:px-10 md:py-8">
            {/* Số / ngày / năm ĐTXD (tag Word — không phải năm SXKD) */}
            <section className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className={labelCls}>Số quyết định</span>
                <div className="flex items-center gap-2">
                  <input
                    value={soQd}
                    onChange={(e) => setSoQd(e.target.value)}
                    className={field}
                    placeholder="VD: 123"
                  />
                  <span className={`shrink-0 text-xs font-medium ${theme.textMuted}`}>
                    /QĐ-NPSC
                  </span>
                </div>
              </label>
              <label className="block">
                <span className={labelCls}>Ngày ban hành</span>
                <input
                  type="date"
                  value={ngay}
                  onChange={(e) => setNgay(e.target.value)}
                  className={field}
                />
              </label>
              <label className="block">
                <span className={labelCls}>Năm ĐTXD</span>
                <input
                  value={namKeHoach}
                  onChange={(e) => setNamKeHoach(e.target.value)}
                  className={field}
                  placeholder="2026"
                  inputMode="numeric"
                />
              </label>
            </section>

            <section>
              <SectionHead n={1} className="mb-2.5" badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                Căn cứ
              </SectionHead>
              <textarea
                value={canCu}
                onChange={(e) => setCanCu(e.target.value)}
                rows={2}
                className={fieldAuto}
                placeholder="Căn cứ Quyết định giao danh mục số …"
              />
            </section>

            <section>
              <SectionHead n={2} className="mb-2.5" badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                Điều 1 — Phạm vi / nội dung giao
              </SectionHead>
              <textarea
                value={phamVi}
                onChange={(e) => setPhamVi(e.target.value)}
                rows={2}
                className={fieldAuto}
              />
            </section>

            <section className="space-y-3">
              <SectionHead n={3} className="mb-0.5" badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                Điều 2 — Chủ đầu tư & Xí nghiệp nhận
              </SectionHead>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className={labelCls}>Chủ đầu tư (PC tỉnh)</span>
                  <input
                    value={tenPcTinh}
                    onChange={(e) => setTenPcTinh(e.target.value)}
                    className={field}
                    placeholder="Công ty Điện lực …"
                  />
                </label>
                <label className="block min-w-0">
                  <span className={labelCls}>Xí nghiệp nhận</span>
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
              </div>
            </section>

            <section>
              <SectionHead n={4} className="mb-2.5" badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                Điều 3 — Thời hạn thực hiện
              </SectionHead>
              <input
                value={thoiHan}
                onChange={(e) => setThoiHan(e.target.value)}
                placeholder="VD: 30 ngày kể từ ngày ký"
                className={field}
              />
            </section>

            {showTinhTien ? (
              <section className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <SectionHead n={5} badgeClass={theme.badge} titleClass={theme.sectionTitle}>Chi phí lần 01 (L1)</SectionHead>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setTamUngDirty(false);
                      setTmdtOverrides(
                        congTrinhBase.map((r) =>
                          (r.ct_tmdt ?? "").toString(),
                        ),
                      );
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${theme.btnRecalc}`}
                  >
                    Tính lại từ phụ lục
                  </button>
                </div>

                {congTrinhBase.length === 0 ? (
                  <p className={`text-xs ${theme.textMuted}`}>
                    Chưa có phụ lục công trình từ Quyết định giao danh mục —
                    quét lại trước khi xuất bảng tiền.
                  </p>
                ) : (
                  <div className={`overflow-x-auto rounded-lg border ${theme.tableBorder}`}>
                    <table className="min-w-full text-left text-xs">
                      <thead className={theme.tableHead}>
                        <tr>
                          <th className="w-10 px-2 py-2 font-semibold">STT</th>
                          <th className="px-2 py-2 font-semibold">Công trình</th>
                          <th className="w-16 px-2 py-2 font-semibold">TMĐT</th>
                          <th className="w-24 px-2 py-2 font-semibold">
                            Chi phí L1 (
                            {(TY_LE_L1_TVTK_THA * 100).toLocaleString("vi-VN")}
                            %)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ketQuaTien.rows.map((row, i) => (
                          <tr
                            key={`${row.stt}-${i}`}
                            className={`border-t ${theme.tableRowBorder}`}
                          >
                            <td className={`px-2 py-1.5 tabular-nums ${theme.textMuted}`}>
                              {row.stt}
                            </td>
                            <td className={`max-w-[220px] px-2 py-1.5 ${theme.textBody}`}>
                              {row.ct_ten || "—"}
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                value={tmdtOverrides[i] ?? ""}
                                onChange={(e) => {
                                  const next = [...tmdtOverrides];
                                  next[i] = e.target.value;
                                  setTmdtOverrides(next);
                                }}
                                className={`w-16 rounded-md border bg-white px-1.5 py-1 text-center tabular-nums outline-none focus:ring-1 ${theme.field}`}
                                placeholder="0"
                              />
                            </td>
                            <td className={`px-2 py-1.5 font-medium tabular-nums ${theme.textBody}`}>
                              {row.ct_chi_phi_l1 || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className={`border-t ${theme.tableFoot}`}>
                          <td className="px-2 py-2" colSpan={2}>
                            Tổng
                          </td>
                          <td className="px-2 py-2 tabular-nums">
                            {ketQuaTien.tong_tmdt || "—"}
                          </td>
                          <td className="px-2 py-2 tabular-nums">
                            {ketQuaTien.tong_chi_phi_l1 || "—"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </section>
            ) : null}

            {isTvtkTha ? (
              <section className="grid gap-3 sm:grid-cols-[minmax(7.5rem,11rem)_1fr]">
                <label className="block min-w-0">
                  <span className={labelCls}>Số tiền tạm ứng</span>
                  <input
                    value={soTienTamUng}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTamUngDirty(true);
                      setSoTienTamUng(v);
                      setSoTienTamUngChu(soTienBangChu(v));
                    }}
                    onBlur={() => {
                      if (!soTienTamUngChu.trim() && soTienTamUng.trim()) {
                        setSoTienTamUngChu(soTienBangChu(soTienTamUng));
                      }
                    }}
                    className={`${field} tabular-nums`}
                    placeholder=""
                  />
                </label>
                <label className="block min-w-0">
                  <span className={labelCls}>Số tiền tạm ứng bằng chữ</span>
                  <textarea
                    value={soTienTamUngChu}
                    onChange={(e) => {
                      setTamUngDirty(true);
                      setSoTienTamUngChu(e.target.value);
                    }}
                    rows={1}
                    className={fieldAuto}
                    placeholder=""
                  />
                </label>
              </section>
            ) : null}

            {loai === "thi_nghiem" ? (
              <section>
                <label className="block">
                  <span className={labelCls}>Số lượng công trình</span>
                  <input
                    value={soLuongCt}
                    onChange={(e) => setSoLuongCt(e.target.value)}
                    className={field}
                  />
                </label>
              </section>
            ) : null}
          </div>
        </article>
      </main>
    </div>
  );
}
