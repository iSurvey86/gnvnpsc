"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAppDialog } from "@/components/AppDialog";
import { QdGiaoXnDocBanner } from "@/components/QdGiaoXnDocBanner";
import { normalizeTenDuAn } from "@/lib/du-an-trung";
import type { PhuLucGiaoXnContext } from "@/lib/qd-giao-xn-map";
import type {
  DuAn,
  LoaiGiaoXn,
  PhuLucCongTrinh,
  QdGiaoA,
  QdGiaoXn,
  TrangThaiQdXn,
  XiNghiep,
} from "@/lib/types";
import {
  buildDefaultCanCuGiaoDanhMuc,
  defaultTenPcTinh,
  matchXiNghiepByTinh,
} from "@/lib/soan-qd-defaults";
import {
  laCungDiaBanTinh,
  shouldTinhTienGiao,
  tinhChiPhiL1TuPhuLuc,
} from "@/lib/tinh-tien-giao-xn";
import { resolveLoaiHinhDuAn, shortLoaiHinhDuAn } from "@/lib/loai-hinh-du-an";
import { soTienBangChu, formatVndTuTrieu } from "@/lib/so-tien-bang-chu";
import {
  resolveSoanQdTone,
  SOAN_QD_THEME,
} from "@/lib/soan-qd-theme";
import {
  laDaGiaoXn,
  labelTrangThaiGiaoXn,
} from "@/lib/trang-thai-giao-xn";
import { isPhanHeCode, PHAN_HE } from "@/lib/phan-he";

/** Tạm ẩn — bật `true` khi mở lại nút Xuất PDF. */
const SHOW_EXPORT_PDF = false;

type Props = {
  duAn: DuAn;
  qdGiaoA: QdGiaoA | null;
  xiNghiep: XiNghiep[];
  loai: LoaiGiaoXn;
  initial: QdGiaoXn | null;
  phuLucCtx?: PhuLucGiaoXnContext;
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

function buildInitialSelected(
  rows: PhuLucCongTrinh[],
  lockedKeys: Set<string>,
  thisQdKeys: Set<string>,
  editing: boolean,
): boolean[] {
  return rows.map((r) => {
    const k = normalizeTenDuAn(r.ct_ten);
    if (k && lockedKeys.has(k)) return false;
    if (editing && thisQdKeys.size > 0) return Boolean(k && thisQdKeys.has(k));
    return true;
  });
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
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${badgeClass}`}
      >
        {n}
      </span>
      <h2 className={`text-[13px] font-semibold ${titleClass}`}>{children}</h2>
    </div>
  );
}

export function SoanQdGiaoXnEditor({
  duAn,
  qdGiaoA,
  xiNghiep,
  loai,
  initial,
  phuLucCtx,
}: Props) {
  const router = useRouter();
  const { showConfirm } = useAppDialog();
  const phanHe = isPhanHeCode(duAn.phan_he) ? duAn.phan_he : "tvtk";
  /** Ra bảng Quản lý dự án (không dừng ở trang giao XN trung gian). */
  const backHref = PHAN_HE[phanHe].homeAfterSave;
  const isTvtkTha = loai === "tvtk" && duAn.cap_dien_ap === "trung_ha_ap";
  const showTinhTien = shouldTinhTienGiao(loai, duAn.cap_dien_ap);

  const congTrinhBase = useMemo(() => phuLucRows(qdGiaoA), [qdGiaoA]);

  const lockedByKey = useMemo(() => {
    const m = new Map<string, NonNullable<PhuLucGiaoXnContext["daGiaoKhac"]>[number]>();
    for (const row of phuLucCtx?.daGiaoKhac ?? []) {
      m.set(row.ten_key, row);
    }
    return m;
  }, [phuLucCtx?.daGiaoKhac]);

  const thisQdKeys = useMemo(
    () => new Set(phuLucCtx?.tenTrongQdHienTai ?? []),
    [phuLucCtx?.tenTrongQdHienTai],
  );

  const soDaChuaGiao = phuLucCtx?.soDaChuaGiao ?? 0;

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
    () => initial?.ngay_du_thao?.trim() || "",
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
  /** Tick chọn công trình giao lần này (theo index phụ lục). */
  const [selected, setSelected] = useState<boolean[]>(() =>
    buildInitialSelected(
      congTrinhBase,
      new Set((phuLucCtx?.daGiaoKhac ?? []).map((x) => x.ten_key)),
      new Set(phuLucCtx?.tenTrongQdHienTai ?? []),
      Boolean(initial?.id),
    ),
  );
  const [tmdtOverrides, setTmdtOverrides] = useState<string[]>(() =>
    congTrinhBase.map((r) => (r.ct_tmdt ?? "").toString()),
  );
  const [busy, setBusy] = useState<
    "save" | "close" | "word" | "pdf" | "delete" | "uploadKy" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [trangThai, setTrangThai] = useState<TrangThaiQdXn>(
    initial?.trang_thai ?? "nhap",
  );
  const [coPdfKy, setCoPdfKy] = useState(Boolean(initial?.pdf_ky_storage_path));
  const pdfKyInputRef = useRef<HTMLInputElement>(null);
  const daGiao = laDaGiaoXn(trangThai);

  function resetChonTuPhuLuc() {
    setSelected(
      buildInitialSelected(
        congTrinhBase,
        new Set(lockedByKey.keys()),
        thisQdKeys,
        Boolean(qdId || initial?.id),
      ),
    );
    setTmdtOverrides(
      congTrinhBase.map((r) => (r.ct_tmdt ?? "").toString()),
    );
  }

  useEffect(() => {
    resetChonTuPhuLuc();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phụ lục / ngữ cảnh map đổi
  }, [congTrinhBase, lockedByKey, thisQdKeys]);

  const congTrinhDaChon = useMemo(() => {
    if (!congTrinhBase.length) {
      return [{ ct_ten: duAn.ten_du_an } as PhuLucCongTrinh];
    }
    return congTrinhBase.filter((_, i) => selected[i]);
  }, [congTrinhBase, selected, duAn.ten_du_an]);

  const tmdtDaChon = useMemo(
    () => tmdtOverrides.filter((_, i) => selected[i]),
    [tmdtOverrides, selected],
  );

  const soDongMoKhoa = useMemo(() => {
    let n = 0;
    for (let i = 0; i < congTrinhBase.length; i++) {
      const k = normalizeTenDuAn(congTrinhBase[i]?.ct_ten);
      if (k && lockedByKey.has(k)) continue;
      n += 1;
    }
    return n;
  }, [congTrinhBase, lockedByKey]);

  const soDongDaChon = selected.filter(Boolean).length;

  const loaiHinhDa = useMemo(
    () => resolveLoaiHinhDuAn(duAn.cap_dien_ap, duAn.loai_hinh_du_an),
    [duAn.cap_dien_ap, duAn.loai_hinh_du_an],
  );

  const tenXnHienThi = useMemo(
    () => filteredXn.find((x) => x.id === xiId)?.ten?.trim() || "",
    [filteredXn, xiId],
  );

  const cungDiaBan = useMemo(
    () =>
      laCungDiaBanTinh({
        tenPcTinh,
        tenXiNghiep: tenXnHienThi,
        diaDiemDuAn: duAn.dia_diem,
      }),
    [tenPcTinh, tenXnHienThi, duAn.dia_diem],
  );

  const ketQuaTien = useMemo(
    () =>
      tinhChiPhiL1TuPhuLuc({
        loai,
        cap: duAn.cap_dien_ap,
        cong_trinh: congTrinhDaChon,
        tmdtOverrides: tmdtDaChon,
        loaiHinhDuAn: loaiHinhDa,
        cungDiaBan,
      }),
    [
      loai,
      duAn.cap_dien_ap,
      congTrinhDaChon,
      tmdtDaChon,
      loaiHinhDa,
      cungDiaBan,
    ],
  );

  // Tạm ứng mặc định = tổng giá trị tạm ứng (triệu → đồng), kèm bằng chữ
  useEffect(() => {
    if (!isTvtkTha || tamUngDirty) return;
    const trieu = ketQuaTien.tong_gia_tri_tam_ung_so;
    if (trieu == null) return;
    const vnd = formatVndTuTrieu(trieu);
    if (!vnd) return;
    setSoTienTamUng(vnd);
    setSoTienTamUngChu(soTienBangChu(vnd));
  }, [isTvtkTha, tamUngDirty, ketQuaTien.tong_gia_tri_tam_ung_so]);

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
    if (congTrinhBase.length > 0 && soDongDaChon === 0) {
      throw new Error("Chọn ít nhất một công trình để giao lần này");
    }
    const body: Record<string, unknown> = {
      du_an_id: duAn.id,
      loai,
      so_qd_du_thao: soQd || null,
      ngay_du_thao: ngay || null,
      xi_nghiep_id: xiId || null,
      pham_vi: phamVi || null,
      thoi_han: thoiHan || null,
      can_cu: canCu || null,
      cong_trinh: congTrinhDaChon,
    };
    // Tạo mới luôn là nháp; khi đã giao không ghi đè trạng thái lúc Lưu nội dung
    if (!qdId) body.trang_thai = "nhap";
    return body;
  }

  async function confirmGiaoCaPhuLuc(): Promise<boolean> {
    if (soDongMoKhoa <= 1 || soDongDaChon < soDongMoKhoa) return true;
    return showConfirm(
      `Anh đang chọn tất cả ${soDongDaChon} công trình còn lại trong phụ lục Giao A cho một Xí nghiệp.\n\nNếu muốn chia nhiều đơn vị: bỏ tick một phần công trình, lưu QĐ này, rồi lập QĐ khác cho phần còn lại.\n\nTiếp tục giao cả phần còn lại cho đơn vị đang chọn?`,
      {
        title: "Giao nhiều công trình cho một đơn vị",
        variant: "warning",
        confirmLabel: "Tiếp tục lưu",
        cancelLabel: "Quay lại chọn",
      },
    );
  }

  async function save(): Promise<{ id: string; mappedCount: number } | null> {
    if (!xiId) throw new Error("Chọn Xí nghiệp nhận từ danh mục");
    const okSplit = await confirmGiaoCaPhuLuc();
    if (!okSplit) return null;
    const body = payload();
    if (qdId) {
      const res = await fetch(`/api/qd-giao-xn/${qdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Lưu thất bại");
      const mappedCount =
        (json.map?.mapped_du_an_ids as string[] | undefined)?.length ?? 0;
      return { id: qdId, mappedCount };
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
    const mappedCount =
      (json.map?.mapped_du_an_ids as string[] | undefined)?.length ?? 0;
    return { id, mappedCount };
  }

  async function onSave(closeAfter: boolean) {
    setBusy(closeAfter ? "close" : "save");
    setError(null);
    setOkMsg(null);
    try {
      const result = await save();
      if (!result) return;
      const { mappedCount } = result;
      setOkMsg(
        mappedCount > 1
          ? `Đã lưu dự thảo — liên kết ${mappedCount} dự án (công trình) trong bảng.`
          : "Đã lưu dự thảo.",
      );
      router.refresh();
      if (closeAfter) router.push(backHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi lưu");
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!qdId) return;
    if (daGiao) {
      setError(
        "Quyết định đã giao (đã có PDF ký). Chỉ Quản trị được xóa để dọn dữ liệu sai.",
      );
      return;
    }
    const ok = await showConfirm(
      `Xóa dự thảo quyết định giao ${tenXiNhan === "…" ? "Xí nghiệp" : tenXiNhan}?\n\nDự án trở về trạng thái chưa giao, có thể lập lại quyết định mới. Bản Word đã tải về không bị ảnh hưởng.`,
      {
        title: "Xóa dự thảo quyết định",
        variant: "warning",
        confirmLabel: "Xóa dự thảo",
        cancelLabel: "Quay lại",
      },
    );
    if (!ok) return;

    setBusy("delete");
    setError(null);
    setOkMsg(null);
    try {
      const res = await fetch(`/api/qd-giao-xn/${qdId}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "Xóa dự thảo thất bại");
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi xóa dự thảo");
      setBusy(null);
    }
  }

  async function onExportWord() {
    setBusy("word");
    setError(null);
    setOkMsg(null);
    try {
      const result = await save();
      if (!result) return;
      const { id } = result;
      const res = await fetch(`/api/qd-giao-xn/${id}/export/word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ten_pc_tinh: tenPcTinh || null,
          nam_ke_hoach: namKeHoach || null,
          so_tien_tam_ung: soTienTamUng || null,
          so_tien_tam_ung_chu: soTienTamUngChu || null,
          so_luong_cong_trinh: soLuongCt || null,
          tmdt_overrides: showTinhTien ? tmdtDaChon : undefined,
          cong_trinh: congTrinhDaChon,
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
      const result = await save();
      if (!result) return;
      const { id } = result;
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

  async function onUploadPdfKy(file: File) {
    setBusy("uploadKy");
    setError(null);
    setOkMsg(null);
    try {
      const result = await save();
      if (!result) return;
      const { id } = result;
      const form = new FormData();
      form.set("file", file);
      const res = await fetch(`/api/qd-giao-xn/${id}/pdf-ky`, {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: QdGiaoXn;
      };
      if (!json.ok) throw new Error(json.error ?? "Tải PDF thất bại");
      setTrangThai("da_ban_hanh");
      setCoPdfKy(true);
      setOkMsg("Đã tải PDF ký — quyết định chuyển sang «Đã giao».");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải PDF đã ký");
    } finally {
      setBusy(null);
      if (pdfKyInputRef.current) pdfKyInputRef.current.value = "";
    }
  }

  const tone = resolveSoanQdTone(loai, duAn.cap_dien_ap);
  const theme = SOAN_QD_THEME[tone];
  const field =
    `w-full rounded-md border px-2.5 py-1.5 text-[13px] leading-snug outline-none transition focus:ring-2 ${theme.field} ${theme.textBody}`;
  const fieldAuto =
    `${field} resize-none overflow-hidden [field-sizing:content]`;
  const labelCls =
    `mb-0.5 block text-[10px] font-medium tracking-wide uppercase ${theme.label}`;
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
        <div className="flex w-full items-center justify-between gap-3 px-3 py-2 md:px-4">
          <div className="min-w-0 flex-1">
            <h1
              className={`line-clamp-1 text-[13px] font-medium leading-snug md:text-sm ${theme.title}`}
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
            {qdId ? (
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  daGiao
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {labelTrangThaiGiaoXn(trangThai)}
              </span>
            ) : null}
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
            {qdId ? (
              <>
                <input
                  ref={pdfKyInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUploadPdfKy(f);
                  }}
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => pdfKyInputRef.current?.click()}
                  className="rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
                  title="Tải PDF quyết định đã ký để chốt luồng → Đã giao"
                >
                  {busy === "uploadKy"
                    ? "Đang tải…"
                    : daGiao
                      ? "Đổi PDF đã ký"
                      : "Tải PDF đã ký"}
                </button>
                {coPdfKy ? (
                  <a
                    href={`/api/qd-giao-xn/${qdId}/pdf-ky`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Xem PDF ký
                  </a>
                ) : null}
              </>
            ) : null}
            {qdId && !daGiao ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => void onDelete()}
                className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                title="Xóa dự thảo quyết định — dự án trở về chưa giao"
              >
                {busy === "delete" ? "Đang xóa…" : "Xóa dự thảo"}
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

      <main className="mx-auto w-full max-w-[960px] flex-1 px-3 py-3 md:px-4 md:pb-8">
        {error ? (
          <p className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {okMsg ? (
          <p className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800">
            {okMsg}
          </p>
        ) : null}

        {/* Giấy quyết định */}
        <article
          className={`overflow-hidden rounded-xl border bg-white ${theme.articleBorder} ${theme.articleShadow}`}
        >
          <div className={`h-0.5 bg-gradient-to-r ${theme.topBar}`} />

          <QdGiaoXnDocBanner
            loaiNhiemVu={title.toLowerCase()}
            tenXiNghiep={tenXiNhan}
            showDraftStamp={!daGiao}
            tone={tone}
          />

          <div className="space-y-3.5 px-4 py-3.5 md:px-5 md:py-4">
            {/* Số / ngày / năm — fieldset + legend, căn giữa */}
            <section className="flex flex-wrap items-stretch justify-center gap-2.5">
              <fieldset
                className={`flex w-[11.5rem] shrink-0 items-center gap-1 rounded-md border px-2.5 pb-1.5 pt-0 ${theme.articleBorder}`}
              >
                <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                  Số quyết định
                </legend>
                <input
                  value={soQd}
                  onChange={(e) => setSoQd(e.target.value)}
                  className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] leading-snug outline-none ${theme.textBody}`}
                  placeholder="VD: 123"
                />
                <span className={`shrink-0 text-[11px] font-medium ${theme.textMuted}`}>
                  /QĐ-NPSC
                </span>
              </fieldset>
              <fieldset
                className={`w-[11rem] shrink-0 rounded-md border px-2.5 pb-1.5 pt-0 ${theme.articleBorder}`}
              >
                <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                  Ngày ban hành
                </legend>
                <input
                  type="date"
                  value={ngay}
                  onChange={(e) => setNgay(e.target.value)}
                  placeholder="nn/mm/yyyy"
                  className={`w-full border-0 bg-transparent p-0 text-[13px] leading-snug outline-none ${
                    ngay ? theme.textBody : "text-slate-400"
                  }`}
                />
              </fieldset>
              <fieldset
                className={`w-[6rem] shrink-0 rounded-md border px-2.5 pb-1.5 pt-0 ${theme.articleBorder}`}
              >
                <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                  Năm ĐTXD
                </legend>
                <input
                  value={namKeHoach}
                  onChange={(e) => setNamKeHoach(e.target.value)}
                  className={`w-full border-0 bg-transparent p-0 text-[13px] leading-snug outline-none ${theme.textBody}`}
                  placeholder="2026"
                  inputMode="numeric"
                />
              </fieldset>
            </section>

            <section className="rounded-lg border border-sky-100 bg-sky-50/70 px-2.5 py-2">
              <SectionHead n={1} className="mb-1" badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                Căn cứ
              </SectionHead>
              <textarea
                value={canCu}
                onChange={(e) => setCanCu(e.target.value)}
                rows={1}
                className={`${fieldAuto} min-h-[2.25rem] bg-white/90`}
                placeholder="Căn cứ Quyết định giao danh mục số …"
              />
            </section>

            <section className="rounded-lg border border-amber-100 bg-amber-50/70 px-2.5 py-2">
              <SectionHead n={2} className="mb-1" badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                Phạm vi / nội dung giao
              </SectionHead>
              <textarea
                value={phamVi}
                onChange={(e) => setPhamVi(e.target.value)}
                rows={1}
                className={`${fieldAuto} min-h-[2.25rem] bg-white/90`}
              />
            </section>

            <section className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-2">
              <SectionHead n={3} className="mb-1" badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                Chủ đầu tư & Xí nghiệp
              </SectionHead>
              <div className="flex flex-wrap items-stretch gap-2">
                <fieldset
                  className="min-w-0 flex-[1_1_11rem] rounded-md border border-emerald-200/80 bg-white/90 px-2.5 pb-1.5 pt-0"
                >
                  <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                    Chủ đầu tư
                  </legend>
                  <input
                    value={tenPcTinh}
                    onChange={(e) => setTenPcTinh(e.target.value)}
                    className={`w-full border-0 bg-transparent p-0 text-[13px] leading-snug outline-none ${theme.textBody}`}
                    placeholder="Công ty Điện lực …"
                  />
                </fieldset>
                <fieldset
                  className="min-w-0 flex-[1.8_1_16rem] rounded-md border border-emerald-200/80 bg-white/90 px-2.5 pb-1.5 pt-0"
                >
                  <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                    Xí nghiệp
                  </legend>
                  <select
                    required
                    value={xiId}
                    onChange={(e) => setXiId(e.target.value)}
                    className={`w-full border-0 bg-transparent p-0 text-[13px] leading-snug outline-none ${theme.textBody}`}
                  >
                    <option value="">— Chọn từ danh mục —</option>
                    {filteredXn.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.ten}
                        {x.ma ? ` (${x.ma})` : ""}
                      </option>
                    ))}
                  </select>
                </fieldset>
                <fieldset
                  className="w-[7.5rem] shrink-0 grow-0 rounded-md border border-emerald-200/80 bg-white/90 px-2.5 pb-1.5 pt-0"
                >
                  <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                    Thời hạn (ngày)
                  </legend>
                  <input
                    value={thoiHan}
                    onChange={(e) => setThoiHan(e.target.value)}
                    placeholder="45"
                    inputMode="numeric"
                    className={`w-full border-0 bg-transparent p-0 text-[13px] leading-snug outline-none ${theme.textBody}`}
                  />
                </fieldset>
              </div>
            </section>

            {congTrinhBase.length > 0 ? (
              <section className="space-y-2 rounded-lg border border-sky-100 bg-sky-50/50 px-2.5 py-2">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <SectionHead n={4} badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                      Công trình giao lần này
                    </SectionHead>
                    <p className={`mt-0.5 text-[11px] ${theme.textMuted}`}>
                      Tick công trình giao cho Xí nghiệp đang chọn. Dòng đã giao đơn vị
                      khác bị khóa. Đã chọn {soDongDaChon}/{soDongMoKhoa} còn lại
                      {soDaChuaGiao > 0
                        ? ` · ${soDaChuaGiao} dự án cùng Giao A chưa giao`
                        : ""}
                      .
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setSelected(
                          congTrinhBase.map((r) => {
                            const k = normalizeTenDuAn(r.ct_ten);
                            return !(k && lockedByKey.has(k));
                          }),
                        );
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium disabled:opacity-50 ${theme.btnRecalc}`}
                    >
                      Chọn còn lại
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setSelected(congTrinhBase.map(() => false))
                      }
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium disabled:opacity-50 ${theme.btnRecalc}`}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
                <div className={`overflow-x-auto rounded-lg border ${theme.tableBorder}`}>
                  <table className={`min-w-full text-left text-[12px] leading-snug ${theme.textBody}`}>
                    <thead className={theme.tableHead}>
                      <tr>
                        <th className="w-10 px-2 py-2 text-center text-[12px] font-semibold">
                          Chọn
                        </th>
                        <th className="w-10 px-2 py-2 text-center text-[12px] font-semibold">
                          STT
                        </th>
                        <th className="px-2 py-2 text-center text-[12px] font-semibold">
                          Công trình
                        </th>
                        <th className="min-w-[8rem] px-2 py-2 text-center text-[12px] font-semibold">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {congTrinhBase.map((row, i) => {
                        const k = normalizeTenDuAn(row.ct_ten);
                        const locked = k ? lockedByKey.get(k) : undefined;
                        const checked = Boolean(selected[i]);
                        return (
                          <tr
                            key={`ct-${i}`}
                            className={`border-t ${theme.tableRowBorder} ${
                              locked ? "bg-slate-50/80 text-slate-500" : ""
                            }`}
                          >
                            <td className="px-2 py-1.5 text-center align-middle">
                              <input
                                type="checkbox"
                                checked={locked ? false : checked}
                                disabled={disabled || Boolean(locked)}
                                onChange={(e) => {
                                  const next = [...selected];
                                  next[i] = e.target.checked;
                                  setSelected(next);
                                }}
                                className="h-3.5 w-3.5 accent-teal-600"
                                aria-label={`Chọn công trình ${i + 1}`}
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center align-middle tabular-nums">
                              {i + 1}
                            </td>
                            <td className="min-w-[14rem] px-2 py-1.5 align-middle text-justify">
                              {row.ct_ten || "—"}
                            </td>
                            <td className="px-2 py-1.5 align-middle text-[11px]">
                              {locked
                                ? `Đã giao${
                                    locked.xi_nghiep_ten
                                      ? ` · ${locked.xi_nghiep_ten}`
                                      : ""
                                  }${
                                    locked.so_qd_du_thao?.trim()
                                      ? ` · QĐ ${locked.so_qd_du_thao.trim()}`
                                      : ""
                                  }`
                                : checked
                                  ? "Giao lần này"
                                  : "Chưa chọn"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {showTinhTien ? (
              <section className="space-y-2 rounded-lg border border-violet-100 bg-violet-50/60 px-2.5 py-2">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <SectionHead n={5} badgeClass={theme.badge} titleClass={theme.sectionTitle}>
                      Giá trị hợp đồng &amp; tạm ứng
                    </SectionHead>
                    <p className={`mt-0.5 text-[11px] ${theme.textMuted}`}>
                      {loaiHinhDa
                        ? `Loại hình ${shortLoaiHinhDuAn(loaiHinhDa)} · GHĐ ${(
                            (ketQuaTien.ty_le ?? 0) * 100
                          )
                            .toLocaleString("vi-VN")
                            .replace(".", ",")}% × TMĐT`
                        : "Chưa có loại hình dự án (CQT / SCMBA / DMS) — mặc định GHĐ 3,3%"}
                      {" · "}
                      Tạm ứng{" "}
                      {(
                        (ketQuaTien.ty_le_tam_ung ?? 0) * 100
                      ).toLocaleString("vi-VN")}
                      % × GHĐ (
                      {cungDiaBan ? "cùng địa bàn tỉnh" : "khác địa bàn tỉnh"})
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setTamUngDirty(false);
                      setTmdtOverrides(
                        congTrinhBase.map((r) => (r.ct_tmdt ?? "").toString()),
                      );
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${theme.btnRecalc}`}
                  >
                    Tính lại TMĐT từ phụ lục
                  </button>
                </div>

                {congTrinhDaChon.length === 0 ||
                (congTrinhBase.length > 0 && soDongDaChon === 0) ? (
                  <p className={`text-xs ${theme.textMuted}`}>
                    Chưa chọn công trình — tick ở mục trên để tính tiền.
                  </p>
                ) : (
                  <div className={`overflow-x-auto rounded-lg border ${theme.tableBorder}`}>
                    <table className={`min-w-full text-left text-[12px] leading-snug ${theme.textBody}`}>
                      <thead className={theme.tableHead}>
                        <tr>
                          <th className="w-10 px-2 py-2 text-center text-[12px] font-semibold">STT</th>
                          <th className="px-2 py-2 text-center text-[12px] font-semibold">Công trình</th>
                          <th className="w-[6.75rem] min-w-[6.75rem] px-2 py-2 text-center text-[12px] font-semibold leading-tight">
                            <span className="block">TMĐT</span>
                            <span className="mt-0.5 block font-normal whitespace-nowrap">
                              (triệu đồng)
                            </span>
                          </th>
                          <th className="min-w-[5.5rem] px-2 py-2 text-center text-[12px] font-semibold">
                            Giá trị HĐ
                            {ketQuaTien.ty_le != null
                              ? ` (${(ketQuaTien.ty_le * 100)
                                  .toLocaleString("vi-VN")
                                  .replace(".", ",")}%)`
                              : ""}
                          </th>
                          <th className="min-w-[5.5rem] px-2 py-2 text-center text-[12px] font-semibold">
                            Giá trị tạm ứng
                            {ketQuaTien.ty_le_tam_ung != null
                              ? ` (${(ketQuaTien.ty_le_tam_ung * 100).toLocaleString("vi-VN")}%)`
                              : ""}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ketQuaTien.rows.map((row, i) => {
                          const baseIdx = (() => {
                            let seen = -1;
                            for (let j = 0; j < congTrinhBase.length; j++) {
                              if (!selected[j]) continue;
                              seen += 1;
                              if (seen === i) return j;
                            }
                            return -1;
                          })();
                          return (
                            <tr
                              key={`${row.stt}-${i}`}
                              className={`border-t ${theme.tableRowBorder}`}
                            >
                              <td className={`px-2 py-1.5 text-center align-middle tabular-nums ${theme.textBody}`}>
                                {i + 1}
                              </td>
                              <td className="min-w-[14rem] px-2 py-1.5 align-middle text-justify">
                                {row.ct_ten || "—"}
                              </td>
                              <td className="w-[6.75rem] min-w-[6.75rem] px-2 py-1.5 align-middle">
                                <input
                                  value={
                                    baseIdx >= 0
                                      ? (tmdtOverrides[baseIdx] ?? "")
                                      : ""
                                  }
                                  onChange={(e) => {
                                    if (baseIdx < 0) return;
                                    const next = [...tmdtOverrides];
                                    next[baseIdx] = e.target.value;
                                    setTmdtOverrides(next);
                                  }}
                                  className={`w-full rounded-md border bg-white px-1.5 py-1 text-center text-[12px] leading-snug tabular-nums outline-none focus:ring-1 ${theme.field} ${theme.textBody}`}
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-2 py-1.5 text-right align-middle tabular-nums">
                                {row.ct_gia_tri_hd || "—"}
                              </td>
                              <td className="px-2 py-1.5 text-right align-middle tabular-nums">
                                {row.ct_gia_tri_tam_ung || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className={`border-t text-[12px] ${theme.tableFoot}`}>
                          <td className="px-2 py-2" colSpan={2}>
                            Tổng
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums">
                            {ketQuaTien.tong_tmdt || "—"}
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums">
                            {ketQuaTien.tong_gia_tri_hd || "—"}
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums">
                            {ketQuaTien.tong_gia_tri_tam_ung || "—"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </section>
            ) : null}

            {isTvtkTha ? (
              <section className="grid gap-2 rounded-lg border border-orange-100 bg-orange-50/60 px-2.5 py-2 sm:grid-cols-2">
                <fieldset
                  className={`rounded-md border px-2.5 pb-1.5 pt-0 ${theme.articleBorder} bg-white/90`}
                >
                  <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                    Giá trị hợp đồng (triệu)
                  </legend>
                  <p className={`text-[13px] tabular-nums ${theme.textBody}`}>
                    {ketQuaTien.tong_gia_tri_hd || "—"}
                  </p>
                </fieldset>
                <fieldset
                  className={`rounded-md border px-2.5 pb-1.5 pt-0 ${theme.articleBorder} bg-white/90`}
                >
                  <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                    Giá trị tạm ứng (đồng)
                  </legend>
                  <p className={`text-[13px] tabular-nums ${theme.textBody}`}>
                    {formatVndTuTrieu(ketQuaTien.tong_gia_tri_tam_ung_so) ||
                      "—"}
                    <span className={`ml-1.5 text-[10px] font-normal ${theme.textMuted}`}>
                      {cungDiaBan ? "15% cùng tỉnh" : "16% khác tỉnh"}
                    </span>
                  </p>
                </fieldset>
                <fieldset
                  className={`flex min-h-[2.75rem] items-center rounded-md border px-2.5 py-1.5 sm:col-span-2 ${theme.articleBorder} bg-white/90`}
                >
                  <legend className={`px-1 text-[11px] font-semibold ${theme.label}`}>
                    Số tiền tạm ứng bằng chữ
                  </legend>
                  <textarea
                    value={soTienTamUngChu}
                    onChange={(e) => {
                      setTamUngDirty(true);
                      setSoTienTamUngChu(e.target.value);
                    }}
                    rows={1}
                    className={`w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[13px] leading-snug outline-none [field-sizing:content] ${theme.textBody}`}
                    placeholder=""
                  />
                </fieldset>
              </section>
            ) : null}

            {loai === "thi_nghiem" ? (
              <section className="rounded-lg border border-rose-100 bg-rose-50/60 px-2.5 py-2">
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
