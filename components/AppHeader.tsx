import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Cuando el panel vive en su propio subdominio (ADMIN_HOSTNAME configurado
  // en Vercel), "/" en ese host redirige de vuelta a /admin — por eso el
  // logo lleva ahí y "volver al sitio" usa la URL absoluta del dominio
  // principal (SITE_URL) en vez de un link relativo.
  const siteUrl = process.env.SITE_URL || "/";

  return (
    <header className="app-header">
      <Link className="brand" href="/admin" aria-label="Panel Amigo Cargo">
        <img src="/logo-amigo-cargo.svg" alt="Amigo Cargo" className="brand-logo" />
      </Link>
      <nav aria-label="Navegación">
        <a href={siteUrl}>Volver al sitio</a>
        {user ? (
          <form action={signOut}>
            <button className="btn small ghost" type="submit">Salir</button>
          </form>
        ) : null}
      </nav>
    </header>
  );
}
