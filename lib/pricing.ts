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
  /** Volumen físico del bulto (L×A×A cm × cantidad, en m³ / CBM). */
  physicalCbm: number;
  /** Volumen equivalente al comparar el peso contra el factor marítimo (uso interno, no se muestra al público). */
  weightBasedCbm: number;
  /** CBM facturable: el mayor entre el físico y el equivalente por peso. */
  chargeableCbm: number;
  ratePerCbm: number;
  minCharge: number;
  /** true si el mínimo de cobro terminó determinando el subtotal. */
  minimumApplied: boolean;
  handlingFee: number;
  /** CBM facturable × tarifa por CBM, antes de mínimo/manejo/recargo. */
  freight: number;
  /** Subtotal ya con mínimo de cobro y cargo de manejo aplicados (antes del recargo regional). */
  subtotalWithHandling: number;
  regionalSurchargePercent: number;
  regionalSurchargeAmount: number;
  outsideCapital: boolean;
  total: number;
};

/**
 * Metodología de cálculo LCL marítimo (carga consolidada), basada en CBM
 * y W/M ("weight or measurement" — se cobra por lo que sea mayor entre
 * volumen y el equivalente en volumen del peso):
 *
 * 1. CBM físico = (Largo × Ancho × Alto en cm × cantidad de bultos) / 1,000,000
 * 2. CBM por peso = peso total (kg) / factor marítimo W/M
 * 3. CBM facturable = el mayor entre el CBM físico y el CBM por peso
 * 4. Subtotal (flete) = CBM facturable × tarifa por CBM
 * 5. Se aplica el mínimo de cobro si el flete queda por debajo
 * 6. Se suma el cargo de manejo fijo (si aplica)
 * 7. Si el destino no es Distrito Capital, se suma el recargo regional
 *    (porcentaje configurable) calculado sobre el subtotal ya con manejo
 * 8. Total = subtotal con manejo + recargo regional (si aplica)
 *
 * Todos los parámetros (tarifa por CBM, factor marítimo, mínimo, cargo de
 * manejo, recargo regional) son editables desde /admin — no son valores
 * fijos en el código. Es una ESTIMACIÓN referencial: la tarifa final puede
 * variar por temporada, naviera y condiciones operativas.
 *
 * Compatibilidad: si una tarifa todavía no fue editada desde el nuevo
 * formulario, se leen los nombres anteriores (volumetric_factor_kg_per_m3,
 * handling_fee, regional_surcharge_percent) como respaldo.
 */
export function estimateFreight(
  weightKg: number,
  volumeM3: number,
  tariff: Tariff,
  options: { outsideCapital?: boolean; quantity?: number } = {}
): FreightEstimate {
  const quantity = options.quantity && options.quantity > 0 ? options.quantity : 1;
  const outsideCapital = options.outsideCapital ?? false;

  const ratePerCbm = Number(tariff.price ?? 0);
  const minCharge = Number(tariff.min_charge ?? 0);
  const maritimeWeightFactor = Number(
    tariff.extra?.maritime_weight_factor ?? tariff.extra?.volumetric_factor_kg_per_m3 ?? 1000
  );
  const handlingFee = Number(tariff.extra?.fixed_handling_fee ?? tariff.extra?.handling_fee ?? 0);
  const regionalSurchargePercent = Number(
    tariff.extra?.outside_capital_surcharge ?? tariff.extra?.regional_surcharge_percent ?? 15
  );

  const physicalCbm = volumeM3 * quantity;
  const weightBasedCbm = maritimeWeightFactor > 0 ? weightKg / maritimeWeightFactor : 0;
  const chargeableCbm = Math.max(physicalCbm, weightBasedCbm, 0);

  const freight = chargeableCbm * ratePerCbm;
  const minimumApplied = minCharge > 0 && freight < minCharge;
  const subtotalWithMinimum = minCharge > 0 ? Math.max(freight, minCharge) : freight;
  const subtotalWithHandling = subtotalWithMinimum + handlingFee;
  const regionalSurchargeAmount = outsideCapital
    ? subtotalWithHandling * (regionalSurchargePercent / 100)
    : 0;
  const total = subtotalWithHandling + regionalSurchargeAmount;

  return {
    physicalCbm,
    weightBasedCbm,
    chargeableCbm,
    ratePerCbm,
    minCharge,
    minimumApplied,
    handlingFee,
    freight,
    subtotalWithHandling,
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
