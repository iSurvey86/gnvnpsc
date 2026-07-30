import { redirect } from "next/navigation";
import { HeThongForbidden } from "@/components/HeThongForbidden";
import { NhanSuAdminClient } from "@/components/NhanSuAdminClient";
import { getSessionProfile } from "@/lib/session";

export default async function HeThongNhanSuPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) return <HeThongForbidden />;

  return <NhanSuAdminClient />;
}
