import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/mi-cuenta");

  return (
    <>
      <AppHeader />
      <main className="app-shell">
        <p className="app-eyebrow"><span /> Panel interno</p>
        <h1 className="app-title">Administración</h1>
        <nav className="admin-tabs">
          <Link href="/admin">Resumen</Link>
          <Link href="/admin/envios">Envíos</Link>
          <Link href="/admin/tarifas">Tarifas</Link>
          <Link href="/admin/usuarios">Usuarios</Link>
        </nav>
        {children}
      </main>
    </>
  );
}
