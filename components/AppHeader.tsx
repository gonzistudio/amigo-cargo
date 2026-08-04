import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  return (
    <header className="app-header">
      <Link className="brand" href="/" aria-label="Amigo Cargo, inicio">
        <span className="brand-mark">AC</span>
        <span>AMIGO CARGO</span>
      </Link>
      <nav aria-label="Navegación">
        <Link href="/calculadora">Calculadora</Link>
        {user ? (
          <>
            <Link href="/mi-cuenta">Mi cuenta</Link>
            {role === "admin" && <Link href="/admin">Panel admin</Link>}
            <form action={signOut}>
              <button className="btn small ghost" type="submit">Salir</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">Iniciar sesión</Link>
            <Link className="btn small" href="/registro">Crear cuenta</Link>
          </>
        )}
      </nav>
    </header>
  );
}
