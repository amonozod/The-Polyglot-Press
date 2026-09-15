-- Run this whole file in Supabase SQL Editor (New query > paste all > Run)

create table articles (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  dek text,
  category text,
  author text,
  content text,
  image_url text,
  published_at timestamptz default now()
);

create table videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text,
  video_url text not null,
  thumbnail_url text,
  duration text,
  published_at timestamptz default now()
);

create table team_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  photo_url text,
  sort_order int default 0
);

create table issues (
  id uuid default gen_random_uuid() primary key,
  issue_number int,
  title text not null,
  description text,
  cover_url text,
  pdf_url text,
  published_at timestamptz default now()
);

create table comments (
  id uuid default gen_random_uuid() primary key,
  article_slug text not null,
  name text not null,
  text text not null,
  approved boolean default true,
  created_at timestamptz default now()
);

create table ratings (
  id uuid default gen_random_uuid() primary key,
  article_slug text not null,
  stars int check (stars between 1 and 5),
  created_at timestamptz default now()
);

create table submissions (
  id uuid default gen_random_uuid() primary key,
  name text, year_grade text, email text, category text,
  title text, description text, file_url text, image_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table articles enable row level security;
alter table videos enable row level security;
alter table team_members enable row level security;
alter table issues enable row level security;
alter table comments enable row level security;
alter table ratings enable row level security;
alter table submissions enable row level security;

create policy "Public read" on articles for select using (true);
create policy "Public read" on videos for select using (true);
create policy "Public read" on team_members for select using (true);
create policy "Public read" on issues for select using (true);
create policy "Public read approved comments" on comments for select using (approved = true);
create policy "Public read ratings" on ratings for select using (true);

create policy "Anyone can comment" on comments for insert with check (true);
create policy "Anyone can rate" on ratings for insert with check (true);
create policy "Anyone can submit" on submissions for insert with check (true);

create policy "Admin write articles" on articles for insert with check (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
create policy "Admin update articles" on articles for update using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
create policy "Admin delete articles" on articles for delete using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');

create policy "Admin write videos" on videos for insert with check (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
create policy "Admin delete videos" on videos for delete using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');

create policy "Admin write team" on team_members for insert with check (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
create policy "Admin delete team" on team_members for delete using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');

create policy "Admin write issues" on issues for insert with check (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
create policy "Admin delete issues" on issues for delete using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');

create policy "Admin read submissions" on submissions for select using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
create policy "Admin update submissions" on submissions for update using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
create policy "Admin delete submissions" on submissions for delete using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');

create policy "Admin read all comments" on comments for select using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
create policy "Admin delete comments" on comments for delete using (auth.jwt() ->> 'email' = 'diyorilhomoff@gmail.com');
