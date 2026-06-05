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

  if to_regclass('public.students') is null then
    raise exception 'Missing public.students. Apply the base SchoolSphere schema first.';
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

create table if not exists public.report_cards (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  student_record_id text not null,
  class_record_id text,
  session_record_id text not null,
  term_record_id text not null,
  status text not null default 'draft' check (status in ('draft', 'released')),
  released_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id),
  unique (institution_id, student_record_id, session_record_id, term_record_id)
);

alter table public.report_cards enable row level security;

drop trigger if exists set_report_cards_updated_at on public.report_cards;
create trigger set_report_cards_updated_at
before update on public.report_cards
for each row
execute function public.set_updated_at();

drop policy if exists "report_cards_select_same_institution" on public.report_cards;
create policy "report_cards_select_same_institution"
on public.report_cards
for select
to authenticated
using (
  institution_id = public.current_user_institution_id()
  and (
    public.is_current_user_admin(institution_id)
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and institution_id = report_cards.institution_id
        and lower(role) in ('teacher', 'staff', 'employee')
    )
    or (
      status = 'released'
      and exists (
        select 1
        from public.profiles as parent_profile
        join public.students as linked_student
          on linked_student.institution_id = parent_profile.institution_id
          and linked_student.record_id = report_cards.student_record_id
        cross join lateral jsonb_array_elements(linked_student.guardians) as guardian
        where parent_profile.id = auth.uid()
          and lower(parent_profile.role) in ('parent', 'guardian')
          and lower(coalesce(guardian ->> 'email', '')) = lower(parent_profile.email)
      )
    )
  )
);

drop policy if exists "report_cards_write_admin_or_teacher" on public.report_cards;
create policy "report_cards_write_admin_or_teacher"
on public.report_cards
for all
to authenticated
using (
  public.is_current_user_admin(institution_id)
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and institution_id = report_cards.institution_id
      and lower(role) in ('teacher', 'staff', 'employee')
  )
)
with check (
  public.is_current_user_admin(institution_id)
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and institution_id = report_cards.institution_id
      and lower(role) in ('teacher', 'staff', 'employee')
  )
);

create index if not exists report_cards_student_period_idx
on public.report_cards (institution_id, student_record_id, session_record_id, term_record_id);

create index if not exists report_cards_class_period_idx
on public.report_cards (institution_id, class_record_id, session_record_id, term_record_id, status);

commit;
