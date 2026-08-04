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
        <p className="app-eyebrow"><span /> Mi cuenta</p>
        <h1 className="app-title">Iniciar sesión</h1>
        <p className="app-lead">Consulta tu casillero y el estatus de tus envíos.</p>
        <LoginForm next={next || "/mi-cuenta"} />
      </main>
    </>
  );
}
