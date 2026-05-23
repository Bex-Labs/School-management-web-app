create extension if not exists pgcrypto;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  school_profile text,
  address text,
  campus_details text,
  phone text,
  website text,
  has_nursery boolean not null default false,
  has_higher_institution boolean not null default false,
  academic_year_start date,
  academic_year_end date,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.institutions add column if not exists logo_url text;
alter table public.institutions add column if not exists school_profile text;
alter table public.institutions add column if not exists address text;
alter table public.institutions add column if not exists campus_details text;
alter table public.institutions add column if not exists phone text;
alter table public.institutions add column if not exists website text;
alter table public.institutions add column if not exists has_nursery boolean not null default false;
alter table public.institutions add column if not exists has_higher_institution boolean not null default false;
alter table public.institutions add column if not exists academic_year_start date;
alter table public.institutions add column if not exists academic_year_end date;

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

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  role_key text not null,
  permission_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, role_key, permission_key)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text,
  name text not null,
  level text not null,
  capacity integer not null check (capacity > 0),
  class_teacher text,
  arms text[] not null default '{}',
  subjects text[] not null default '{}',
  teacher_assignments jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid references auth.users not null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, level, name)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  name text not null,
  code text,
  description text,
  level text,
  teacher_assignments jsonb not null default '[]'::jsonb,
  student_assignments jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  first_name text,
  last_name text,
  full_name text not null,
  admission_no text,
  level text,
  date_of_birth text,
  gender text,
  guardians jsonb not null default '[]'::jsonb,
  progression_history jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived', 'transferred')),
  promotion_decision text,
  exam_outcome text,
  last_promotion_session_id text,
  last_promotion_outcome text,
  transfer_reason text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  archived_at timestamptz,
  transferred_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.admissions_applications (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  full_name text not null,
  level text not null,
  status text not null default 'pending',
  guardian_name text,
  guardian_email text,
  application_stage text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  title text not null,
  message text,
  entity_type text,
  entity_id text,
  action text,
  actor_name text,
  visible_to_roles text[] not null default '{Admin}',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.academic_calendar_events (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  event_name text not null,
  event_type text not null default 'term',
  start_date text,
  end_date text,
  status text not null default 'active',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
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

create table if not exists public.fee_items (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  name text not null,
  description text,
  amount numeric(14,2) not null default 0,
  class_level text,
  session_id text,
  term_id text,
  due_date text,
  status text not null default 'active' check (status in ('active', 'archived')),
  archived_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.academic_cycles_state (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null default 'default',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.admission_config_state (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null default 'default',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.parent_fee_records (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null default 'default',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id)
);

create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  email text not null,
  normalized_email text not null,
  role_key text not null default 'Admin',
  auth_method text not null default 'any',
  status text not null default 'active',
  workspace_id text not null,
  claimed_at timestamptz,
  claimed_by_user_id text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id),
  unique (institution_id, normalized_email, role_key)
);

create table if not exists public.workspace_states (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  state_key text not null,
  payload jsonb not null default '{}'::jsonb,
  source text not null default 'web-client',
  migrated_by uuid references auth.users,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, state_key)
);

create table if not exists public.workspace_migration_runs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  triggered_by uuid references auth.users not null,
  source text not null default 'web-client',
  migrated_keys text[] not null default '{}',
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.classes add column if not exists class_teacher text;
alter table public.classes add column if not exists arms text[] not null default '{}';
alter table public.classes add column if not exists subjects text[] not null default '{}';
alter table public.classes add column if not exists teacher_assignments jsonb not null default '[]'::jsonb;
alter table public.classes add column if not exists record_id text;
update public.classes
set record_id = coalesce(nullif(record_id, ''), id::text)
where record_id is null or record_id = '';
alter table public.classes alter column record_id set not null;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'classes_institution_record_id_unique'
  ) then
    alter table public.classes
      add constraint classes_institution_record_id_unique unique (institution_id, record_id);
  end if;
end
$$;

alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.feature_modules enable row level security;
alter table public.role_permissions enable row level security;
alter table public.classes enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.admissions_applications enable row level security;
alter table public.notifications_log enable row level security;
alter table public.academic_calendar_events enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.fee_items enable row level security;
alter table public.academic_cycles_state enable row level security;
alter table public.admission_config_state enable row level security;
alter table public.parent_fee_records enable row level security;
alter table public.access_grants enable row level security;
alter table public.workspace_states enable row level security;
alter table public.workspace_migration_runs enable row level security;

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

drop trigger if exists set_role_permissions_updated_at on public.role_permissions;
create trigger set_role_permissions_updated_at
before update on public.role_permissions
for each row
execute function public.set_updated_at();

drop trigger if exists set_classes_updated_at on public.classes;
create trigger set_classes_updated_at
before update on public.classes
for each row
execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

drop trigger if exists set_admissions_applications_updated_at on public.admissions_applications;
create trigger set_admissions_applications_updated_at
before update on public.admissions_applications
for each row
execute function public.set_updated_at();

drop trigger if exists set_notifications_log_updated_at on public.notifications_log;
create trigger set_notifications_log_updated_at
before update on public.notifications_log
for each row
execute function public.set_updated_at();

drop trigger if exists set_academic_calendar_events_updated_at on public.academic_calendar_events;
create trigger set_academic_calendar_events_updated_at
before update on public.academic_calendar_events
for each row
execute function public.set_updated_at();

drop trigger if exists set_timetable_entries_updated_at on public.timetable_entries;
create trigger set_timetable_entries_updated_at
before update on public.timetable_entries
for each row
execute function public.set_updated_at();

drop trigger if exists set_fee_items_updated_at on public.fee_items;
create trigger set_fee_items_updated_at
before update on public.fee_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_academic_cycles_state_updated_at on public.academic_cycles_state;
create trigger set_academic_cycles_state_updated_at
before update on public.academic_cycles_state
for each row
execute function public.set_updated_at();

drop trigger if exists set_admission_config_state_updated_at on public.admission_config_state;
create trigger set_admission_config_state_updated_at
before update on public.admission_config_state
for each row
execute function public.set_updated_at();

drop trigger if exists set_parent_fee_records_updated_at on public.parent_fee_records;
create trigger set_parent_fee_records_updated_at
before update on public.parent_fee_records
for each row
execute function public.set_updated_at();

drop trigger if exists set_access_grants_updated_at on public.access_grants;
create trigger set_access_grants_updated_at
before update on public.access_grants
for each row
execute function public.set_updated_at();

drop trigger if exists set_workspace_states_updated_at on public.workspace_states;
create trigger set_workspace_states_updated_at
before update on public.workspace_states
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

drop policy if exists "role_permissions_select_same_institution" on public.role_permissions;
create policy "role_permissions_select_same_institution"
on public.role_permissions
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "role_permissions_write_admin" on public.role_permissions;
create policy "role_permissions_write_admin"
on public.role_permissions
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

drop policy if exists "courses_select_same_institution" on public.courses;
create policy "courses_select_same_institution"
on public.courses
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "courses_write_admin" on public.courses;
create policy "courses_write_admin"
on public.courses
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "students_select_same_institution" on public.students;
create policy "students_select_same_institution"
on public.students
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "students_write_admin" on public.students;
create policy "students_write_admin"
on public.students
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "admissions_select_same_institution" on public.admissions_applications;
create policy "admissions_select_same_institution"
on public.admissions_applications
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "admissions_write_admin" on public.admissions_applications;
create policy "admissions_write_admin"
on public.admissions_applications
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "notifications_select_same_institution" on public.notifications_log;
create policy "notifications_select_same_institution"
on public.notifications_log
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "notifications_write_admin" on public.notifications_log;
create policy "notifications_write_admin"
on public.notifications_log
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "calendar_select_same_institution" on public.academic_calendar_events;
create policy "calendar_select_same_institution"
on public.academic_calendar_events
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "calendar_write_admin" on public.academic_calendar_events;
create policy "calendar_write_admin"
on public.academic_calendar_events
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

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

drop policy if exists "fee_items_select_same_institution" on public.fee_items;
create policy "fee_items_select_same_institution"
on public.fee_items
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "fee_items_write_admin" on public.fee_items;
create policy "fee_items_write_admin"
on public.fee_items
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "academic_cycles_state_select_same_institution" on public.academic_cycles_state;
create policy "academic_cycles_state_select_same_institution"
on public.academic_cycles_state
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "academic_cycles_state_write_admin" on public.academic_cycles_state;
create policy "academic_cycles_state_write_admin"
on public.academic_cycles_state
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "admission_config_state_select_same_institution" on public.admission_config_state;
create policy "admission_config_state_select_same_institution"
on public.admission_config_state
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "admission_config_state_write_admin" on public.admission_config_state;
create policy "admission_config_state_write_admin"
on public.admission_config_state
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "parent_fee_records_select_same_institution" on public.parent_fee_records;
create policy "parent_fee_records_select_same_institution"
on public.parent_fee_records
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "parent_fee_records_write_admin" on public.parent_fee_records;
create policy "parent_fee_records_write_admin"
on public.parent_fee_records
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "access_grants_select_same_institution" on public.access_grants;
create policy "access_grants_select_same_institution"
on public.access_grants
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "access_grants_write_admin" on public.access_grants;
create policy "access_grants_write_admin"
on public.access_grants
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "workspace_states_select_same_institution" on public.workspace_states;
create policy "workspace_states_select_same_institution"
on public.workspace_states
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "workspace_states_write_admin" on public.workspace_states;
create policy "workspace_states_write_admin"
on public.workspace_states
for all
to authenticated
using (public.is_current_user_admin(institution_id))
with check (public.is_current_user_admin(institution_id));

drop policy if exists "workspace_migration_runs_select_same_institution" on public.workspace_migration_runs;
create policy "workspace_migration_runs_select_same_institution"
on public.workspace_migration_runs
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
);

drop policy if exists "workspace_migration_runs_insert_admin" on public.workspace_migration_runs;
create policy "workspace_migration_runs_insert_admin"
on public.workspace_migration_runs
for insert
to authenticated
with check (
  public.is_current_user_admin(institution_id)
  and triggered_by = auth.uid()
);

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

insert into public.role_permissions (institution_id, role_key, permission_key, enabled)
select
  i.id,
  role_key,
  permission_key,
  enabled
from public.institutions i
cross join (
  values
    ('Administrator', 'dashboard_view', true),
    ('Administrator', 'students_manage', true),
    ('Administrator', 'teachers_manage', true),
    ('Administrator', 'classes_manage', true),
    ('Administrator', 'attendance_manage', true),
    ('Administrator', 'results_manage', true),
    ('Administrator', 'fees_manage', true),
    ('Administrator', 'reports_view', true),
    ('Administrator', 'settings_manage', true),
    ('Teacher', 'dashboard_view', true),
    ('Teacher', 'students_manage', false),
    ('Teacher', 'teachers_manage', false),
    ('Teacher', 'classes_manage', false),
    ('Teacher', 'attendance_manage', true),
    ('Teacher', 'results_manage', true),
    ('Teacher', 'fees_manage', false),
    ('Teacher', 'reports_view', true),
    ('Teacher', 'settings_manage', false),
    ('Parent', 'dashboard_view', true),
    ('Parent', 'students_manage', false),
    ('Parent', 'teachers_manage', false),
    ('Parent', 'classes_manage', false),
    ('Parent', 'attendance_manage', false),
    ('Parent', 'results_manage', false),
    ('Parent', 'fees_manage', true),
    ('Parent', 'reports_view', true),
    ('Parent', 'settings_manage', false),
    ('Student', 'dashboard_view', true),
    ('Student', 'students_manage', false),
    ('Student', 'teachers_manage', false),
    ('Student', 'classes_manage', false),
    ('Student', 'attendance_manage', false),
    ('Student', 'results_manage', false),
    ('Student', 'fees_manage', false),
    ('Student', 'reports_view', true),
    ('Student', 'settings_manage', false)
) as defaults(role_key, permission_key, enabled)
where not exists (
  select 1
  from public.role_permissions rp
  where rp.institution_id = i.id
    and rp.role_key = defaults.role_key
    and rp.permission_key = defaults.permission_key
);
