import { redirect } from "next/navigation";

/** Vào QLHT → thẳng Giám sát hoạt động */
export default function HeThongPage() {
  redirect("/he-thong/giam-sat");
}
