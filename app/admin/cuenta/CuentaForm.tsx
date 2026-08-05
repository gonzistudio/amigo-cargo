"use client";

import { useActionState } from "react";
import { updateCredentials, type CredentialsState } from "@/app/actions/auth";

const initialState: CredentialsState = { error: null, success: null };

export default function CuentaForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, pending] = useActionState(updateCredentials, initialState);

  return (
    <form action={formAction} className="card">
      {state.error && <p className="error-text">{state.error}</p>}
      {state.success && <p className="success-text">{state.success}</p>}

      <div className="form-field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" defaultValue={currentEmail} required />
        <small>Si lo cambias, te llegará un correo de confirmación a la nueva dirección.</small>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="password">Nueva contraseña</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} />
        </div>
        <div className="form-field">
          <label htmlFor="confirm_password">Confirmar nueva contraseña</label>
          <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} />
        </div>
      </div>
      <p className="calc-note" style={{ marginBottom: 16 }}>
        Deja los campos de contraseña vacíos si solo quieres actualizar el correo.
      </p>

      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
