import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionProfile } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HuongDanPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <header className="space-y-1">
        <h1 className="text-xl font-bold tracking-wide text-teal-800 uppercase">
          Hướng dẫn sử dụng
        </h1>
        <p className="text-sm text-slate-600">
          Luồng chính: <strong>Danh mục giao A → Giao nhiệm vụ</strong> theo từng
          phân hệ (TVTK · TN · TVGS).
        </p>
      </header>

      <Section title="1. Chọn phân hệ">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Đăng nhập → trang chọn phân hệ.</li>
          <li>
            Chọn <strong>Tư vấn thiết kế</strong>,{" "}
            <strong>Thí nghiệm hiệu chỉnh</strong> hoặc{" "}
            <strong>Tư vấn giám sát</strong>.
          </li>
          <li>
            Mỗi thẻ hiện số đã giao / chưa giao nhiệm vụ. Ghi chú trên thẻ:{" "}
            <em>Danh mục giao A → Giao nhiệm vụ (…)</em>.
          </li>
        </ol>
      </Section>

      <Section title="2. Danh mục Giao A">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            Trong phân hệ, bảng theo <strong>Quyết định Giao A</strong> (không
            còn một dòng = một công trình).
          </li>
          <li>
            Cột: STT · Giao A · Người quét · Số công trình · Đã giao. Lọc theo{" "}
            <strong>Năm</strong> / <strong>Người quét</strong>.
          </li>
          <li>
            Bấm <strong>số Giao A</strong> để mở hồ sơ theo dõi / giao nhiệm vụ.
          </li>
          <li>
            Icon <strong>Xóa</strong> chỉ hiện với Quản trị / Trưởng phòng. Quét
            sai → báo Trưởng phòng xóa.
          </li>
          <li>
            <strong>+ Nhập Dự án (Giao A)</strong> để quét PDF thêm danh mục.
          </li>
        </ol>
      </Section>

      <Section title="3. Nhập từ PDF Giao A">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Chọn tệp PDF → Quét dữ liệu → màn Review.</li>
          <li>Kiểm tra / sửa mã, tên, địa điểm, quy mô, cấp điện áp.</li>
          <li>
            Loại hình dự án: dòng 110kV tự ghi; trung hạ áp bắt buộc chọn (theo
            phân hệ).
          </li>
          <li>
            Lưu. Chọn Xí nghiệp khi <strong>giao nhiệm vụ</strong>, không chọn
            trên Review.
          </li>
          <li>Không giữ bản quét → Hủy bản quét.</li>
        </ol>
      </Section>

      <Section title="4. Giao nhiệm vụ">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            Trong hồ sơ Giao A → <strong>Lập giao nhiệm vụ</strong> hoặc{" "}
            <strong>Giao tiếp … còn lại</strong>.
          </li>
          <li>
            Công trình đã giao bị mờ/khóa. Tick CT giao lần này; có thể giao hết
            hoặc từng phần cho nhiều Xí nghiệp.
          </li>
          <li>
            Kiểm tra số QĐ, căn cứ, Xí nghiệp → Lưu · Xuất Word · Tải PDF đã ký
            (chốt trạng thái Đã giao).
          </li>
          <li>
            Xóa dự thảo chỉ khi còn Nháp. Quyết định đã giao chỉ Quản trị được
            xóa để dọn dữ liệu sai.
          </li>
        </ol>
      </Section>

      <Section title="5. Đăng nhập & hỗ trợ">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Dùng email / mật khẩu được cấp. Quên mật khẩu → liên hệ Quản trị.</li>
          <li>
            Sidebar → <strong>Quản lý hệ thống</strong>: xem{" "}
            <strong>Danh sách tài khoản</strong> và{" "}
            <strong>Danh sách Xí nghiệp</strong> (chỉ xem). Nhật ký hoạt động
            chỉ dành Admin.
          </li>
          <li>
            Cần hỗ trợ nghiệp vụ hoặc xóa hồ sơ quét sai → báo{" "}
            <strong>Trưởng phòng</strong>.
          </li>
        </ol>
        <p className="mt-3">
          <Link
            href="/"
            className="text-sm font-medium text-teal-700 underline hover:text-teal-900"
          >
            ← Về chọn phân hệ
          </Link>
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-teal-100 bg-white p-4 shadow-sm md:p-5">
      <h2 className="mb-3 text-sm font-bold tracking-wide text-teal-800 uppercase">
        {title}
      </h2>
      <div className="text-[13px] leading-relaxed text-slate-800">{children}</div>
    </section>
  );
}
