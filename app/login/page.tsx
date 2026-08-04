import AppHeader from "@/components/AppHeader";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <AppHeader />
      <main className="app-shell narrow">
        <p className="app-eyebrow"><span /> Acceso interno</p>
        <h1 className="app-title">Iniciar sesión</h1>
        <p className="app-lead">Acceso exclusivo para administradores de Amigo Cargo.</p>
        <LoginForm next={next || "/admin"} />
      </main>
    </>
  );
}
