import AppHeader from "@/components/AppHeader";
import RegisterForm from "./RegisterForm";

export default function RegistroPage() {
  return (
    <>
      <AppHeader />
      <main className="app-shell narrow">
        <p className="app-eyebrow"><span /> Mi cuenta</p>
        <h1 className="app-title">Crear cuenta</h1>
        <p className="app-lead">
          Al registrarte te asignamos automáticamente un número de casillero para identificar tu mercancía.
        </p>
        <RegisterForm />
      </main>
    </>
  );
}
