-- Blog view counts for "Most Popular" strip and article stats.
-- Run in Supabase SQL Editor (production).

create table if not exists public.blog_post_views (
  post_id text primary key,
  view_count bigint not null default 0 check (view_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.blog_post_views enable row level security;

create policy "Public read blog views"
  on public.blog_post_views
  for select
  using (true);

create or replace function public.increment_blog_post_view(p_post_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  insert into public.blog_post_views (post_id, view_count)
  values (p_post_id, 1)
  on conflict (post_id) do update
  set
    view_count = public.blog_post_views.view_count + 1,
    updated_at = now()
  returning view_count into new_count;

  return new_count;
end;
$$;

grant execute on function public.increment_blog_post_view(text) to service_role;
grant select on public.blog_post_views to anon, authenticated, service_role;
grant all on public.blog_post_views to service_role;
