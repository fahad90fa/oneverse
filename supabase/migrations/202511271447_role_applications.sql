create extension if not exists "uuid-ossp";

create table if not exists public.role_applications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('worker','seller')),
    status text not null default 'pending' check (status in ('pending','approved','rejected')),
    full_name text not null,
    phone_number text not null,
    address text not null,
    city text not null,
    province text not null,
    postal_code text not null,
    linkedin_url text,
    website_url text,
    bio text not null,
    skills text[] not null default '{}'::text[],
    business_name text,
    product_categories text[] not null default '{}'::text[],
    profile_image_url text,
    resume_url text,
    cnic_url text,
    admin_notes text,
    submission_count integer not null default 1,
    reviewed_by uuid references auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.set_role_applications_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists role_applications_set_updated_at on public.role_applications;

create trigger role_applications_set_updated_at
before update on public.role_applications
for each row
execute function public.set_role_applications_updated_at();

create or replace view public.public_role_applications as
select * from public.role_applications;

alter table public.role_applications enable row level security;

create policy "role applicants can read their submissions"
on public.role_applications
for select
using (auth.uid() = user_id);

create policy "role applicants can insert their submissions"
on public.role_applications
for insert
with check (auth.uid() = user_id);

create policy "role applicants can update pending submissions"
on public.role_applications
for update
using (auth.uid() = user_id and status = 'pending')
with check (auth.uid() = user_id);

create policy "admins can manage role applications"
on public.role_applications
for all
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
