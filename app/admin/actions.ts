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

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null, success: "Tarifa actualizada." };
}
