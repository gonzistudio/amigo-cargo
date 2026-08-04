"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdminState = { error: string | null; success: string | null };

export async function updateTariff(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const supabase = await createClient();
  const service_key = String(formData.get("service_key"));
  const price = parseFloat(String(formData.get("price") || "0"));
  const min_charge_raw = String(formData.get("min_charge") || "");
  const min_charge = min_charge_raw === "" ? null : parseFloat(min_charge_raw);
  const active = formData.get("active") === "on";

  const { error } = await supabase
    .from("tariffs")
    .update({ price, min_charge, active })
    .eq("service_key", service_key);

  if (error) return { error: error.message, success: null };

  revalidatePath("/admin/tarifas");
  revalidatePath("/calculadora");
  return { error: null, success: "Tarifa actualizada." };
}

export async function createShipment(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const supabase = await createClient();
  const casillero_code = String(formData.get("casillero_code") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const weight_kg = formData.get("weight_kg") ? parseFloat(String(formData.get("weight_kg"))) : null;
  const volume_m3 = formData.get("volume_m3") ? parseFloat(String(formData.get("volume_m3"))) : null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("casillero_code", casillero_code)
    .single();

  if (profileError || !profile) {
    return { error: `No se encontró un cliente con casillero ${casillero_code}.`, success: null };
  }

  const { error } = await supabase.from("shipments").insert({
    user_id: profile.id,
    description,
    weight_kg,
    volume_m3,
  });

  if (error) return { error: error.message, success: null };

  revalidatePath("/admin/envios");
  return { error: null, success: "Envío creado." };
}

export async function updateShipmentStatus(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const supabase = await createClient();
  const shipment_id = String(formData.get("shipment_id"));
  const status = String(formData.get("status"));
  const note = String(formData.get("note") || "");

  const { error } = await supabase.from("shipments").update({ status }).eq("id", shipment_id);
  if (error) return { error: error.message, success: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("shipment_events").insert({
    shipment_id,
    status,
    note: note || null,
    created_by: user?.id,
  });

  revalidatePath("/admin/envios");
  revalidatePath("/mi-cuenta");
  return { error: null, success: "Estatus actualizado." };
}

export async function setUserRole(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const supabase = await createClient();
  const user_id = String(formData.get("user_id"));
  const role = String(formData.get("role"));

  const { error } = await supabase.from("profiles").update({ role }).eq("id", user_id);
  if (error) return { error: error.message, success: null };

  revalidatePath("/admin/usuarios");
  return { error: null, success: "Rol actualizado." };
}
