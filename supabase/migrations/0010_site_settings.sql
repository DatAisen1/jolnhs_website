-- ============================================================
-- Site Settings Management
-- ============================================================

create table site_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text not null,
  category    text not null default 'general',
  updated_at  timestamptz not null default now()
);

-- Row Level Security
alter table site_settings enable row level security;

-- Public read (settings are needed for public site)
create policy "Public read" on site_settings for select using (true);

-- Admin-only write
create policy "Admin write" on site_settings
  for all to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

-- Seed initial settings
insert into site_settings (key, value, category) values
  ('site_name', 'Julia Ortiz Luis National High School', 'identity'),
  ('site_tagline', 'We Soar With Pride. Soar High, JOLIANS!', 'identity'),
  ('address', 'Sagaba, Santo Domingo, Nueva Ecija, Philippines', 'contact'),
  ('email', 'julia.ortiz1945@gmail.com', 'contact'),
  ('facebook_handle', 'jolnhs300814official', 'contact'),
  ('facebook_url', 'https://www.facebook.com/jolnhs300814official', 'contact'),
  ('maps_url', 'https://www.google.com/maps/search/?api=1&query=Julia+Ortiz+Luis+National+High+School', 'contact'),
  ('school_type', 'Public Secondary School', 'information'),
  ('department', 'Department of Education (DepEd)', 'information'),
  ('programs_offered', 'STE, SP-ICT, SNED, Regular, SHS', 'information'),
  ('mission_statement', 'Julia Ortiz Luis National High School is a public secondary school committed to providing quality, inclusive, and community-centered education. From our Special Science and ICT programs to our Special Needs Education initiatives, every learner at JOLNHS is known, supported, and given the tools to grow — academically, socially, and as a person of good character.', 'information'),
  ('office_hours', 'Monday–Friday: 7:00 AM – 5:00 PM, Saturday: Closed, Sunday: Closed, Holidays: Closed', 'information');
