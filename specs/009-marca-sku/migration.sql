-- Marca y SKU explícitos para el schema Product (Supabase → SQL Editor).
-- Idempotente: se puede ejecutar más de una vez sin duplicar ni pisar datos
-- ya cargados desde el panel.

alter table public.products
  add column if not exists brand text,
  add column if not exists sku text;

-- Carga inicial de marca con la misma regla que src/lib/seo.js
-- (productBrand): marca conocida en título/modelo, o código propio FLC-…
update public.products
set brand = case
  when title || ' ' || coalesce(model, '') ~* '\msonoff\M'    then 'Sonoff'
  when title || ' ' || coalesce(model, '') ~* '\mgirier\M'    then 'Girier'
  when title || ' ' || coalesce(model, '') ~* '\mtuya\M'      then 'Tuya'
  when title || ' ' || coalesce(model, '') ~* '\mmoes\M'      then 'Moes'
  when title || ' ' || coalesce(model, '') ~* '\maqara\M'     then 'Aqara'
  when title || ' ' || coalesce(model, '') ~* '\mxiaomi\M'    then 'Xiaomi'
  when title || ' ' || coalesce(model, '') ~* '\mshelly\M'    then 'Shelly'
  when title || ' ' || coalesce(model, '') ~* '\mbroadlink\M' then 'Broadlink'
  when coalesce(model, '') ~* '^FLC-|falcons'                 then 'Falcons'
end
where brand is null;

-- Carga inicial de SKU (misma regla que productSku): el "modelo" solo se
-- copia si parece un código (≤30 caracteres, ≤4 palabras, con un dígito o
-- del tipo FLC-XXX-…), no una marca suelta ni una oración.
update public.products
set sku = trim(model)
where sku is null
  and model is not null
  and length(trim(model)) between 1 and 30
  and array_length(regexp_split_to_array(trim(model), '\s+'), 1) <= 4
  and (trim(model) ~ '\d' or trim(model) ~ '^[A-Z0-9]+(-[A-Z0-9]+)+$');

-- Revisión: los que quedan sin marca se completan a mano desde el panel.
select id, title, model, brand, sku
from public.products
order by brand nulls first, id;
