import { createClient } from "@/lib/supabase/server";
import type { Tariff } from "@/lib/pricing";
import TariffRow from "./TariffRow";

export default async function TarifasPage() {
  const supabase = await createClient();
  const { data: tariffs } = await supabase
    .from("tariffs")
    .select("service_key,name,description,unit,price,min_charge,extra,active")
    .order("service_key");

  return (
    <div>
      <p className="app-lead">
        Estos valores alimentan la calculadora pública y las cotizaciones de servicios
        adicionales. El envío marítimo usa peso facturable (mayor entre peso real y
        volumétrico, factor configurable en Supabase → tabla <code>tariffs</code>, columna <code>extra</code>).
      </p>
      {(tariffs as Tariff[] | null)?.map((t) => (
        <TariffRow tariff={t} key={t.service_key} />
      ))}
    </div>
  );
}
