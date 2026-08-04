"use client";

import { useActionState } from "react";
import { updateShipmentStatus, type AdminState } from "@/app/admin/actions";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/pricing";

const initialState: AdminState = { error: null, success: null };

export default function ShipmentStatusForm({ shipmentId, currentStatus }: { shipmentId: string; currentStatus: string }) {
  const [state, formAction, pending] = useActionState(updateShipmentStatus, initialState);

  return (
    <form action={formAction} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="shipment_id" value={shipmentId} />
      <select name="status" defaultValue={currentStatus} style={{ border: "1px solid var(--line)", padding: "8px 10px", fontSize: 13 }}>
        {[...STATUS_ORDER, "cancelado"].map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <input name="note" placeholder="Nota (opcional)" style={{ border: "1px solid var(--line)", padding: "8px 10px", fontSize: 13, flex: 1, minWidth: 140 }} />
      <button className="btn small" type="submit" disabled={pending}>
        {pending ? "..." : "Actualizar"}
      </button>
      {state.error && <span className="error-text" style={{ margin: 0 }}>{state.error}</span>}
      {state.success && <span className="success-text" style={{ margin: 0 }}>✓</span>}
    </form>
  );
}
