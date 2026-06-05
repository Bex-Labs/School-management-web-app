begin;

create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.institutions') is null then
    raise exception 'Missing public.institutions. Apply the base SchoolSphere schema first.';
  end if;

  if to_regclass('public.profiles') is null then
    raise exception 'Missing public.profiles. Apply the base SchoolSphere schema first.';
  end if;
end
$$;

create or replace function public.current_user_institution_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select institution_id
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_current_user_admin(target_institution uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and institution_id = target_institution
      and lower(role) in ('administrator', 'admin')
  )
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  period_id text,
  class_id text,
  subject_id text,
  teacher_id text,
  room_id text,
  session_id text,
  term_id text,
  week_type text not null default 'all',
  day_of_week text,
  class_level text,
  subject text,
  teacher text,
  venue text,
  start_time text,
  end_time text,
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

alter table public.timetable_entries add column if not exists period_id text;
alter table public.timetable_entries add column if not exists class_id text;
alter table public.timetable_entries add column if not exists subject_id text;
alter table public.timetable_entries add column if not exists teacher_id text;
alter table public.timetable_entries add column if not exists room_id text;
alter table public.timetable_entries add column if not exists session_id text;
alter table public.timetable_entries add column if not exists term_id text;
alter table public.timetable_entries add column if not exists week_type text not null default 'all';
alter table public.timetable_entries add column if not exists day_of_week text;
alter table public.timetable_entries add column if not exists class_level text;
alter table public.timetable_entries add column if not exists subject text;
alter table public.timetable_entries add column if not exists teacher text;
alter table public.timetable_entries add column if not exists venue text;
alter table public.timetable_entries add column if not exists start_time text;
alter table public.timetable_entries add column if not exists end_time text;
alter table public.timetable_entries add column if not exists status text not null default 'draft';
alter table public.timetable_entries add column if not exists payload jsonb not null default '{}'::jsonb;
alter table public.timetable_entries add column if not exists created_by uuid references auth.users;
alter table public.timetable_entries add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.timetable_entries add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.timetable_periods (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  period_name text not null,
  day_of_week text not null,
  start_time text not null,
  end_time text not null,
  sort_order integer not null default 1,
  status text not null default 'active',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.timetable_rooms (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  name text not null,
  capacity integer,
  status text not null default 'active',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.timetable_substitutions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  entry_record_id text,
  period_id text,
  term_id text,
  class_level text,
  subject text,
  original_teacher_id text,
  original_teacher text,
  replacement_teacher_id text,
  replacement_teacher text,
  reason text,
  substitution_date text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

alter table public.timetable_entries enable row level security;
alter table public.timetable_periods enable row level security;
alter table public.timetable_rooms enable row level security;
alter table public.timetable_substitutions enable row level security;

drop trigger if exists set_timetable_entries_updated_at on public.timetable_entries;
create trigger set_timetable_entries_updated_at
before update on public.timetable_entries
for each row
execute function public.set_updated_at();

drop trigger if exists set_timetable_periods_updated_at on public.timetable_periods;
create trigger set_timetable_periods_updated_at
before update on public.timetable_periods
for each row
execute function public.set_updated_at();

drop trigger if exists set_timetable_rooms_updated_at on public.timetable_rooms;
create trigger set_timetable_rooms_updated_at
before update on public.timetable_rooms
for each row
execute function public.set_updated_at();

drop trigger if exists set_timetable_substitutions_updated_at on public.timetable_substitutions;
create trigger set_timetable_substitutions_updated_at
before update on public.timetable_substitutions
for each row
execute function public.set_updated_at();

drop policy if exists "timetable_select_same_institution" on public.timetable_entries;
create policy "timetable_select_same_institution"
on public.timetable_entries
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "timetable_write_admin" on public.timetable_entries;
create policy "timetable_write_admin"
on public.timetable_entries
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "timetable_periods_select_same_institution" on public.timetable_periods;
create policy "timetable_periods_select_same_institution"
on public.timetable_periods
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "timetable_periods_write_admin" on public.timetable_periods;
create policy "timetable_periods_write_admin"
on public.timetable_periods
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "timetable_rooms_select_same_institution" on public.timetable_rooms;
create policy "timetable_rooms_select_same_institution"
on public.timetable_rooms
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "timetable_rooms_write_admin" on public.timetable_rooms;
create policy "timetable_rooms_write_admin"
on public.timetable_rooms
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "timetable_substitutions_select_same_institution" on public.timetable_substitutions;
create policy "timetable_substitutions_select_same_institution"
on public.timetable_substitutions
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "timetable_substitutions_write_admin" on public.timetable_substitutions;
create policy "timetable_substitutions_write_admin"
on public.timetable_substitutions
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

create index if not exists timetable_entries_conflict_idx
on public.timetable_entries (institution_id, term_id, period_id, week_type);

create index if not exists timetable_entries_teacher_idx
on public.timetable_entries (institution_id, term_id, period_id, teacher_id);

create index if not exists timetable_entries_room_idx
on public.timetable_entries (institution_id, term_id, period_id, room_id);

create index if not exists timetable_entries_class_idx
on public.timetable_entries (institution_id, term_id, period_id, class_id);

create or replace function public.check_timetable_conflicts(
  p_period_id text,
  p_teacher_id text,
  p_room_id text,
  p_class_id text,
  p_term_id text,
  p_exclude_id text default null,
  p_week_type text default 'all'
)
returns table(conflict_type text, conflicting_id text)
language sql
stable
as $$
  select 'teacher'::text, record_id
  from public.timetable_entries
  where institution_id = public.current_user_institution_id()
    and status <> 'archived'
    and period_id = p_period_id
    and teacher_id = p_teacher_id
    and term_id = p_term_id
    and record_id is distinct from p_exclude_id
    and (
      coalesce(nullif(week_type, ''), 'all') = 'all'
      or coalesce(nullif(p_week_type, ''), 'all') = 'all'
      or coalesce(nullif(week_type, ''), 'all') = coalesce(nullif(p_week_type, ''), 'all')
    )
  union all
  select 'room'::text, record_id
  from public.timetable_entries
  where institution_id = public.current_user_institution_id()
    and status <> 'archived'
    and period_id = p_period_id
    and room_id = p_room_id
    and term_id = p_term_id
    and record_id is distinct from p_exclude_id
    and (
      coalesce(nullif(week_type, ''), 'all') = 'all'
      or coalesce(nullif(p_week_type, ''), 'all') = 'all'
      or coalesce(nullif(week_type, ''), 'all') = coalesce(nullif(p_week_type, ''), 'all')
    )
  union all
  select 'class'::text, record_id
  from public.timetable_entries
  where institution_id = public.current_user_institution_id()
    and status <> 'archived'
    and period_id = p_period_id
    and class_id = p_class_id
    and term_id = p_term_id
    and record_id is distinct from p_exclude_id
    and (
      coalesce(nullif(week_type, ''), 'all') = 'all'
      or coalesce(nullif(p_week_type, ''), 'all') = 'all'
      or coalesce(nullif(week_type, ''), 'all') = coalesce(nullif(p_week_type, ''), 'all')
    );
$$;

commit;
