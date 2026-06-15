create table if not exists public.gradebook_records (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions on delete cascade,
  record_id text not null,
  class_record_id text not null,
  subject_name text not null,
  session_record_id text not null,
  term_record_id text not null,
  teacher_id text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, record_id),
  unique (institution_id, class_record_id, subject_name, session_record_id, term_record_id)
);

alter table public.gradebook_records enable row level security;

drop trigger if exists set_gradebook_records_updated_at on public.gradebook_records;
create trigger set_gradebook_records_updated_at
before update on public.gradebook_records
for each row
execute function public.set_updated_at();

drop policy if exists "gradebook_records_select_admin_or_teacher" on public.gradebook_records;
create policy "gradebook_records_select_admin_or_teacher"
on public.gradebook_records
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
        and institution_id = gradebook_records.institution_id
        and lower(role) in ('teacher', 'staff', 'employee')
    )
  )
);

drop policy if exists "gradebook_records_write_admin_or_teacher" on public.gradebook_records;
create policy "gradebook_records_write_admin_or_teacher"
on public.gradebook_records
for all
to authenticated
using (
  public.is_current_user_admin(institution_id)
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and institution_id = gradebook_records.institution_id
      and lower(role) in ('teacher', 'staff', 'employee')
  )
)
with check (
  public.is_current_user_admin(institution_id)
  or exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and institution_id = gradebook_records.institution_id
      and lower(role) in ('teacher', 'staff', 'employee')
  )
);

create index if not exists gradebook_records_context_idx
on public.gradebook_records (institution_id, class_record_id, session_record_id, term_record_id, subject_name);
