import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: userCount }, { count: shipmentCount }, { count: pendingCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("shipments").select("*", { count: "exact", head: true }),
    supabase
      .from("shipments")
      .select("*", { count: "exact", head: true })
      .not("status", "in", '("entregado","cancelado")'),
  ]);

  return (
    <div className="form-grid">
      <div className="card">
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Clientes registrados</p>
        <p style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 0" }}>{userCount ?? 0}</p>
      </div>
      <div className="card">
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Envíos totales</p>
        <p style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 0" }}>{shipmentCount ?? 0}</p>
      </div>
      <div className="card">
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Envíos en proceso</p>
        <p style={{ fontSize: 32, fontWeight: 700, margin: "8px 0 0" }}>{pendingCount ?? 0}</p>
      </div>
    </div>
  );
}
