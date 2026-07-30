import { redirect } from "next/navigation";

/** Tương thích link cũ → phân hệ TVTK */
export default function NhapDuAnRedirect() {
  redirect("/tvtk/nhap-du-an");
}
