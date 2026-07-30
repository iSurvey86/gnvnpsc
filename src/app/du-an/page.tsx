import { redirect } from "next/navigation";

/** Danh mục dự án nằm trong phân hệ TVTK */
export default function DuAnIndexRedirect() {
  redirect("/tvtk");
}
