-- "Asistencia de pago" queda como el servicio real de cara al cliente:
-- el cliente le paga directamente a Amigo Cargo y la empresa se encarga
-- de todo (comprar, recibir en bodega, consolidar y enviar a Venezuela).
-- "Gestión de compra" quedaba muy parecida y generaba confusión, así que
-- se retira de cara al público.
--
-- No es destructivo:
--  - "asistencia_pago" se crea si no existe, o se actualiza su
--    descripción si ya existía (por si la migración 0003 ya se había
--    corrido con el texto anterior).
--  - "gestion_compra" NO se borra, solo se marca inactiva (active=false),
--    así que sigue en la base de datos y se puede reactivar desde /admin
--    en cualquier momento si hiciera falta.

insert into public.tariffs (service_key, name, description, unit, price, min_charge, extra, active)
values (
  'asistencia_pago',
  'Asistencia de pago',
  'Pagas directamente a Amigo Cargo y nosotros nos encargamos de todo: comprar, recibir en bodega en China, consolidar y enviar a Venezuela.',
  'percent',
  5,
  null,
  '{}'::jsonb,
  true
)
on conflict (service_key) do update
set description = excluded.description;

update public.tariffs
set active = false
where service_key = 'gestion_compra';
