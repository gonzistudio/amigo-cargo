"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { estimateFreight, formatUSD, type FreightEstimate, type Tariff } from "@/lib/pricing";

export default function Calculator() {
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tariff) return;
    const w = parseFloat(weight) || 0;
    const l = parseFloat(length) || 0;
    const wd = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const volumeM3 = (l * wd * h) / 1_000_000; // cm -> m3
    setResult(estimateFreight(w, volumeM3, tariff));
  }

  const whatsappBase = "https://wa.me/?text=";

  return (
    <div className="card">
      {loading && <p className="app-lead">Cargando tarifas…</p>}
      {loadError && (
        <p className="error-text">
          No pudimos cargar las tarifas en este momento. Escríbenos por WhatsApp para una cotización directa.
        </p>
      )}
      {tariff && (
        <>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-field">
              <label htmlFor="weight">Peso real (kg)</label>
              <input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: 12.5"
              />
            </div>
            <div />
            <div className="form-field">
              <label htmlFor="length">Largo (cm)</label>
              <input id="length" type="number" min="0" step="1" value={length} onChange={(e) => setLength(e.target.value)} placeholder="Ej: 40" />
            </div>
            <div className="form-field">
              <label htmlFor="width">Ancho (cm)</label>
              <input id="width" type="number" min="0" step="1" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Ej: 30" />
            </div>
            <div className="form-field">
              <label htmlFor="height">Alto (cm)</label>
              <input id="height" type="number" min="0" step="1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ej: 25" />
              <small>Las dimensiones son opcionales, pero mejoran la precisión del estimado.</small>
            </div>
            <div />
            <div>
              <button className="btn" type="submit">Calcular estimado</button>
            </div>
          </form>

          {result && (
            <div className="result-box">
              <div className="result-line">
                <span>Peso real</span>
                <span>{result.actualWeightKg.toFixed(2)} kg</span>
              </div>
              <div className="result-line">
                <span>Peso volumétrico</span>
                <span>{result.volumetricWeightKg.toFixed(2)} kg</span>
              </div>
              <div className="result-line">
                <span>Peso facturable (mayor de los dos)</span>
                <span>{result.chargeableWeightKg.toFixed(2)} kg</span>
              </div>
              <div className="result-line">
                <span>Tarifa por kg</span>
                <span>{formatUSD(result.ratePerKg)}</span>
              </div>
              <div className="result-line">
                <span>Mínimo de cobro</span>
                <span>{formatUSD(result.minCharge)}</span>
              </div>
              <div className="result-line">
                <span>Flete (subtotal)</span>
                <span>{formatUSD(result.subtotal)}</span>
              </div>
              {result.handlingFee > 0 && (
                <div className="result-line">
                  <span>Cargo de manejo</span>
                  <span>{formatUSD(result.handlingFee)}</span>
                </div>
              )}
              <p className="total" style={{ marginTop: 16 }}>{formatUSD(result.total)}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                Estimación referencial de envío marítimo. No incluye servicios adicionales,
                aranceles/aduana, ni tarifa de envío interno en China. El precio final puede
                variar por temporada, naviera y condiciones operativas.
              </p>
              <a
                className="btn"
                style={{ marginTop: 18 }}
                target="_blank"
                rel="noreferrer"
                href={`${whatsappBase}${encodeURIComponent(
                  `Hola Amigo Cargo, hice una estimación en la web: ${result.chargeableWeightKg.toFixed(
                    2
                  )} kg facturables, estimado ${formatUSD(result.total)}. Quiero confirmar mi cotización.`
                )}`}
              >
                Confirmar cotización por WhatsApp ↗
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
