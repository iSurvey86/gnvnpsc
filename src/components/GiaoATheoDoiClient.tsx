"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  vietTatSoQdGiaoA,
  type GiaoATheoDoiPayload,
} from "@/lib/giao-a-theo-doi";
import { PHAN_HE, type PhanHeCode } from "@/lib/phan-he";
import { labelTrangThaiGiaoXn } from "@/lib/trang-thai-giao-xn";
import { formatNgayVN } from "@/lib/word/format-ngay";

type Props = {
  giaoAId: string;
  phanHe: PhanHeCode;
};

export function GiaoATheoDoiClient({ giaoAId, phanHe }: Props) {
  const cfg = PHAN_HE[phanHe];
  const t = cfg.theme;
  const loai = cfg.defaultLoaiGiao;
  const [data, setData] = useState<GiaoATheoDoiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const returnTo = `/giao-a/${giaoAId}/theo-doi?phan_he=${phanHe}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/giao-a/${giaoAId}/theo-doi?phan_he=${phanHe}`,
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Không tải được hồ sơ");
      }
      setData(json.data as GiaoATheoDoiPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [giaoAId, phanHe]);

  useEffect(() => {
    void load();
  }, [load]);

  function soanMoiHref(): string | null {
    if (!data?.du_an_chu_goi_y_id) return null;
    const chua = data.cong_trinh.some((c) => !c.da_giao);
    if (!chua) return null;
    const q = new URLSearchParams({
      loai,
      moi: "1",
      return_to: returnTo,
    });
    return `/du-an/${data.du_an_chu_goi_y_id}/giao-xn/soan?${q}`;
  }

  function soanQdHref(ownerId: string | null, qdId: string): string {
    const daId = ownerId ?? data?.du_an_chu_goi_y_id;
    if (!daId) return "#";
    const q = new URLSearchParams({
      loai,
      qdId,
      return_to: returnTo,
    });
    return `/du-an/${daId}/giao-xn/soan?${q}`;
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        Đang tải hồ sơ Giao A…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-3 p-6 text-center">
        <p className="text-red-600">{error ?? "Không có dữ liệu"}</p>
        <Link href={cfg.href} className={`text-sm font-medium ${t.primaryText}`}>
          ← Về danh sách
        </Link>
      </div>
    );
  }

  const { qd, cong_trinh, qd_giao_xn, tong_ct, da_giao_ct } = data;
  const soanMoi = soanMoiHref();
  const conLai = tong_ct - da_giao_ct;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-3 md:p-5">
      {/* Thông tin chung Giao A */}
      <section className={`rounded-xl border bg-white p-4 shadow-sm ${t.border}`}>
        <div className="relative mb-3 flex flex-col gap-2 sm:items-center sm:justify-center">
          <Link
            href={cfg.href}
            className="self-end rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-800 hover:bg-orange-100 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2"
          >
            ← Danh sách Giao A
          </Link>
          <h1
            className={`text-center text-[15px] font-bold tracking-wide uppercase ${t.primaryText}`}
          >
            {cfg.titleFull}
          </h1>
        </div>
        <h2 className={`mb-3 text-[13px] font-semibold ${t.primaryText}`}>
          I. Thông tin Giao A
        </h2>
        <p className="mb-3 text-[13px] leading-snug">
          <span className="font-semibold text-slate-900">
            Số {vietTatSoQdGiaoA(qd.so_qd)}
            {qd.ngay_qd ? ` ngày ${formatNgayVN(qd.ngay_qd)}` : ""}
          </span>
          {qd.storage_path ? (
            <>
              {" "}
              <a
                href={`/api/giao-a/${qd.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-red-600 underline hover:text-red-700"
              >
                Xem PDF
              </a>
            </>
          ) : null}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-[13px]">
            <p>
              <span className="text-[11px] font-medium uppercase text-slate-500">
                Chủ đầu tư / PC tỉnh
              </span>
              <br />
              {qd.ten_pc_tinh?.trim() || "—"}
            </p>
            <div className="flex flex-wrap gap-4">
              <p>
                <span className="text-[11px] font-medium uppercase text-slate-500">
                  Số công trình
                </span>
                <br />
                <span className="font-semibold tabular-nums">{tong_ct}</span>
              </p>
              <p>
                <span className="text-[11px] font-medium uppercase text-slate-500">
                  Đã giao
                </span>
                <br />
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                    tong_ct > 0 && da_giao_ct >= tong_ct
                      ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200"
                      : "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                  }`}
                >
                  {da_giao_ct}/{tong_ct} CT
                </span>
              </p>
            </div>
          </div>
          <div className="space-y-2 text-[13px]">
            <div>
              <span className="text-[11px] font-medium uppercase text-slate-500">
                Trích yếu
              </span>
              <p className="mt-1 text-justify leading-snug text-slate-800">
                {qd.trich_yeu?.trim() || "—"}
              </p>
            </div>
            <p>
              <span className="font-semibold text-slate-800">Người quét:</span>{" "}
              {qd.scanned_by_ho_ten?.trim() || "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Giao nhiệm vụ */}
      <section className={`rounded-xl border bg-white p-4 shadow-sm ${t.border}`}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className={`text-[12px] font-semibold tracking-wide uppercase ${t.primaryText}`}>
            II. Giao nhiệm vụ
          </h2>
          {soanMoi ? (
            <Link
              href={soanMoi}
              className={
                da_giao_ct > 0
                  ? "rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm ring-2 ring-orange-300 hover:bg-orange-700"
                  : `rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm ${t.primary}`
              }
            >
              {da_giao_ct > 0
                ? `Giao tiếp ${conLai} công trình còn lại`
                : "Lập giao nhiệm vụ"}
            </Link>
          ) : null}
        </div>

        {qd_giao_xn.length > 0 ? (
          <div className="mb-4 space-y-2">
            <p className="text-[11px] font-medium uppercase text-slate-500">
              Quyết định đã lập
            </p>
            <ul className="space-y-1.5">
              {qd_giao_xn.map((q) => (
                <li
                  key={q.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[12px] ${t.border} ${t.softBg}`}
                >
                  <span>
                    {q.so_qd_du_thao?.trim()
                      ? `QĐ ${q.so_qd_du_thao.trim()}`
                      : "Dự thảo chưa số"}
                    {" · "}
                    {q.xi_nghiep_ten || "Chưa chọn XN"}
                    {" · "}
                    {q.so_ct} CT
                    {" · "}
                    {labelTrangThaiGiaoXn(
                      q.trang_thai as "nhap" | "trinh_gd" | "da_ban_hanh",
                    )}
                  </span>
                  <Link
                    href={soanQdHref(q.du_an_id, q.id)}
                    className={`rounded border px-2 py-0.5 text-[11px] font-medium ${t.btnOutline}`}
                  >
                    Mở soạn
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-3 text-[12px] text-slate-600">
            Chưa có quyết định giao Xí nghiệp. Chọn công trình bên dưới và lập
            giao (có thể giao hết hoặc từng phần).
          </p>
        )}

        <div className={`overflow-x-auto rounded-lg border ${t.border}`}>
          <table className="w-full border-collapse text-left text-[12px]">
            <thead className={`text-center text-[11px] font-semibold ${t.headerBg} ${t.headerText}`}>
              <tr>
                <th className="w-12 px-2 py-2">STT</th>
                <th className="px-2 py-2">Công trình</th>
                <th className="w-1 whitespace-nowrap px-2 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {cong_trinh.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-slate-500">
                    Chưa có công trình trong phụ lục Giao A.
                  </td>
                </tr>
              ) : (
                cong_trinh.map((c, i) => (
                  <tr
                    key={c.row_key}
                    className={`border-t ${t.border} ${
                      c.da_giao
                        ? `opacity-55 ${t.softBg}`
                        : "bg-white"
                    }`}
                  >
                    <td className="px-2 py-2 text-center tabular-nums">
                      {c.stt ?? i + 1}
                    </td>
                    <td className="min-w-0 px-2 py-2">
                      <p className="line-clamp-2 text-justify leading-snug">
                        {c.ten_du_an}
                      </p>
                      {c.ma_du_an ? (
                        <p className={`mt-0.5 font-mono text-[10px] ${t.softText}`}>
                          {c.ma_du_an}
                        </p>
                      ) : null}
                    </td>
                    <td
                      className={`whitespace-nowrap px-2 py-2 align-middle text-[11px] leading-snug ${c.da_giao ? t.softText : ""}`}
                    >
                      {c.da_giao ? (
                        <span>
                          Đã giao
                          {c.xi_nghiep_ten ? ` · ${c.xi_nghiep_ten}` : ""}
                          {c.so_qd_du_thao?.trim()
                            ? ` · QĐ ${c.so_qd_du_thao.trim()}`
                            : ""}
                        </span>
                      ) : (
                        <span className="font-medium text-amber-800">
                          Chưa giao
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
