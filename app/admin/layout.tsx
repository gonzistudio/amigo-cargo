import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/login");

  return (
    <>
      <AppHeader />
      <main className="app-shell">
        <p className="app-eyebrow"><span /> Panel interno</p>
        <h1 className="app-title">Panel administrativo</h1>
        <AdminNav />
        {children}
      </main>
    </>
  );
}
