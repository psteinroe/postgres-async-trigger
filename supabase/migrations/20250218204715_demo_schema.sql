create table if not exists public.contact (
  id uuid not null default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null
);
