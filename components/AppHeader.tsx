import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="app-header">
      <Link className="brand" href="/" aria-label="Amigo Cargo, inicio">
        <img src="/logo-amigo-cargo.svg" alt="Amigo Cargo" className="brand-logo" />
      </Link>
      <nav aria-label="Navegación">
        <Link href="/">Volver al sitio</Link>
        {user ? (
          <>
            <Link href="/admin">Panel admin</Link>
            <form action={signOut}>
              <button className="btn small ghost" type="submit">Salir</button>
            </form>
          </>
        ) : null}
      </nav>
    </header>
  );
}
