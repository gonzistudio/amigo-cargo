import { createClient } from "@/lib/supabase/server";
import type { Tariff } from "@/lib/pricing";
import TariffRow from "@/components/TariffRow";

export default async function AdminTarifasPage() {
  const supabase = await createClient();
  const { data: tariffs } = await supabase
    .from("tariffs")
    .select("service_key,name,description,unit,price,min_charge,extra,active")
    .order("service_key");

  return (
    <div>
      <p className="app-lead">
        Estos valores alimentan la calculadora pública de la landing page y las
        cotizaciones de servicios adicionales. Para el envío marítimo puedes
        ajustar cada parámetro de la fórmula (tarifa, factor volumétrico,
        mínimo de cobro y cargo de manejo), no solo el precio — la
        metodología de cálculo se explica en cada tarjeta.
      </p>
      {(tariffs as Tariff[] | null)?.map((t) => (
        <TariffRow tariff={t} key={t.service_key} />
      ))}
    </div>
  );
}
