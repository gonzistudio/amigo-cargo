-- Agrega el servicio "Asistencia de pago" como una tarifa más, gestionable
-- desde /admin igual que "Gestión de compra" (unit = percent). No toca
-- ninguna fila existente.
insert into public.tariffs (service_key, name, description, unit, price, min_charge, extra, active)
values (
  'asistencia_pago',
  'Asistencia de pago',
  'Te ayudamos a procesar el pago hacia tu proveedor cuando no cuenta con un método accesible desde Venezuela.',
  'percent',
  5,
  null,
  '{}'::jsonb,
  true
)
on conflict (service_key) do nothing;
