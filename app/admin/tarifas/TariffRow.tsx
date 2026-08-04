"use client";

import { useActionState } from "react";
import { updateTariff, type AdminState } from "@/app/admin/actions";
import type { Tariff } from "@/lib/pricing";

const initialState: AdminState = { error: null, success: null };
const unitLabel: Record<Tariff["unit"], string> = {
  kg: "USD por kg",
  fixed: "USD fijo",
  percent: "% del monto",
  custom: "A cotizar",
};

export default function TariffRow({ tariff }: { tariff: Tariff }) {
  const [state, formAction, pending] = useActionState(updateTariff, initialState);

  return (
    <form action={formAction} className="card">
      <input type="hidden" name="service_key" value={tariff.service_key} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <strong>{tariff.name}</strong>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{unitLabel[tariff.unit]}</span>
      </div>
      {tariff.description && <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>{tariff.description}</p>}
      {state.error && <p className="error-text">{state.error}</p>}
      {state.success && <p className="success-text">{state.success}</p>}
      <div className="form-grid">
        <div className="form-field">
          <label>Precio</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue={tariff.price} />
        </div>
        <div className="form-field">
          <label>Mínimo de cobro (opcional)</label>
          <input name="min_charge" type="number" step="0.01" min="0" defaultValue={tariff.min_charge ?? ""} />
        </div>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 16 }}>
        <input type="checkbox" name="active" defaultChecked={tariff.active} />
        Visible / activa
      </label>
      <button className="btn small" type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
