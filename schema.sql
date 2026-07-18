-- ml_connections: uma linha por conta ML conectada.
-- Hoje você usa 1 linha (a sua). Se um dia virar multi-tenant,
-- é só adicionar a coluna user_id com FK pra auth.users e uma
-- policy de RLS filtrando por ela — o resto do schema não muda.
create table if not exists ml_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- null por enquanto; usado quando virar multi-tenant
  ml_user_id bigint not null unique,
  ml_nickname text,
  client_id text not null,
  client_secret text not null,
  refresh_token text not null,
  access_token text,
  token_expires_at timestamptz,
  feed_url text, -- URL pública do feed.csv depois do primeiro upload
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references ml_connections(id) on delete cascade,
  status text not null check (status in ('success', 'error')),
  products_count int,
  feed_url text,
  error_message text,
  ran_at timestamptz not null default now()
);

create index if not exists idx_sync_logs_connection on sync_logs(connection_id, ran_at desc);
