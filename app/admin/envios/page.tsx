import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS } from "@/lib/pricing";
import NewShipmentForm from "./NewShipmentForm";
import ShipmentStatusForm from "./ShipmentStatusForm";

export default async function EnviosPage() {
  const supabase = await createClient();
  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, tracking_code, description, status, weight_kg, volume_m3, profiles!inner(casillero_code, full_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <NewShipmentForm />
      <h2 style={{ fontSize: 16, margin: "32px 0 16px" }}>Todos los envíos</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Tracking</th>
            <th>Cliente</th>
            <th>Descripción</th>
            <th>Estatus</th>
          </tr>
        </thead>
        <tbody>
          {shipments?.map((s) => {
            const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
            return (
              <tr key={s.id}>
                <td>{s.tracking_code}</td>
                <td>
                  {profile?.full_name}
                  <br />
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{profile?.casillero_code}</span>
                </td>
                <td>{s.description}</td>
                <td style={{ minWidth: 260 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--muted)" }}>{STATUS_LABELS[s.status] ?? s.status}</p>
                  <ShipmentStatusForm shipmentId={s.id} currentStatus={s.status} />
                </td>
              </tr>
            );
          })}
          {(!shipments || shipments.length === 0) && (
            <tr><td colSpan={4} style={{ color: "var(--muted)" }}>Todavía no hay envíos registrados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
