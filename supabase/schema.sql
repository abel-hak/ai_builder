-- Run this once in the Supabase SQL editor to provision the portfolio backend.

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null,
  input_text text not null,
  output_text text not null
);

create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_message text not null,
  ai_response text not null
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null
);

create index if not exists generations_type_created_at_idx
  on public.generations (type, created_at desc);

alter table public.generations enable row level security;
alter table public.chat_logs enable row level security;
alter table public.contact_messages enable row level security;

-- Drop any pre-existing policies so re-running this file is safe and so
-- older, more permissive policies cannot linger.
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('generations', 'chat_logs', 'contact_messages')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- Demo history is public by design: anyone can add to it and browse it.
create policy "anon can insert generations"
  on public.generations for insert to anon with check (true);

create policy "anon can read generations"
  on public.generations for select to anon using (true);

-- Chat transcripts are write-only from the browser.
create policy "anon can insert chat logs"
  on public.chat_logs for insert to anon with check (true);

-- Contact messages are write-only from the browser. Read them from the
-- Supabase dashboard, never with the anon key, or visitors could read
-- each other's messages.
create policy "anon can insert contact messages"
  on public.contact_messages for insert to anon with check (true);

-- ---------------------------------------------------------------------------
-- "Ask your docs" (RAG). Embeddings come from the edge runtime's built-in
-- gte-small model, which emits 384-dimensional vectors.
-- ---------------------------------------------------------------------------

create extension if not exists vector with schema extensions;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  chunk_count integer not null default 0,
  char_count integer not null default 0
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector(384) not null
);

create index if not exists document_chunks_document_id_idx
  on public.document_chunks (document_id, chunk_index);

-- HNSW works on empty tables and needs no tuning for demo-sized corpora.
create index if not exists document_chunks_embedding_idx
  on public.document_chunks using hnsw (embedding extensions.vector_cosine_ops);

alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('documents', 'document_chunks')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- The browser only lists documents. Writes and chunk reads go through the
-- `docs` edge function with the service role, which bypasses RLS.
create policy "anon can read documents"
  on public.documents for select to anon using (true);

create or replace function public.match_chunks(
  query_embedding extensions.vector(384),
  match_count integer default 6,
  filter_document uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index integer,
  content text,
  similarity double precision
)
language sql
stable
as $$
  select
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  where filter_document is null or c.document_id = filter_document
  order by c.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

-- Only the service role may run retrieval.
revoke all on function public.match_chunks(extensions.vector, integer, uuid) from public, anon, authenticated;
