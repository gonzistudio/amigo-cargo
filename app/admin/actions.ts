"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdminState = { error: string | null; success: string | null };

export async function updateTariff(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const supabase = await createClient();
  const service_key = String(formData.get("service_key"));
  const unit = String(formData.get("unit"));
  const price = parseFloat(String(formData.get("price") || "0"));
  const min_charge_raw = String(formData.get("min_charge") || "");
  const min_charge = min_charge_raw === "" ? null : parseFloat(min_charge_raw);
  const active = formData.get("active") === "on";

  const updatePayload: {
    price: number;
    min_charge: number | null;
    active: boolean;
    extra?: Record<string, unknown>;
  } = { price, min_charge, active };

  if (unit === "kg") {
    const volumetric_factor = parseFloat(String(formData.get("volumetric_factor") || "167")) || 167;
    const handling_fee = parseFloat(String(formData.get("handling_fee") || "0")) || 0;
    updatePayload.extra = {
      volumetric_factor_kg_per_m3: volumetric_factor,
      handling_fee,
    };
  } else if (unit === "custom") {
    const nota = String(formData.get("custom_note") || "").trim();
    updatePayload.extra = { nota };
  }

  const { error } = await supabase
    .from("tariffs")
    .update(updatePayload)
    .eq("service_key", service_key);

  if (error) return { error: error.message, success: null };

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null, success: "Tarifa actualizada." };
}
