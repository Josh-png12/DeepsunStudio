-- DeepSun Studio — portal contractual core schema
-- Run with Supabase CLI (`supabase db push`) or in the SQL editor in filename order.

create extension if not exists pgcrypto;

do $$ begin
  create type public.member_role as enum ('admin', 'investor');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.agreement_status as enum ('draft', 'active', 'paused', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.project_status as enum ('lead', 'pending', 'active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.transaction_type as enum ('income', 'cost', 'refund', 'chargeback', 'adjustment');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.transaction_status as enum ('draft', 'pending', 'confirmed', 'reversed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.participation_status as enum ('calculated', 'approved', 'paid', 'adjusted');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.document_type as enum ('contract', 'invoice', 'receipt', 'payment_proof', 'report', 'other');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.update_visibility as enum ('members', 'admin_only');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.expense_kind as enum ('income', 'expense');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.reminder_status as enum ('pending', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.notification_frequency as enum ('immediate', 'daily', 'weekly');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 160),
  role public.member_role not null default 'investor',
  avatar_url text,
  document_type text,
  document_number text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 3 and 180),
  status public.agreement_status not null default 'draft',
  initial_contribution numeric(16,2) not null check (initial_contribution >= 0),
  participation_percentage numeric(7,4) not null check (participation_percentage >= 0 and participation_percentage <= 100),
  contractual_cap numeric(16,2) not null check (contractual_cap >= 0),
  start_date date not null,
  end_date date,
  currency char(3) not null default 'COP' check (currency ~ '^[A-Z]{3}$'),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table if not exists public.agreement_members (
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  role public.member_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (agreement_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  name text not null check (length(trim(name)) between 2 and 180),
  description text,
  client_name text,
  status public.project_status not null default 'lead',
  estimated_value numeric(16,2) check (estimated_value is null or estimated_value >= 0),
  started_at date,
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  type public.document_type not null default 'other',
  name text not null check (length(trim(name)) between 1 and 240),
  storage_path text not null unique,
  mime_type text not null,
  size bigint not null check (size > 0 and size <= 52428800),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  project_id uuid references public.projects(id) on delete restrict,
  type public.transaction_type not null,
  amount numeric(16,2) not null,
  currency char(3) not null default 'COP' check (currency ~ '^[A-Z]{3}$'),
  effective_date date not null,
  status public.transaction_status not null default 'draft',
  description text not null check (length(trim(description)) between 3 and 500),
  reason text,
  support_document_id uuid references public.documents(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (type = 'adjustment' and amount <> 0 and length(trim(coalesce(reason, ''))) >= 5)
    or (type <> 'adjustment' and amount > 0)
  )
);

create table if not exists public.participations (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete restrict,
  investor_id uuid not null references public.profiles(id) on delete restrict,
  gross_income numeric(16,2) not null check (gross_income >= 0),
  deductible_costs numeric(16,2) not null check (deductible_costs >= 0),
  refunds numeric(16,2) not null default 0 check (refunds >= 0),
  chargebacks numeric(16,2) not null default 0 check (chargebacks >= 0),
  adjustments numeric(16,2) not null default 0,
  net_profit numeric(16,2) not null,
  percentage numeric(7,4) not null check (percentage >= 0 and percentage <= 100),
  amount numeric(16,2) not null check (amount >= 0),
  status public.participation_status not null default 'calculated',
  supersedes_id uuid references public.participations(id) on delete restrict,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  investor_id uuid not null references public.profiles(id) on delete restrict,
  participation_id uuid references public.participations(id) on delete restrict,
  amount numeric(16,2) not null check (amount > 0),
  payment_date date not null,
  payment_method text not null check (length(trim(payment_method)) between 2 and 80),
  reference text,
  document_id uuid references public.documents(id) on delete set null,
  notes text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  title text not null check (length(trim(title)) between 3 and 180),
  content text not null check (length(trim(content)) between 3 and 5000),
  visibility public.update_visibility not null default 'members',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  agreement_id uuid references public.agreements(id) on delete restrict,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  previous_data jsonb,
  new_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  agreement_id uuid references public.agreements(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  notify_income boolean not null default true,
  notify_participation boolean not null default true,
  notify_payment boolean not null default true,
  notify_document boolean not null default true,
  notify_update boolean not null default true,
  notification_frequency public.notification_frequency not null default 'immediate',
  locale text not null default 'es-CO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.personal_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.expense_kind not null,
  category text not null check (length(trim(category)) between 2 and 80),
  concept text not null check (length(trim(concept)) between 2 and 180),
  amount numeric(16,2) not null check (amount > 0),
  occurred_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 120),
  target_amount numeric(16,2) not null check (target_amount > 0),
  saved_amount numeric(16,2) not null default 0 check (saved_amount >= 0),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) between 2 and 160),
  due_at timestamptz not null,
  status public.reminder_status not null default 'pending',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agreement_members_user on public.agreement_members(user_id, agreement_id);
create index if not exists idx_projects_agreement_status on public.projects(agreement_id, status);
create index if not exists idx_transactions_agreement_date on public.transactions(agreement_id, effective_date desc);
create index if not exists idx_transactions_project_status on public.transactions(project_id, status) where project_id is not null;
create index if not exists idx_participations_investor on public.participations(investor_id, agreement_id, created_at desc);
create index if not exists idx_payments_investor_date on public.payments(investor_id, payment_date desc);
create index if not exists idx_documents_agreement_type on public.documents(agreement_id, type, created_at desc);
create index if not exists idx_updates_agreement_date on public.updates(agreement_id, created_at desc);
create index if not exists idx_audit_agreement_date on public.audit_logs(agreement_id, created_at desc);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, created_at desc) where read_at is null;
create index if not exists idx_expenses_user_date on public.personal_expenses(user_id, occurred_on desc);
create index if not exists idx_goals_user on public.savings_goals(user_id, created_at desc);
create index if not exists idx_reminders_user_due on public.reminders(user_id, due_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','agreements','agreement_members','projects','documents','transactions',
    'participations','payments','updates','notifications','user_preferences',
    'personal_expenses','savings_goals','reminders'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end $$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    'investor'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

