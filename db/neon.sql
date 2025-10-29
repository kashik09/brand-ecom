-- Enable UUIDs
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  subtotal numeric not null,
  shipping_zone text not null,
  shipping_fee numeric not null,
  total numeric not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  notes text
);

-- ORDER ITEMS
create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id text not null,
  title text not null,
  price numeric not null,
  qty int not null,
  type text not null
);

-- SETTINGS: SHIPPING ZONES
create table if not exists public.settings_zones (
  code text primary key,           -- Z1, Z2, Z3, PICKUP
  label text not null,
  fee numeric not null,
  eta text not null,
  updated_at timestamptz default now()
);

-- seed defaults once
insert into public.settings_zones(code,label,fee,eta) values
('Z1','City center',5,'Same day'),
('Z2','Inner suburbs',7,'1 day'),
('Z3','Outer suburbs',10,'1–2 days'),
('PICKUP','Pickup at store',0,'By schedule')
on conflict (code) do nothing;

-- DOWNLOAD TOKENS (for gated files)
create table if not exists public.download_tokens (
  token text primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id text not null,
  file_path text not null,
  expires_at timestamptz not null,
  remaining int not null
);
-- === Performance & safety (orders UNNEST) ===
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON download_tokens(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_download_tokens_token ON download_tokens(token);

-- Ensure numeric precision for UGX
ALTER TABLE orders
  ALTER COLUMN subtotal TYPE numeric(20,0),
  ALTER COLUMN shipping_fee TYPE numeric(20,0),
  ALTER COLUMN total TYPE numeric(20,0);

ALTER TABLE order_items
  ALTER COLUMN price TYPE numeric(20,0);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id text primary key default gen_random_uuid()::text,
  slug text unique not null,
  title text not null,
  description text,
  price numeric(20,0) not null,
  image text,
  type text not null,
  file_path text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
