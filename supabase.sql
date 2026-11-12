-- Im Supabase-Dashboard: SQL Editor -> New query -> einfügen -> Run
create table if not exists public.reminders (
  endpoint    text primary key,
  subscription jsonb not null,
  time        text not null,          -- "HH:MM"
  tz          text not null,          -- z. B. "Europe/Berlin"
  last_sent   date,
  created_at  timestamptz default now()
);

-- Niemand von außen darf die Tabelle lesen oder schreiben.
-- Nur unser Server (mit dem Service-Role-Key) kommt dran.
alter table public.reminders enable row level security;
