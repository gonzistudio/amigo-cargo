"use client";

import { useActionState } from "react";
import { setUserRole, type AdminState } from "@/app/admin/actions";

const initialState: AdminState = { error: null, success: null };

export default function RoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [state, formAction, pending] = useActionState(setUserRole, initialState);

  return (
    <form action={formAction} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input type="hidden" name="user_id" value={userId} />
      <select name="role" defaultValue={currentRole} style={{ border: "1px solid var(--line)", padding: "8px 10px", fontSize: 13 }}>
        <option value="client">Cliente</option>
        <option value="admin">Administrador</option>
      </select>
      <button className="btn small" type="submit" disabled={pending}>
        {pending ? "..." : "Guardar"}
      </button>
      {state.error && <span className="error-text" style={{ margin: 0 }}>{state.error}</span>}
    </form>
  );
}
