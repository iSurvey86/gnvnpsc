import { redirect } from "next/navigation";

/** Nhập Giao A nằm trong luồng Quản lý dự án */
export default function GiaoAIndexRedirect() {
  redirect("/nhap-du-an");
}
