-- Agrega "Envío aéreo" como una tarifa más en /admin, pero de uso distinto a
-- las demás: no alimenta ningún cálculo (no hay fórmula de envío aéreo en el
-- sitio). Es solo un precio de referencia que el cliente puede editar desde
-- el panel admin y que se muestra como anotación junto a la calculadora
-- marítima en la landing page ("Envío aéreo: desde $X/kg").
--
-- Queda inactiva por defecto: no aparece en la página pública hasta que el
-- cliente entre a /admin, coloque el precio real y la marque como activa.

insert into public.tariffs (service_key, name, description, unit, price, min_charge, extra, active)
values (
  'envio_aereo',
  'Envío aéreo',
  'Precio referencial por kg, mostrado como anotación junto a la calculadora pública. No alimenta ningún cálculo automático: es solo informativo.',
  'fixed',
  1,
  null,
  '{}'::jsonb,
  false
)
on conflict (service_key) do nothing;
