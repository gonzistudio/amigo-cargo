import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Separación por subdominio del panel administrativo.
 *
 * Mientras la variable de entorno ADMIN_HOSTNAME no esté configurada en
 * Vercel, el sitio se comporta como hoy: /admin y /login son accesibles
 * desde cualquier host (útil para probar antes de conectar el dominio).
 *
 * Una vez conectado el dominio final, agrega en Vercel un dominio como
 * "panel.tudominio.com" apuntando a este mismo proyecto, y define
 * ADMIN_HOSTNAME=panel.tudominio.com (puede llevar varios, separados por
 * coma). A partir de ahí:
 * - En panel.tudominio.com solo existen /admin y /login (todo lo demás
 *   redirige ahí).
 * - En el dominio principal, /admin y /login dejan de existir por completo
 *   (redirige al inicio) — no aparece ni se puede adivinar la URL.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/login";

  const adminHosts = (process.env.ADMIN_HOSTNAME || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  if (adminHosts.length > 0) {
    const hostname = (request.headers.get("host") || "").split(":")[0];
    const isAdminHost = adminHosts.includes(hostname);

    if (isAdminHost && !isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    if (!isAdminHost && isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if (isAdminRoute && pathname !== "/login" && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
