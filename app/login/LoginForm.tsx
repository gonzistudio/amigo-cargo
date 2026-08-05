"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = { error: null };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="card">
      {state.error && <p className="error-text">{state.error}</p>}
      <div className="form-field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
