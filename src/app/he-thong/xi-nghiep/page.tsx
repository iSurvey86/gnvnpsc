import { redirect } from "next/navigation";
import { HeThongForbidden } from "@/components/HeThongForbidden";
import { XiNghiepAdminClient } from "@/components/XiNghiepAdminClient";
import { getSessionProfile } from "@/lib/session";

export default async function HeThongXiNghiepPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) return <HeThongForbidden />;

  return <XiNghiepAdminClient />;
}
