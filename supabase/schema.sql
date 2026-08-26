-- MIPHA Companion Supabase schema. Run once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  student_id text unique,
  username text unique not null,
  name text not null,
  role text not null check (role in ('guru', 'siswa')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_records (
  collection text not null,
  record_id text not null,
  owner_id text,
  record_date date,
  data jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, record_id)
);

create index if not exists app_records_collection_idx on public.app_records(collection);
create index if not exists app_records_owner_idx on public.app_records(collection, owner_id);
create index if not exists app_records_date_idx on public.app_records(collection, record_date);

create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where uid = auth.uid() and role = 'guru') $$;

create or replace function public.my_student_id() returns text
language sql stable security definer set search_path = public
as $$ select student_id from public.profiles where uid = auth.uid() $$;

create or replace function public.valid_student_claim(claimed_id text, claimed_username text) returns boolean
language sql stable security definer set search_path = public
as $$ select exists(
  select 1 from public.app_records
  where collection = 'students' and record_id = claimed_id and data ->> 'nis' = claimed_username
) $$;

alter table public.profiles enable row level security;
alter table public.app_records enable row level security;

-- Tables created through the SQL editor do not always inherit Data API grants.
-- RLS remains the authorization layer; these grants only make the policies reachable.
grant usage on schema public to authenticated, service_role;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.app_records to authenticated;
grant all privileges on table public.profiles, public.app_records to service_role;
grant execute on function public.is_teacher() to authenticated, service_role;
grant execute on function public.my_student_id() to authenticated, service_role;
grant execute on function public.valid_student_claim(text, text) to authenticated, service_role;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
using (uid = auth.uid() or public.is_teacher());
drop policy if exists profiles_student_create on public.profiles;
create policy profiles_student_create on public.profiles for insert to authenticated
with check (
  uid = auth.uid() and role = 'siswa'
  and username = split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1)
  and public.valid_student_claim(student_id, username)
);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
using (uid = auth.uid() or public.is_teacher())
with check ((uid = auth.uid() and role = 'siswa') or public.is_teacher());

drop policy if exists records_read on public.app_records;
create policy records_read on public.app_records for select to authenticated using (
  public.is_teacher()
  or collection in ('announcements', 'assignments', 'settings')
  or owner_id = public.my_student_id()
);

drop policy if exists records_teacher_write on public.app_records;
create policy records_teacher_write on public.app_records for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists records_student_insert on public.app_records;
create policy records_student_insert on public.app_records for insert to authenticated
with check (
  collection in ('attendance', 'leaveRequests', 'assignmentSubmissions')
  and owner_id = public.my_student_id()
  and coalesce(data ->> 'studentId', owner_id) = owner_id
  and (collection <> 'attendance' or data ->> 'status' in ('tepat_waktu', 'sakit', 'izin', 'alpha'))
);
drop policy if exists records_student_update on public.app_records;
create policy records_student_update on public.app_records for update to authenticated
using (collection in ('attendance', 'leaveRequests', 'assignmentSubmissions') and owner_id = public.my_student_id())
with check (
  owner_id = public.my_student_id()
  and coalesce(data ->> 'studentId', owner_id) = owner_id
  and (collection <> 'attendance' or data ->> 'status' in ('tepat_waktu', 'sakit', 'izin', 'alpha'))
);

do $$ begin
  alter publication supabase_realtime add table public.app_records;
exception when duplicate_object then null;
end $$;

-- The first teacher must be provisioned securely after signing up:
-- After creating admin@mipha-companion.local in Authentication > Users, run:
-- insert into public.profiles(uid, student_id, username, name, role, data)
-- select id, null, 'admin', 'Gevin Dimas Eka Kusuma, A.Md.', 'guru', '{}'::jsonb
-- from auth.users where email = 'admin@mipha-companion.local'
-- on conflict (uid) do update set role = 'guru';
