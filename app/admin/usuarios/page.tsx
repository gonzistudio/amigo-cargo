import { createClient } from "@/lib/supabase/server";
import RoleForm from "./RoleForm";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, casillero_code, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Correo</th>
          <th>Casillero</th>
          <th>Rol</th>
        </tr>
      </thead>
      <tbody>
        {profiles?.map((p) => (
          <tr key={p.id}>
            <td>{p.full_name || "—"}</td>
            <td>{p.email}</td>
            <td>{p.casillero_code}</td>
            <td><RoleForm userId={p.id} currentRole={p.role} /></td>
          </tr>
        ))}
        {(!profiles || profiles.length === 0) && (
          <tr><td colSpan={4} style={{ color: "var(--muted)" }}>Sin usuarios registrados.</td></tr>
        )}
      </tbody>
    </table>
  );
}
