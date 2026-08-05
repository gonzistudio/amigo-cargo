"use client";

import { useEffect, useState } from "react";
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

export default function Calculator() {
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [region, setRegion] = useState(CAPITAL);
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
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

  // Cálculo en tiempo real: se recalcula automáticamente al cambiar
  // cualquier campo, sin necesidad de un botón de "Calcular".
  useEffect(() => {
    if (!tariff) return;
    const w = parseFloat(weight) || 0;
    if (w <= 0) {
      setResult(null);
      return;
    }
    const l = parseFloat(length) || 0;
    const wd = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const volumeM3 = (l * wd * h) / 1_000_000; // cm -> m3
    const outsideCapital = region !== CAPITAL;
    setResult(estimateFreight(w, volumeM3, tariff, { outsideCapital }));
  }, [tariff, region, weight, length, width, height]);

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

          {!result && (
            <p className="calc-note calc-live-hint">Ingresa el peso real para ver el estimado en tiempo real.</p>
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
