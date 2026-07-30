import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const loaiLabel: Record<string, string> = {
  tvtk: "Tư vấn thiết kế",
  thi_nghiem: "Thí nghiệm",
};

const ttLabel: Record<string, string> = {
  nhap: "Nháp",
  trinh_gd: "Trình GĐ",
  da_ban_hanh: "Đã ban hành",
};

export default async function QdGiaoXnListPage() {
  let rows: Array<{
    id: string;
    loai: string;
    so_qd_du_thao: string | null;
    ngay_du_thao: string | null;
    trang_thai: string;
    du_an: { ten_du_an: string; ma_du_an: string | null } | null;
    xi_nghiep: { ten: string } | null;
  }> = [];
  let loadError: string | null = null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("qd_giao_xn")
      .select(
        "id, loai, so_qd_du_thao, ngay_du_thao, trang_thai, du_an:du_an_id ( ten_du_an, ma_du_an ), xi_nghiep:xi_nghiep_id ( ten )",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    rows = (data ?? []).map((raw) => {
      const r = raw as {
        id: string;
        loai: string;
        so_qd_du_thao: string | null;
        ngay_du_thao: string | null;
        trang_thai: string;
        du_an:
          | { ten_du_an: string; ma_du_an: string | null }
          | { ten_du_an: string; ma_du_an: string | null }[]
          | null;
        xi_nghiep: { ten: string } | { ten: string }[] | null;
      };
      const duAn = Array.isArray(r.du_an) ? (r.du_an[0] ?? null) : r.du_an;
      const xn = Array.isArray(r.xi_nghiep)
        ? (r.xi_nghiep[0] ?? null)
        : r.xi_nghiep;
      return {
        id: r.id,
        loai: r.loai,
        so_qd_du_thao: r.so_qd_du_thao,
        ngay_du_thao: r.ngay_du_thao,
        trang_thai: r.trang_thai,
        du_an: duAn,
        xi_nghiep: xn,
      };
    });
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Lỗi tải";
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-teal-900">
            QĐ GIAO XÍ NGHIỆP
          </h1>
          <p className="mt-0.5 text-xs text-teal-700/60">
            Dự thảo TVTK / Thí nghiệm · xuất Word sẽ bổ sung khi có mẫu
          </p>
        </div>
        <Link
          href="/tvtk"
          className="rounded-xl border-2 border-teal-500 bg-teal-50 px-5 py-2.5 text-sm font-bold text-teal-800 shadow-sm hover:bg-teal-100"
        >
          ← Quản lý dự án
        </Link>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6]/70 p-10 text-center text-sm text-rose-900/80">
          Chưa có dự thảo. Mở{" "}
          <Link href="/tvtk" className="font-bold text-teal-700 hover:underline">
            Quản lý dự án
          </Link>{" "}
          → Soạn QĐ.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm font-medium text-gray-700">
              <thead className="bg-teal-700 text-center text-xs font-semibold tracking-wide text-white uppercase">
                <tr>
                  <th className="w-12 border-r border-teal-800 px-2 py-3">
                    STT
                  </th>
                  <th className="w-44 whitespace-nowrap border-r border-teal-800 px-3 py-3">
                    Mã dự án
                  </th>
                  <th className="min-w-[16rem] border-r border-teal-800 px-4 py-3">
                    Tên dự án
                  </th>
                  <th className="w-36 whitespace-nowrap border-r border-teal-800 px-3 py-3">
                    Loại
                  </th>
                  <th className="w-28 whitespace-nowrap border-r border-teal-800 px-3 py-3">
                    Số / Ngày
                  </th>
                  <th className="w-44 border-r border-teal-800 px-3 py-3">
                    Xí nghiệp
                  </th>
                  <th className="w-28 whitespace-nowrap px-3 py-3">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-teal-50 odd:bg-white even:bg-[#eef8f5] hover:bg-[#dcefea]"
                  >
                    <td className="px-2 py-3 text-center text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3 text-center text-xs tabular-nums text-gray-600">
                      {r.du_an?.ma_du_an || "—"}
                    </td>
                    <td className="px-4 py-3 text-left font-semibold text-teal-950">
                      {r.du_an?.ten_du_an ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
                          r.loai === "tvtk"
                            ? "bg-cyan-50 text-cyan-800"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {loaiLabel[r.loai] ?? r.loai}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="text-sm text-gray-700">
                        {r.so_qd_du_thao || "Chưa số"}
                      </div>
                      <div className="text-xs font-medium text-gray-400">
                        {r.ngay_du_thao || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-700">
                      {r.xi_nghiep?.ten || "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-block rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
                        {ttLabel[r.trang_thai] ?? r.trang_thai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
