"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = { error: null };

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="card">
      {state.error && <p className="error-text">{state.error}</p>}
      <div className="form-field">
        <label htmlFor="full_name">Nombre completo</label>
        <input id="full_name" name="full_name" type="text" required autoComplete="name" />
      </div>
      <div className="form-field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <small>Mínimo 8 caracteres.</small>
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <p style={{ fontSize: 13, marginTop: 18, color: "var(--muted)" }}>
        ¿Ya tienes cuenta? <Link href="/login" style={{ color: "var(--blue)", fontWeight: 700 }}>Inicia sesión</Link>
      </p>
    </form>
  );
}
