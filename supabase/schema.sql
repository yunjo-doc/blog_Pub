-- AI 생활연구소 블로그 DB 스키마
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.

create extension if not exists pgcrypto;

-- 글
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  cover_image_url text,
  category text not null default '리뷰',
  tags text[] not null default '{}',
  author text not null default 'AI 생활연구소 에디터',
  rating numeric(2, 1) check (rating is null or (rating >= 0 and rating <= 5)),
  verdict text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  read_time text not null default '',
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

-- 발행된 글만 누구나 읽기 가능 (작성·수정은 대시보드나 secret 키로만)
drop policy if exists "Anyone can read published posts" on public.posts;
create policy "Anyone can read published posts"
on public.posts for select
using (status = 'published');

-- 조회수
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null default '',
  slug text,
  title text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_slug_idx on public.page_views (slug);
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

alter table public.page_views enable row level security;

drop policy if exists "Anyone can insert page views" on public.page_views;
create policy "Anyone can insert page views"
on public.page_views for insert with check (true);

drop policy if exists "Anyone can read page views" on public.page_views;
create policy "Anyone can read page views"
on public.page_views for select using (true);

-- 뉴스레터 구독자 (저장만 가능, 외부에서 목록 조회 불가)
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists subscribers_created_at_idx on public.subscribers (created_at desc);

alter table public.subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.subscribers;
create policy "Anyone can subscribe"
on public.subscribers for insert with check (true);
