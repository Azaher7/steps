-- Stride local-first sync schema. Run with `supabase db push`.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.walk_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  distance_meters double precision not null check (distance_meters >= 0),
  steps integer not null default 0 check (steps >= 0),
  route jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(route) = 'array')
);
create table public.daily_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  steps integer not null default 0 check (steps >= 0),
  distance_meters double precision not null default 0 check (distance_meters >= 0),
  active_minutes integer not null default 0 check (active_minutes >= 0),
  calories integer not null default 0 check (calories >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, activity_date)
);
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  step_goal integer not null default 10000 check (step_goal between 1000 and 50000),
  units text not null default 'metric' check (units in ('metric','imperial')),
  theme text not null default 'system' check (theme in ('system','light','dark')),
  updated_at timestamptz not null default now()
);
create index walk_sessions_user_started_idx on public.walk_sessions(user_id, started_at desc);
create index daily_activity_user_date_idx on public.daily_activity(user_id, activity_date desc);

alter table public.profiles enable row level security;
alter table public.walk_sessions enable row level security;
alter table public.daily_activity enable row level security;
alter table public.user_preferences enable row level security;

create policy "owners manage profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "owners manage walks" on public.walk_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners manage activity" on public.daily_activity for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners manage preferences" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id) values (new.id); insert into public.user_preferences(user_id) values (new.id); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Deliberately callable only by the authenticated user. Cascades remove every user-owned row.
create or replace function public.delete_own_account() returns void language plpgsql security definer set search_path = public as $$
begin if auth.uid() is null then raise exception 'Not authenticated'; end if; delete from auth.users where id = auth.uid(); end;
$$;
revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
