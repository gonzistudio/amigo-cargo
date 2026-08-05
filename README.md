# vinext-starter

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Linux with `flock`, `curl`, and GNU `timeout`

## Sites Lifecycle

The Sites lifecycle CLI runs the locked dependency install before returning this checkout. Edit the source under `app/`, then checkpoint when a coherent milestone is ready to inspect or share. The remote Sites builder runs `npm run build` against the pushed commit. Do not repeat install or build as a normal pre-checkpoint step.

This starter does not use `wrangler.jsonc`.

`install:ci` is intentionally a single, non-retrying `npm ci`. It refuses a concurrent install for the same project, consumes a matching image-seeded npm cache with `--prefer-offline` while retaining registry fallback for a missing cache object, otherwise downloads and verifies the complete vinext tarball recorded in `package-lock.json`, limits npm to one socket, and terminates a stalled install. `build` applies a short timeout and then validates the Sites artifact. These helpers target Linux and use GNU `timeout`; they are not native macOS scripts.

Scripts that need writable project-scoped home, npm, XDG, and temporary paths use `scripts/sites-env.sh`. The `dev` and `start` scripts honor the caller's runtime environment and keep Wrangler logs inside the checkout. The generated `.sites-runtime/` directory is disposable and ignored by Git.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Diagnostic Commands

- `npm run install:ci`: perform the one bounded lockfile install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build and validate the deployable Sites artifact
- `npm run start`: start the built Vinext application
- `npm test`: build, validate, and verify the rendered development-preview metadata
- `npm run validate:artifact`: recheck an existing artifact's manifest and ESM `default.fetch` export
- `npm run db:generate`: generate Drizzle migrations after schema changes

Use build and validation commands for targeted diagnosis after a remote failure, not as part of the normal checkpoint path.

The timeout defaults can be overridden for a controlled canary with `SITES_INSTALL_TIMEOUT`, `SITES_INSTALL_KILL_AFTER`, `SITES_BUILD_TIMEOUT`, and `SITES_BUILD_KILL_AFTER`. A timeout fails the command; the helpers never retry an unchanged install or build.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

## Amigo Cargo — Calculadora, cuentas y panel admin

Esta rama añade autenticación de clientes, calculadora de envíos y panel de
administración, conectados a Supabase.

### 1. Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

En Vercel: Project Settings → Environment Variables → agrega las mismas dos
variables (Production y Preview).

### 2. Esquema de base de datos

En el dashboard de Supabase → SQL Editor, ejecuta el contenido de
`supabase/migrations/0001_init.sql`. Crea:

- `profiles` (perfil + número de casillero automático + rol client/admin)
- `shipments` y `shipment_events` (envíos y su línea de tiempo)
- `tariffs` (tarifas editables desde `/admin/tarifas`, con valores iniciales
  tomados del brochure)
- Políticas RLS: los clientes solo ven sus propios datos; el admin ve y
  gestiona todo. Las tarifas son de lectura pública (para la calculadora).

No se usa la `service_role key` — todo opera respetando RLS con la sesión del
usuario.

### 3. Crear el primer administrador (y los siguientes)

No hay registro público. Cada admin se crea a mano:

1. Supabase → **Authentication → Users → Add user** → correo y contraseña.
2. Supabase → **Table Editor → profiles** → busca esa fila (se crea sola por
   trigger) → cambia `role` a `admin`.
3. Comparte esas credenciales con la persona — puede entrar a `/login` y
   cambiar el correo y/o la contraseña desde **Mi cuenta** dentro del panel,
   sin que tengas que tocar Supabase de nuevo.

### 4. Rutas actuales (fase 1)

- `/` — landing pública, con la calculadora embebida en `#calculadora`.
- `/login` — acceso exclusivo de administradores (sin registro público, sin
  enlace visible desde la landing).
- `/admin` — tarifas (fórmula de envío marítimo, servicios adicionales).
- `/admin/cuenta` — el admin logueado cambia su propio correo/contraseña.

Las tablas `profiles`, `shipments` y `shipment_events` ya existen en Supabase
para la fase 2 (cuentas de cliente, casilleros, trackings), pero no tienen UI
todavía — se integran cuando se retome ese alcance.

### 5. Panel admin en subdominio propio

Por defecto `/admin` y `/login` funcionan en cualquier dominio (útil para
probar antes de tener el dominio final). Para que el panel viva en un
subdominio aparte y desaparezca del dominio principal:

1. Vercel → Project Settings → **Domains** → agrega `panel.tudominio.com`
   (o el nombre que prefieras) apuntando a este mismo proyecto.
2. Vercel → Project Settings → **Environment Variables** → agrega:
   - `ADMIN_HOSTNAME` = `panel.tudominio.com` (Production)
   - `SITE_URL` = `https://tudominio.com` (Production) — para que el enlace
     "Volver al sitio" dentro del panel apunte al dominio principal.
3. Redeploy. A partir de ahí:
   - `panel.tudominio.com` solo muestra `/admin` y `/login` (cualquier otra
     ruta redirige ahí).
   - `tudominio.com` deja de servir `/admin` y `/login` por completo
     (redirige al inicio), aunque alguien adivine la URL.
