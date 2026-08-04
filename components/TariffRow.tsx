"use client";

import { useActionState } from "react";
import { updateTariff, type AdminState } from "@/app/admin/actions";
import type { Tariff } from "@/lib/pricing";

const initialState: AdminState = { error: null, success: null };
const unitLabel: Record<Tariff["unit"], string> = {
  kg: "Fórmula por peso (kg)",
  fixed: "Precio fijo",
  percent: "Porcentaje del monto",
  custom: "A cotizar",
};

export default function TariffRow({ tariff }: { tariff: Tariff }) {
  const [state, formAction, pending] = useActionState(updateTariff, initialState);
  const volumetricFactor = Number(tariff.extra?.volumetric_factor_kg_per_m3 ?? 167);
  const handlingFee = Number(tariff.extra?.handling_fee ?? 0);
  const customNote = String(tariff.extra?.nota ?? "");

  return (
    <form action={formAction} className="card">
      <input type="hidden" name="service_key" value={tariff.service_key} />
      <input type="hidden" name="unit" value={tariff.unit} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <strong>{tariff.name}</strong>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{unitLabel[tariff.unit]}</span>
      </div>
      {tariff.description && <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>{tariff.description}</p>}
      {state.error && <p className="error-text">{state.error}</p>}
      {state.success && <p className="success-text">{state.success}</p>}

      {tariff.unit === "kg" && (
        <div className="formula-box">
          <strong>Metodología de cálculo</strong>
          <ol>
            <li>Peso volumétrico = (Largo × Ancho × Alto en cm ÷ 1,000,000) × factor volumétrico</li>
            <li>Peso facturable = el mayor entre peso real y peso volumétrico</li>
            <li>Flete = peso facturable × tarifa por kg</li>
            <li>Subtotal = el mayor entre el flete y el mínimo de cobro</li>
            <li>Total = subtotal + cargo de manejo (si aplica)</li>
          </ol>
        </div>
      )}

      <div className="form-grid">
        <div className="form-field">
          <label>{tariff.unit === "percent" ? "Porcentaje (%)" : tariff.unit === "kg" ? "Tarifa por kg (USD)" : "Precio (USD)"}</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue={tariff.price} disabled={tariff.unit === "custom"} />
        </div>
        {tariff.unit !== "percent" && tariff.unit !== "custom" && (
          <div className="form-field">
            <label>Mínimo de cobro (opcional)</label>
            <input name="min_charge" type="number" step="0.01" min="0" defaultValue={tariff.min_charge ?? ""} />
          </div>
        )}
        {tariff.unit === "kg" && (
          <>
            <div className="form-field">
              <label>Factor volumétrico (kg por m³)</label>
              <input name="volumetric_factor" type="number" step="1" min="1" defaultValue={volumetricFactor} />
              <small>Estándar de la industria: 167. Súbelo para que el peso volumétrico pese menos en el cálculo.</small>
            </div>
            <div className="form-field">
              <label>Cargo de manejo fijo (USD, opcional)</label>
              <input name="handling_fee" type="number" step="0.01" min="0" defaultValue={handlingFee} />
              <small>Se suma al final, aparte del flete. Déjalo en 0 si no aplica.</small>
            </div>
          </>
        )}
        {tariff.unit === "custom" && (
          <div className="form-field">
            <label>Nota para el cliente</label>
            <input name="custom_note" type="text" defaultValue={customNote} placeholder="Ej: Cotizar según requerimiento" />
          </div>
        )}
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
