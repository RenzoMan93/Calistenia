-- Pizarra pública de sugerencias: cualquier usuario logueado puede escribir
-- una sugerencia con una calificación de 1 a 5 estrellas, y todos los
-- usuarios ven las sugerencias de los demás con su nombre (tipo reseñas).
-- Corré esto en el SQL Editor de Supabase después de las migraciones anteriores.

create table if not exists public.sugerencias (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  nombre     text not null,
  estrellas  int not null check (estrellas between 1 and 5),
  texto      text not null check (char_length(trim(texto)) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.sugerencias enable row level security;

create policy "sugerencias: cualquiera logueado puede leer" on public.sugerencias
  for select using (auth.uid() is not null);
create policy "sugerencias: cada usuario postea las suyas" on public.sugerencias
  for insert with check (auth.uid() = user_id);
create policy "sugerencias: cada usuario borra las suyas" on public.sugerencias
  for delete using (auth.uid() = user_id);
