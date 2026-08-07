"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { estimateFreight, formatUSD, type FreightEstimate, type Tariff } from "@/lib/pricing";

const CAPITAL = "Distrito Capital";

const VENEZUELA_STATES = [
  "Distrito Capital",
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Falcón",
  "Guárico",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "La Guaira (Vargas)",
  "Yaracuy",
  "Zulia",
];

type BoxRow = {
  id: string;
  length: string;
  width: string;
  height: string;
  quantity: string;
  weight: string;
};

let boxIdCounter = 0;
function newBoxId() {
  boxIdCounter += 1;
  return `caja-${boxIdCounter}-${Date.now()}`;
}

function emptyBox(): BoxRow {
  return { id: newBoxId(), length: "", width: "", height: "", quantity: "1", weight: "" };
}

function aggregateBoxes(rows: BoxRow[]) {
  let totalUnits = 0;
  let totalVolume = 0;
  let totalWeight = 0;
  for (const box of rows) {
    const quantity = parseFloat(box.quantity) || 0;
    if (quantity <= 0) continue;
    const l = parseFloat(box.length) || 0;
    const w = parseFloat(box.width) || 0;
    const h = parseFloat(box.height) || 0;
    const weight = parseFloat(box.weight) || 0;
    totalVolume += (l * w * h) / 1_000_000 * quantity;
    totalWeight += weight * quantity;
    totalUnits += quantity;
  }
  return { totalUnits, totalVolume, totalWeight };
}

export default function Calculator() {
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [region, setRegion] = useState(CAPITAL);
  const [mode, setMode] = useState<"single" | "multi">("single");

  // Modo "un bulto"
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  // Modo "varias cajas": suma el CBM y el peso de todos los proveedores
  const [boxes, setBoxes] = useState<BoxRow[]>([emptyBox()]);

  const [result, setResult] = useState<FreightEstimate | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("tariffs")
      .select("service_key,name,description,unit,price,min_charge,extra,active")
      .eq("service_key", "envio_maritimo")
      .eq("active", true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setLoadError(true);
        } else {
          setTariff(data as Tariff);
        }
        setLoading(false);
      });
  }, []);

  const boxTotals = useMemo(() => aggregateBoxes(boxes), [boxes]);

  function addBox() {
    setBoxes((prev) => [...prev, emptyBox()]);
  }

  function removeBox(id: string) {
    setBoxes((prev) => (prev.length > 1 ? prev.filter((box) => box.id !== id) : prev));
  }

  function updateBox(id: string, field: keyof Omit<BoxRow, "id">, value: string) {
    setBoxes((prev) => prev.map((box) => (box.id === id ? { ...box, [field]: value } : box)));
  }

  // Cálculo en tiempo real: se recalcula automáticamente al cambiar
  // cualquier campo, sin necesidad de un botón de "Calcular".
  useEffect(() => {
    if (!tariff) return;
    const outsideCapital = region !== CAPITAL;

    if (mode === "multi") {
      const { totalUnits, totalVolume, totalWeight } = boxTotals;
      if (totalUnits <= 0 || (totalVolume <= 0 && totalWeight <= 0)) {
        setResult(null);
        return;
      }
      setResult(estimateFreight(totalWeight, totalVolume, tariff, { outsideCapital }));
      return;
    }

    const w = parseFloat(weight) || 0;
    if (w <= 0) {
      setResult(null);
      return;
    }
    const l = parseFloat(length) || 0;
    const wd = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const volumeM3 = (l * wd * h) / 1_000_000; // cm -> m3
    setResult(estimateFreight(w, volumeM3, tariff, { outsideCapital }));
  }, [tariff, region, weight, length, width, height, mode, boxTotals]);

  const whatsappBase = "https://wa.me/?text=";

  return (
    <div className="calc-card">
      {loading && <div className="calc-card-body"><p className="calc-note">Cargando tarifas…</p></div>}
      {loadError && (
        <div className="calc-card-body">
          <p className="calc-note">
            No pudimos cargar las tarifas en este momento. Escríbenos por WhatsApp para una cotización directa.
          </p>
        </div>
      )}
      {tariff && (
        <div className="calc-card-body">
          <div className="calc-region">
            <label htmlFor="region">Lugar de recepción</label>
            <select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
              {VENEZUELA_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="calc-mode-toggle" role="tablist" aria-label="Modo de cálculo">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "single"}
              className={mode === "single" ? "active" : ""}
              onClick={() => setMode("single")}
            >
              Un solo envío
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "multi"}
              className={mode === "multi" ? "active" : ""}
              onClick={() => setMode("multi")}
            >
              Varias cajas / proveedores
            </button>
          </div>

          {mode === "single" && (
            <>
              <div className="calc-primary-field">
                <label htmlFor="weight">Peso real (kg)</label>
                <input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej: 12.5"
                />
              </div>

              <div className="calc-dims">
                <p className="calc-dims-label">Medidas del bulto (opcional)</p>
                <div className="calc-dims-grid">
                  <div>
                    <label htmlFor="length">Largo (cm)</label>
                    <input id="length" type="number" min="0" step="1" value={length} onChange={(e) => setLength(e.target.value)} placeholder="40" />
                  </div>
                  <div>
                    <label htmlFor="width">Ancho (cm)</label>
                    <input id="width" type="number" min="0" step="1" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="30" />
                  </div>
                  <div>
                    <label htmlFor="height">Alto (cm)</label>
                    <input id="height" type="number" min="0" step="1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="25" />
                  </div>
                </div>
                <p className="calc-note">Mejoran la precisión del estimado. El precio se actualiza al instante.</p>
              </div>
            </>
          )}

          {mode === "multi" && (
            <div className="calc-boxes">
              <p className="calc-dims-label">Cajas de tus proveedores</p>
              {boxes.map((box, index) => (
                <div className="calc-box-row" key={box.id}>
                  <div className="calc-box-row-header">
                    <span>Proveedor {index + 1}</span>
                    {boxes.length > 1 && (
                      <button
                        type="button"
                        className="calc-box-remove"
                        onClick={() => removeBox(box.id)}
                        aria-label={`Quitar proveedor ${index + 1}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="calc-box-grid">
                    <div>
                      <label>Largo (cm)</label>
                      <input type="number" min="0" step="1" value={box.length} onChange={(e) => updateBox(box.id, "length", e.target.value)} placeholder="40" />
                    </div>
                    <div>
                      <label>Ancho (cm)</label>
                      <input type="number" min="0" step="1" value={box.width} onChange={(e) => updateBox(box.id, "width", e.target.value)} placeholder="30" />
                    </div>
                    <div>
                      <label>Alto (cm)</label>
                      <input type="number" min="0" step="1" value={box.height} onChange={(e) => updateBox(box.id, "height", e.target.value)} placeholder="25" />
                    </div>
                    <div>
                      <label>Cajas</label>
                      <input type="number" min="1" step="1" value={box.quantity} onChange={(e) => updateBox(box.id, "quantity", e.target.value)} placeholder="1" />
                    </div>
                    <div>
                      <label>Peso por caja (kg)</label>
                      <input type="number" min="0" step="0.1" value={box.weight} onChange={(e) => updateBox(box.id, "weight", e.target.value)} placeholder="5" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="calc-add-box" onClick={addBox}>
                + Agregar proveedor
              </button>
              <div className="calc-boxes-total">
                <span>{boxTotals.totalUnits} {boxTotals.totalUnits === 1 ? "caja" : "cajas"}</span>
                <span>{boxTotals.totalVolume.toFixed(3)} m³ en total</span>
                <span>{boxTotals.totalWeight.toFixed(2)} kg en total</span>
              </div>
              <p className="calc-note">
                Suma automáticamente el volumen y el peso de todas las cajas para tu estimado, tal como se consolidan en bodega.
              </p>
            </div>
          )}

          {!result && (
            <p className="calc-note calc-live-hint">
              {mode === "multi"
                ? "Agrega al menos una caja con sus medidas y peso para ver el estimado en tiempo real."
                : "Ingresa el peso real para ver el estimado en tiempo real."}
            </p>
          )}

          {result && (
            <div className="result-box">
              {result.physicalCbm > 0 && (
                <div className="result-line">
                  <span>Volumen estimado</span>
                  <span>{result.physicalCbm.toFixed(3)} m³</span>
                </div>
              )}
              {result.minimumApplied && (
                <div className="result-line">
                  <span>Mínimo de cobro aplicado</span>
                  <span>{formatUSD(result.minCharge)}</span>
                </div>
              )}
              {result.outsideCapital && (
                <div className="result-line">
                  <span>Recargo fuera de Distrito Capital ({result.regionalSurchargePercent}%)</span>
                  <span>{formatUSD(result.regionalSurchargeAmount)}</span>
                </div>
              )}
              {result.handlingFee > 0 && (
                <div className="result-line">
                  <span>Cargo de manejo</span>
                  <span>{formatUSD(result.handlingFee)}</span>
                </div>
              )}
              <div className="calc-total-row">
                <span>Estimado total</span>
                <p className="total">{formatUSD(result.total)}</p>
              </div>
              <p className="calc-note">
                Estimación referencial de envío marítimo. No incluye servicios adicionales,
                aranceles/aduana, ni tarifa de envío interno en China. El precio final puede
                variar por temporada, naviera y condiciones operativas.
              </p>
              <a
                className="button"
                style={{ marginTop: 18 }}
                target="_blank"
                rel="noreferrer"
                href={`${whatsappBase}${encodeURIComponent(
                  `Hola Amigo Cargo, hice una estimación en la web hacia ${region}: estimado ${formatUSD(
                    result.total
                  )}. Quiero confirmar mi cotización.`
                )}`}
              >
                Confirmar cotización por WhatsApp <span>↗</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
