import { redirect } from "next/navigation";
import { XiNghiepAdminClient } from "@/components/XiNghiepAdminClient";
import { getSessionProfile } from "@/lib/session";

export default async function HeThongXiNghiepPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  return <XiNghiepAdminClient isAdmin={profile.isAdmin} />;
}
