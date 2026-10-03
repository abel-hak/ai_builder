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
