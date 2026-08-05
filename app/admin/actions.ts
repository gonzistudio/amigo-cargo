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

  if (unit !== "custom" && (!Number.isFinite(price) || price <= 0)) {
    return { error: "La tarifa debe ser mayor que 0.", success: null };
  }
  if (min_charge !== null && (!Number.isFinite(min_charge) || min_charge < 0)) {
    return { error: "El mínimo de cobro debe ser 0 o mayor.", success: null };
  }

  const updatePayload: {
    price: number;
    min_charge: number | null;
    active: boolean;
    extra?: Record<string, unknown>;
  } = { price, min_charge, active };

  if (unit === "kg") {
    const maritime_weight_factor = parseFloat(String(formData.get("maritime_weight_factor") || "1000"));
    const fixed_handling_fee = parseFloat(String(formData.get("fixed_handling_fee") || "0"));
    const outside_capital_surcharge = parseFloat(String(formData.get("outside_capital_surcharge") || "15"));

    if (!Number.isFinite(maritime_weight_factor) || maritime_weight_factor <= 0) {
      return { error: "El factor marítimo W/M debe ser mayor que 0.", success: null };
    }
    if (!Number.isFinite(fixed_handling_fee) || fixed_handling_fee < 0) {
      return { error: "El cargo de manejo debe ser 0 o mayor.", success: null };
    }
    if (!Number.isFinite(outside_capital_surcharge) || outside_capital_surcharge < 0 || outside_capital_surcharge > 100) {
      return { error: "El recargo fuera de Distrito Capital debe estar entre 0 y 100.", success: null };
    }

    updatePayload.extra = {
      maritime_weight_factor,
      fixed_handling_fee,
      outside_capital_surcharge,
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
