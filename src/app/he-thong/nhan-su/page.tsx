import { redirect } from "next/navigation";
import { NhanSuAdminClient } from "@/components/NhanSuAdminClient";
import { getSessionProfile } from "@/lib/session";

export default async function HeThongNhanSuPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  return <NhanSuAdminClient isAdmin={profile.isAdmin} />;
}
