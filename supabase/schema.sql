create extension if not exists pgcrypto;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  address text,
  academic_year_start date,
  academic_year_end date,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  institution_id uuid references public.institutions on delete set null,
  display_name text,
  email text not null,
  role text not null default 'Administrator',
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feature_modules (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  module_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, module_key)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  name text not null,
  level text not null,
  capacity integer not null check (capacity > 0),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid references auth.users not null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, level, name)
);

alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.feature_modules enable row level security;
alter table public.classes enable row level security;

create or replace function public.current_user_institution_id()
returns uuid
language sql
stable
as $$
  select institution_id
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_current_user_admin(target_institution uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and institution_id = target_institution
      and lower(role) = 'administrator'
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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    email,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'Administrator')
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        email = excluded.email,
        role = excluded.role,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists set_institutions_updated_at on public.institutions;
create trigger set_institutions_updated_at
before update on public.institutions
for each row
execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_feature_modules_updated_at on public.feature_modules;
create trigger set_feature_modules_updated_at
before update on public.feature_modules
for each row
execute function public.set_updated_at();

drop trigger if exists set_classes_updated_at on public.classes;
create trigger set_classes_updated_at
before update on public.classes
for each row
execute function public.set_updated_at();

drop policy if exists "profiles_select_own_or_same_institution" on public.profiles;
create policy "profiles_select_own_or_same_institution"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or institution_id = public.current_user_institution_id()
);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "institutions_select_same_institution" on public.institutions;
create policy "institutions_select_same_institution"
on public.institutions
for select
to authenticated
using (
  id = public.current_user_institution_id()
);

drop policy if exists "institutions_insert_authenticated" on public.institutions;
create policy "institutions_insert_authenticated"
on public.institutions
for insert
to authenticated
with check (
  created_by = auth.uid()
);

drop policy if exists "institutions_update_admin" on public.institutions;
create policy "institutions_update_admin"
on public.institutions
for update
to authenticated
using (public.is_current_user_admin(id))
with check (public.is_current_user_admin(id));

drop policy if exists "feature_modules_select_same_institution" on public.feature_modules;
create policy "feature_modules_select_same_institution"
on public.feature_modules
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "feature_modules_write_admin" on public.feature_modules;
create policy "feature_modules_write_admin"
on public.feature_modules
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "classes_select_same_institution" on public.classes;
create policy "classes_select_same_institution"
on public.classes
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "classes_write_admin" on public.classes;
create policy "classes_write_admin"
on public.classes
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

insert into public.feature_modules (institution_id, module_key, enabled)
select
  i.id,
  module_key,
  true
from public.institutions i
cross join (
  values
    ('student-management'),
    ('employee-management'),
    ('parent-portal'),
    ('admissions-management'),
    ('attendance-management'),
    ('lms'),
    ('fees-bursary'),
    ('exams-results'),
    ('timetable-scheduling'),
    ('finance-reporting')
) as defaults(module_key)
where not exists (
  select 1
  from public.feature_modules fm
  where fm.institution_id = i.id
    and fm.module_key = defaults.module_key
);
