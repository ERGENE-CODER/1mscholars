import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/admin";
import AdminShell from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login?mode=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.claims.sub)
    .maybeSingle();

  if (!isAdminRole(profile?.role)) {
    redirect("/");
  }

  // Applications waiting for the team (shown on the bell).
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "submitted");

  return (
    <AdminShell adminName={profile?.full_name?.trim() || "Administrator"} pendingCount={count ?? 0}>
      {children}
    </AdminShell>
  );
}