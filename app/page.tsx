import Calculator from "@/components/Calculator";
import { createClient } from "@/lib/supabase/server";
import { buildWhatsappLink } from "@/lib/whatsapp";

const quickQuoteLink = buildWhatsappLink("Hola, quiero cotizar un envío con Amigo Cargo.");
const heroQuoteLink = buildWhatsappLink("Hola Amigo Cargo, quiero solicitar una cotización para importar desde China.");
const advisorLink = buildWhatsappLink("Hola, quiero hablar con un asesor de Amigo Cargo sobre cómo importar desde China.");

const services = [
  ["01", "Envío marítimo", "Coordinamos el traslado de tu carga desde China hasta Venezuela con seguimiento durante el proceso."],
  ["02", "Bodega en China", "Recibimos, identificamos y organizamos tu mercancía antes de su salida internacional."],
  ["03", "Consolidación gratuita", "Agrupamos compras de distintos proveedores en una sola operación, sin costo adicional."],
  ["04", "Entrega en Venezuela", "Acompañamos la operación hasta coordinar la entrega final de tu mercancía."],
];
const process = [
  ["Compra o consulta", "Compra directamente o pídenos apoyo para encontrar el producto o proveedor adecuado."],
  ["Recibe tu casillero", "Te asignamos un número para identificar tu mercancía cuando llegue a nuestra bodega."],
  ["Recibimos y consolidamos", "Validamos la llegada de tus compras y agrupamos tus paquetes antes del envío."],
  ["Enviamos a Venezuela", "Gestionamos el traslado marítimo y te mantenemos informado durante el proceso."],
  ["Coordinamos la entrega", "Tu carga llega a Venezuela y organizamos contigo la entrega final."],
];
const additional = [
  ["Búsqueda de producto", "Localizamos el producto y preparamos una cotización estimada hasta tus manos.", "Desde $25"],
  ["Inspección de muestra", "Recibimos y validamos tu muestra antes de que realices una compra mayor.", "Desde $50"],
  ["Búsqueda de proveedores", "Comparamos fábricas según producto, volumen, calidad y condiciones de compra.", "Desde $300"],
  ["Auditoría de fábrica", "Nuestro personal visita la fábrica, inspecciona su operación y entrega un informe.", "Desde $500"],
  ["Etiquetado", "Apoyamos la identificación y el etiquetado de tu mercancía según tus requerimientos.", "Según requerimiento"],
] as [string, string, string][];

const faqs = [
  [
    "¿Cuánto tiempo tarda un envío de China a Venezuela?",
    "El tiempo estimado ronda los 60 días. Puede variar según la temporada, la naviera y las condiciones operativas del momento.",
  ],
  [
    "¿Hay un monto mínimo de compra para usar el servicio?",
    "No. Puedes enviar desde un solo producto o caja; no exigimos un monto ni volumen mínimo de compra.",
  ],
  [
    "¿El precio de la calculadora es el precio final?",
    "Es una estimación referencial del flete marítimo. No incluye aranceles/aduana ni el envío interno dentro de China, y siempre se confirma contigo por WhatsApp antes de proceder.",
  ],
  [
    "¿Qué pasa si compro en varios proveedores distintos?",
    "Usa el modo \"Varias cajas / proveedores\" de la calculadora para sumar el volumen de todas tus compras. En bodega consolidamos todo en un solo envío, sin costo adicional.",
  ],
  [
    "¿Qué métodos de pago aceptan?",
    "Zelle, efectivo y Pago Móvil.",
  ],
  [
    "¿Entregan fuera de Caracas?",
    "Sí. Coordinamos la entrega en cualquier estado de Venezuela. Los envíos fuera de Distrito Capital tienen un recargo adicional, que la calculadora incluye automáticamente al elegir tu estado.",
  ],
] as [string, string][];

export default async function Home() {
  // "Asistencia de pago" se gestiona 100% desde /admin (porcentaje editable
  // por el cliente); si no existe o está inactiva, no se muestra la tarjeta.
  const supabase = await createClient();
  const { data: paymentAssistance } = await supabase
    .from("tariffs")
    .select("name,description,price,active")
    .eq("service_key", "asistencia_pago")
    .eq("active", true)
    .maybeSingle();

  const additionalItems: [string, string, string][] = paymentAssistance
    ? [
        ...additional.slice(0, 4),
        [
          paymentAssistance.name,
          paymentAssistance.description ?? "",
          `${paymentAssistance.price}% de la transacción`,
        ],
        ...additional.slice(4),
      ]
    : additional;

  return <main>
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Amigo Cargo, inicio"><img src="/logo-amigo-cargo.svg" alt="Amigo Cargo" className="brand-logo" /></a>
      <nav aria-label="Navegación principal"><a href="#servicios">Servicios</a><a href="#calculadora">Calculadora</a><a href="#proceso">Cómo funciona</a><a href="#nosotros">Nosotros</a><a href="#preguntas">Preguntas</a></nav>
      <a className="button button-small" href={quickQuoteLink} target="_blank" rel="noreferrer">Cotizar envío <span>↗</span></a>
    </header>
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow"><span /> Logística China — Venezuela</p>
        <h1>Importa desde China con respaldo en cada paso.</h1>
        <p className="lead">Envíos marítimos, bodega en China y acompañamiento para que compres, verifiques y recibas tu mercancía con mayor tranquilidad.</p>
        <div className="hero-actions"><a className="button" href={heroQuoteLink} target="_blank" rel="noreferrer">Solicitar cotización <span>↗</span></a><a className="text-link" href="#proceso">Conoce el proceso <span>↓</span></a></div>
        <div className="hero-proof"><div><strong>~60 días</strong><span>Tiempo estimado*</span></div><div><strong>0 mínimos</strong><span>Compra sin monto mínimo</span></div><div><strong>Gratis</strong><span>Consolidación de carga</span></div></div>
      </div>
      <div className="hero-visual"><img src="/images/amigo-cargo-hero.png" alt="Contenedores preparados para transporte marítimo internacional" /><div className="route-card"><span className="route-dot" /><div><small>RUTA PRINCIPAL</small><strong>China <b>→</b> Venezuela</strong></div></div></div>
    </section>
    <section className="trust-strip" aria-label="Beneficios principales"><p>Tu carga acompañada de origen a destino.</p><div><span>✓</span> Casillero asignado</div><div><span>✓</span> Control en origen</div><div><span>✓</span> Atención personalizada</div></section>
    <section className="partners-strip" aria-label="Nuestros aliados">
      <p className="partners-title">Nuestros aliados</p>
      <div className="partners-grid">
        <img src="/partners/ups.png" alt="UPS" />
        <img src="/partners/dhl.png" alt="DHL" />
        <img src="/partners/zim.png" alt="ZIM" />
        <img src="/partners/hapag-lloyd.png" alt="Hapag-Lloyd" />
        <img src="/partners/cma-cgm.png" alt="CMA CGM" />
      </div>
    </section>
    <section className="section services" id="servicios">
      <div className="section-heading"><div><p className="eyebrow"><span /> Lo esencial</p><h2>Todo lo que necesitas para traer tu carga.</h2></div><p>Centralizamos las etapas clave de tu importación para darte más orden, control y comunicación.</p></div>
      <div className="service-grid">{services.map(([number,title,content])=><article className="service-card" key={title}><span>{number}</span><h3>{title}</h3><p>{content}</p><a href={buildWhatsappLink(`Hola, quiero más información sobre el servicio de ${title}.`)} target="_blank" rel="noreferrer">Consultar <b>↗</b></a></article>)}</div>
    </section>
    <section className="calculator-section" id="calculadora">
      <div className="calculator-grid">
        <div className="calculator-intro">
          <p className="eyebrow"><span /> Herramienta</p>
          <h2>Calcula tu envío al instante.</h2>
          <p>Ingresa el peso y las medidas del bulto para estimar el costo de tu envío marítimo consolidado.</p>
          <ul className="calculator-facts">
            <li>Necesitas el peso y las tres medidas (largo, ancho, alto) para ver el estimado.</li>
            <li>Peso facturable: el mayor entre el peso real y el volumétrico.</li>
            <li>Incluye el mínimo de cobro y el cargo de manejo, si aplica.</li>
            <li>Estimación referencial, sujeta a confirmación por WhatsApp.</li>
          </ul>
        </div>
        <Calculator />
      </div>
    </section>
    <section className="process-section" id="proceso">
      <div className="process-media"><img src="/images/amigo-cargo-warehouse.png" alt="Equipo revisando y consolidando mercancía en una bodega en China" /><div className="media-label"><strong>Presencia operativa</strong><span>Bodega y equipo en China</span></div></div>
      <div className="process-content"><p className="eyebrow light"><span /> Así funciona</p><h2>De tu compra a tus manos, sin complicaciones.</h2><div className="steps">{process.map(([title,content],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{content}</p></div></article>)}</div><p className="process-note">*El tiempo estimado ronda los 60 días y puede variar según temporada, naviera y condiciones operativas.</p></div>
    </section>
    <section className="section additional" id="nosotros">
      <div className="section-heading"><div><p className="eyebrow"><span /> Más respaldo</p><h2>Servicios para comprar con mayor seguridad.</h2></div><p>Cuando necesitas ir más allá del envío, nuestro equipo en China puede ayudarte a encontrar, comprobar y gestionar.</p></div>
      <div className="additional-grid">{additionalItems.map(([title,content,price])=><article key={title}><div className="card-top"><h3>{title}</h3><span>↗</span></div><p>{content}</p><small>{price}</small></article>)}</div>
    </section>
    <section className="why-section"><div><p className="eyebrow light"><span /> Nuestra diferencia</p><h2>Más que mover mercancía, te ayudamos a importar mejor.</h2></div><ul><li><span>01</span>Acompañamiento antes, durante y después.</li><li><span>02</span>Apoyo para validar proveedores y productos.</li><li><span>03</span>Comunicación clara en cada etapa.</li><li><span>04</span>Pagos por Zelle, efectivo y Pago Móvil.</li></ul></section>
    <section className="section faq" id="preguntas">
      <div className="section-heading"><div><p className="eyebrow"><span /> Dudas comunes</p><h2>Preguntas frecuentes.</h2></div><p>Si no encuentras respuesta a tu duda aquí, escríbenos directamente por WhatsApp.</p></div>
      <div className="faq-list">{faqs.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>
    <section className="final-cta" id="contacto"><p className="eyebrow"><span /> Empieza hoy</p><h2>¿Listo para importar desde China?</h2><p>Cuéntanos qué quieres traer y recibe orientación para dar el siguiente paso.</p><a className="button" href={advisorLink} target="_blank" rel="noreferrer">Hablar con un asesor <span>↗</span></a><small>Respuesta personalizada · Sin compra mínima</small></section>
    <footer><a className="brand" href="#inicio"><img src="/logo-amigo-cargo.svg" alt="Amigo Cargo" className="brand-logo footer-logo" /></a><p>Logística internacional de China a Venezuela.</p><a href="#inicio">Volver arriba ↑</a></footer>
  </main>;
}
