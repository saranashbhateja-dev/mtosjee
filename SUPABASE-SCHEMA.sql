-- Jee OS cloud state schema.
-- Curriculum is bundled in tracker.json / curriculum.json and is not mutable here.
-- All user rows are protected by authenticated-user RLS.

create or replace function public.jeeo_set_server_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.server_updated_at = now();
  return new;
end;
$$;

create table if not exists public.jeeo_user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  theme text not null default 'dark' check (theme in ('','light','dark')),
  current_section text not null default 'dashboard',
  per_day_per_subject integer not null default 2 check (per_day_per_subject between 1 and 6),
  rest_day integer not null default 0 check (rest_day between 0 and 6),
  plan_start date,
  exam_date date,
  balance boolean not null default true,
  buffer_days integer not null default 30 check (buffer_days between 0 and 365),
  focus jsonb not null default '{}'::jsonb,
  client_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now()
);

create table if not exists public.jeeo_lecture_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  status text not null default 'COMPLETED' check (status in ('NOT_STARTED','PLANNED','LEARNING','COMPLETED','REVISED','MASTERED')),
  completed_at date,
  notes text not null default '',
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.jeeo_chapter_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  mastery_status text not null default 'NOT_STARTED' check (mastery_status in ('NOT_STARTED','LEARNING','PRACTICING','ASSESSED','MASTERED')),
  evidence_lectures boolean not null default false,
  evidence_revision boolean not null default false,
  evidence_questions boolean not null default false,
  evidence_test boolean not null default false,
  notes text not null default '',
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table if not exists public.jeeo_revision_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  cycle integer not null check (cycle between 1 and 6),
  due_date date,
  completed boolean not null default false,
  completed_at date,
  snoozed_until date,
  notes text not null default '',
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  primary key (user_id, module_id, cycle)
);

create table if not exists public.jeeo_test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null,
  taken_on date not null,
  score numeric,
  max_score numeric,
  minutes integer,
  physics_score numeric,
  chemistry_score numeric,
  maths_score numeric,
  weak_areas text not null default '',
  notes text not null default '',
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now()
);

create table if not exists public.jeeo_module_links (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  url text not null default '',
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table if not exists public.jeeo_module_overrides (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  domain_id text not null,
  name text not null,
  lecture_count integer not null check (lecture_count between 0 and 300),
  custom boolean not null default false,
  deleted boolean not null default false,
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create index if not exists jeeo_revision_due_idx on public.jeeo_revision_progress (user_id, due_date);
create index if not exists jeeo_test_date_idx on public.jeeo_test_results (user_id, taken_on);
create index if not exists jeeo_module_links_user_idx on public.jeeo_module_links (user_id);

alter table public.jeeo_user_settings enable row level security;
alter table public.jeeo_lecture_progress enable row level security;
alter table public.jeeo_chapter_progress enable row level security;
alter table public.jeeo_revision_progress enable row level security;
alter table public.jeeo_test_results enable row level security;
alter table public.jeeo_module_links enable row level security;
alter table public.jeeo_module_overrides enable row level security;

-- Drop/recreate ownership policies so this script is safe to rerun.
DO $$
DECLARE t text; op text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'jeeo_user_settings','jeeo_lecture_progress','jeeo_chapter_progress',
    'jeeo_revision_progress','jeeo_test_results','jeeo_module_links','jeeo_module_overrides'
  ]) LOOP
    FOR op IN SELECT unnest(ARRAY['select','insert','update','delete']) LOOP
      EXECUTE format('drop policy if exists jeeo_%s_%s on public.%I', t, op, t);
    END LOOP;
  END LOOP;
END $$;

create policy jeeo_user_settings_select on public.jeeo_user_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy jeeo_user_settings_insert on public.jeeo_user_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy jeeo_user_settings_update on public.jeeo_user_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy jeeo_user_settings_delete on public.jeeo_user_settings for delete to authenticated using ((select auth.uid()) = user_id);

create policy jeeo_lecture_progress_select on public.jeeo_lecture_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy jeeo_lecture_progress_insert on public.jeeo_lecture_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy jeeo_lecture_progress_update on public.jeeo_lecture_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy jeeo_lecture_progress_delete on public.jeeo_lecture_progress for delete to authenticated using ((select auth.uid()) = user_id);

create policy jeeo_chapter_progress_select on public.jeeo_chapter_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy jeeo_chapter_progress_insert on public.jeeo_chapter_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy jeeo_chapter_progress_update on public.jeeo_chapter_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy jeeo_chapter_progress_delete on public.jeeo_chapter_progress for delete to authenticated using ((select auth.uid()) = user_id);

create policy jeeo_revision_progress_select on public.jeeo_revision_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy jeeo_revision_progress_insert on public.jeeo_revision_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy jeeo_revision_progress_update on public.jeeo_revision_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy jeeo_revision_progress_delete on public.jeeo_revision_progress for delete to authenticated using ((select auth.uid()) = user_id);

create policy jeeo_test_results_select on public.jeeo_test_results for select to authenticated using ((select auth.uid()) = user_id);
create policy jeeo_test_results_insert on public.jeeo_test_results for insert to authenticated with check ((select auth.uid()) = user_id);
create policy jeeo_test_results_update on public.jeeo_test_results for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy jeeo_test_results_delete on public.jeeo_test_results for delete to authenticated using ((select auth.uid()) = user_id);

create policy jeeo_module_links_select on public.jeeo_module_links for select to authenticated using ((select auth.uid()) = user_id);
create policy jeeo_module_links_insert on public.jeeo_module_links for insert to authenticated with check ((select auth.uid()) = user_id);
create policy jeeo_module_links_update on public.jeeo_module_links for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy jeeo_module_links_delete on public.jeeo_module_links for delete to authenticated using ((select auth.uid()) = user_id);

create policy jeeo_module_overrides_select on public.jeeo_module_overrides for select to authenticated using ((select auth.uid()) = user_id);
create policy jeeo_module_overrides_insert on public.jeeo_module_overrides for insert to authenticated with check ((select auth.uid()) = user_id);
create policy jeeo_module_overrides_update on public.jeeo_module_overrides for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy jeeo_module_overrides_delete on public.jeeo_module_overrides for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.jeeo_user_settings to authenticated;
grant select, insert, update, delete on public.jeeo_lecture_progress to authenticated;
grant select, insert, update, delete on public.jeeo_chapter_progress to authenticated;
grant select, insert, update, delete on public.jeeo_revision_progress to authenticated;
grant select, insert, update, delete on public.jeeo_test_results to authenticated;
grant select, insert, update, delete on public.jeeo_module_links to authenticated;
grant select, insert, update, delete on public.jeeo_module_overrides to authenticated;

DO $$
BEGIN
  EXECUTE 'drop trigger if exists jeeo_user_settings_updated_at on public.jeeo_user_settings';
  EXECUTE 'create trigger jeeo_user_settings_updated_at before update on public.jeeo_user_settings for each row execute function public.jeeo_set_server_updated_at()';
  EXECUTE 'drop trigger if exists jeeo_lecture_progress_updated_at on public.jeeo_lecture_progress';
  EXECUTE 'create trigger jeeo_lecture_progress_updated_at before update on public.jeeo_lecture_progress for each row execute function public.jeeo_set_server_updated_at()';
  EXECUTE 'drop trigger if exists jeeo_chapter_progress_updated_at on public.jeeo_chapter_progress';
  EXECUTE 'create trigger jeeo_chapter_progress_updated_at before update on public.jeeo_chapter_progress for each row execute function public.jeeo_set_server_updated_at()';
  EXECUTE 'drop trigger if exists jeeo_revision_progress_updated_at on public.jeeo_revision_progress';
  EXECUTE 'create trigger jeeo_revision_progress_updated_at before update on public.jeeo_revision_progress for each row execute function public.jeeo_set_server_updated_at()';
  EXECUTE 'drop trigger if exists jeeo_test_results_updated_at on public.jeeo_test_results';
  EXECUTE 'create trigger jeeo_test_results_updated_at before update on public.jeeo_test_results for each row execute function public.jeeo_set_server_updated_at()';
  EXECUTE 'drop trigger if exists jeeo_module_links_updated_at on public.jeeo_module_links';
  EXECUTE 'create trigger jeeo_module_links_updated_at before update on public.jeeo_module_links for each row execute function public.jeeo_set_server_updated_at()';
  EXECUTE 'drop trigger if exists jeeo_module_overrides_updated_at on public.jeeo_module_overrides';
  EXECUTE 'create trigger jeeo_module_overrides_updated_at before update on public.jeeo_module_overrides for each row execute function public.jeeo_set_server_updated_at()';
END $$;
