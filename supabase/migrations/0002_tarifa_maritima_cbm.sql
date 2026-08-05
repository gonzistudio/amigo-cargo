-- Migra la tarifa de envío marítimo del modelo anterior (peso + factor
-- volumétrico, estilo carga aérea) a un modelo LCL marítimo real basado
-- en CBM y W/M ("weight or measurement").
--
-- No es destructiva: no borra ni sobrescribe columnas ni claves
-- existentes. Solo agrega las claves nuevas dentro de "extra" (jsonb)
-- junto a las que ya había. La aplicación (lib/pricing.ts) prioriza las
-- claves nuevas si están presentes y cae de vuelta a las anteriores si
-- no lo están, así que esta migración es segura de correr en cualquier
-- momento y también segura de re-ejecutar (es idempotente: si la fila ya
-- tiene "maritime_weight_factor", no la vuelve a tocar, para no pisar un
-- valor que el administrador ya haya editado desde el dashboard).
--
-- Valores nuevos:
--   maritime_weight_factor    -> 1000 (estándar LCL: 1 CBM ~ 1000 kg)
--   fixed_handling_fee        -> toma el valor de "handling_fee" si existía, si no 0
--   outside_capital_surcharge -> toma el valor de "regional_surcharge_percent" si existía, si no 15
--
-- price y min_charge (columnas propias de la tabla) no cambian: siguen
-- siendo la tarifa por CBM y el mínimo de cobro respectivamente, solo se
-- reinterpretan a nivel de aplicación (ya eran genéricas).

update public.tariffs
set extra = extra
  || jsonb_build_object(
       'maritime_weight_factor', 1000,
       'fixed_handling_fee', coalesce((extra->>'handling_fee')::numeric, 0),
       'outside_capital_surcharge', coalesce((extra->>'regional_surcharge_percent')::numeric, 15)
     )
where service_key = 'envio_maritimo'
  and not (extra ? 'maritime_weight_factor');
