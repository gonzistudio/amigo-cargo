"use client";

import { useActionState } from "react";
import { createShipment, type AdminState } from "@/app/admin/actions";

const initialState: AdminState = { error: null, success: null };

export default function NewShipmentForm() {
  const [state, formAction, pending] = useActionState(createShipment, initialState);

  return (
    <form action={formAction} className="card">
      <strong>Registrar nuevo envío</strong>
      {state.error && <p className="error-text">{state.error}</p>}
      {state.success && <p className="success-text">{state.success}</p>}
      <div className="form-grid" style={{ marginTop: 14 }}>
        <div className="form-field">
          <label>Casillero del cliente</label>
          <input name="casillero_code" placeholder="AC-0001" required />
        </div>
        <div className="form-field">
          <label>Descripción</label>
          <input name="description" placeholder="Ej: 3 cajas de ropa" />
        </div>
        <div className="form-field">
          <label>Peso (kg)</label>
          <input name="weight_kg" type="number" step="0.01" min="0" />
        </div>
        <div className="form-field">
          <label>Volumen (m³)</label>
          <input name="volume_m3" type="number" step="0.001" min="0" />
        </div>
      </div>
      <button className="btn small" type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear envío"}
      </button>
    </form>
  );
}
