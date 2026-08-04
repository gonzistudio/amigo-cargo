import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/pricing";

export default async function MiCuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/mi-cuenta");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, casillero_code, email")
    .eq("id", user.id)
    .single();

  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, tracking_code, description, status, weight_kg, volume_m3, estimated_delivery, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <AppHeader />
      <main className="app-shell">
        <p className="app-eyebrow"><span /> Mi cuenta</p>
        <h1 className="app-title">Hola, {profile?.full_name || "cliente"}</h1>
        <p className="app-lead">
          Tu número de casillero: <strong style={{ color: "var(--ink)" }}>{profile?.casillero_code}</strong>.
          Úsalo para identificar tu mercancía cuando llegue a nuestra bodega en China.
        </p>

        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Tus envíos</h2>
        {!shipments || shipments.length === 0 ? (
          <div className="card">
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Todavía no tienes envíos registrados. Cuando realices una compra y la recibamos en
              bodega, aquí verás el estatus de tu carga.
            </p>
          </div>
        ) : (
          shipments.map((s) => {
            const stepIndex = STATUS_ORDER.indexOf(s.status);
            return (
              <div className="card" key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <strong>{s.tracking_code}</strong>
                    {s.description && <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13 }}>{s.description}</p>}
                  </div>
                  <span className={`badge ${s.status === "entregado" ? "done" : ""}`}>
                    {STATUS_LABELS[s.status] ?? s.status}
                  </span>
                </div>
                <div className="timeline">
                  {STATUS_ORDER.map((step, i) => (
                    <div className={`timeline-item ${i <= stepIndex ? "active" : ""}`} key={step}>
                      <strong>{STATUS_LABELS[step]}</strong>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>
    </>
  );
}
