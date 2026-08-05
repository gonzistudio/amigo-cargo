import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CuentaForm from "./CuentaForm";

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/cuenta");

  return (
    <div>
      <p className="app-lead">
        Cambia el correo o la contraseña con los que entras al panel administrativo.
      </p>
      <CuentaForm currentEmail={user.email ?? ""} />
    </div>
  );
}
