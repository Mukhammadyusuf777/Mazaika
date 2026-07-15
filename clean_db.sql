create table public.users (
  id text primary key not null,
  email text unique not null,
  name text not null,
  password text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.bots (
  id text primary key not null,
  name text not null,
  token text unique not null,
  status text default 'active' not null,
  user_id text not null references public.users (id) on delete cascade on update cascade,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.workflows (
  id text primary key not null,
  name text not null,
  description text,
  is_main boolean default false not null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  bot_id text not null references public.bots (id) on delete cascade on update cascade,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table public.contacts (
  id text primary key not null,
  telegram_id text not null,
  first_name text,
  last_name text,
  username text,
  language_code text,
  state jsonb,
  bot_id text not null references public.bots (id) on delete cascade on update cascade,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(bot_id, telegram_id)
);

create table public.messages (
  id text primary key not null,
  text text,
  direction text not null,
  contact_id text not null references public.contacts (id) on delete cascade on update cascade,
  created_at timestamp with time zone default now() not null
);
