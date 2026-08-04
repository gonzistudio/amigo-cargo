export type Tariff = {
  service_key: string;
  name: string;
  description: string | null;
  unit: "kg" | "fixed" | "percent" | "custom";
  price: number;
  min_charge: number | null;
  extra: Record<string, unknown>;
  active: boolean;
};

export type FreightEstimate = {
  actualWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  ratePerKg: number;
  minCharge: number;
  subtotal: number;
  total: number;
};

/**
 * Estima el costo de envío marítimo consolidado.
 * Peso facturable = mayor entre el peso real y el peso volumétrico
 * (volumen en m3 * factor volumétrico, configurable desde /admin/tarifas).
 * Es una ESTIMACIÓN referencial: la tarifa final puede variar por
 * temporada, naviera y condiciones operativas (ver nota del brochure).
 */
export function estimateFreight(
  weightKg: number,
  volumeM3: number,
  tariff: Tariff
): FreightEstimate {
  const volumetricFactor = Number(tariff.extra?.volumetric_factor_kg_per_m3 ?? 167);
  const volumetricWeightKg = volumeM3 * volumetricFactor;
  const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg, 0);
  const ratePerKg = tariff.price;
  const minCharge = tariff.min_charge ?? 0;
  const subtotal = chargeableWeightKg * ratePerKg;
  const total = Math.max(subtotal, minCharge);

  return {
    actualWeightKg: weightKg,
    volumetricWeightKg,
    chargeableWeightKg,
    ratePerKg,
    minCharge,
    subtotal,
    total,
  };
}

export function formatUSD(value: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export const STATUS_LABELS: Record<string, string> = {
  compra_confirmada: "Compra confirmada",
  casillero_asignado: "Casillero asignado",
  recibido_bodega: "Recibido en bodega (China)",
  consolidado: "Consolidado",
  en_transito_maritimo: "En tránsito marítimo",
  en_aduana_venezuela: "En aduana (Venezuela)",
  listo_para_entrega: "Listo para entrega",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const STATUS_ORDER = [
  "compra_confirmada",
  "casillero_asignado",
  "recibido_bodega",
  "consolidado",
  "en_transito_maritimo",
  "en_aduana_venezuela",
  "listo_para_entrega",
  "entregado",
];
