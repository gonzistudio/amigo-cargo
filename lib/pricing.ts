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
  handlingFee: number;
  freight: number;
  subtotal: number;
  regionalSurchargePercent: number;
  regionalSurchargeAmount: number;
  outsideCapital: boolean;
  total: number;
};

/**
 * Metodología estándar de cálculo de flete marítimo consolidado:
 *
 * 1. Peso volumétrico (kg) = (Largo × Ancho × Alto en cm) / 1,000,000 × factor volumétrico
 * 2. Peso facturable (kg) = mayor entre peso real y peso volumétrico
 * 3. Flete = peso facturable × tarifa por kg
 * 4. Subtotal = mayor entre el flete y el mínimo de cobro
 * 5. Si el destino no es Distrito Capital, se suma el recargo regional
 *    (porcentaje configurable) calculado sobre el subtotal
 * 6. Total = subtotal + recargo regional (si aplica) + cargo de manejo fijo (si aplica)
 *
 * Todos los parámetros (tarifa/kg, factor volumétrico, mínimo, cargo de
 * manejo, recargo regional) son editables desde /admin — no son valores
 * fijos en el código. Es una ESTIMACIÓN referencial: la tarifa final puede
 * variar por temporada, naviera y condiciones operativas.
 */
export function estimateFreight(
  weightKg: number,
  volumeM3: number,
  tariff: Tariff,
  options: { outsideCapital?: boolean } = {}
): FreightEstimate {
  const volumetricFactor = Number(tariff.extra?.volumetric_factor_kg_per_m3 ?? 167);
  const handlingFee = Number(tariff.extra?.handling_fee ?? 0);
  const regionalSurchargePercent = Number(tariff.extra?.regional_surcharge_percent ?? 15);
  const outsideCapital = options.outsideCapital ?? false;

  const volumetricWeightKg = volumeM3 * volumetricFactor;
  const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg, 0);
  const ratePerKg = tariff.price;
  const minCharge = tariff.min_charge ?? 0;
  const freight = chargeableWeightKg * ratePerKg;
  const subtotal = Math.max(freight, minCharge);
  const regionalSurchargeAmount = outsideCapital ? subtotal * (regionalSurchargePercent / 100) : 0;
  const total = subtotal + regionalSurchargeAmount + handlingFee;

  return {
    actualWeightKg: weightKg,
    volumetricWeightKg,
    chargeableWeightKg,
    ratePerKg,
    minCharge,
    handlingFee,
    freight,
    subtotal,
    regionalSurchargePercent,
    regionalSurchargeAmount,
    outsideCapital,
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
