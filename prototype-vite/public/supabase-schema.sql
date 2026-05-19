-- Supabase PostgreSQL MVP schema
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  level text check (level in ('Baslangic','Orta','Ileri')) not null,
  city text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);

create table if not exists gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  rating numeric(2,1) default 0
);

create table if not exists trainers (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references gyms(id) on delete set null,
  full_name text not null,
  expertise text[] default '{}',
  certificates text[] default '{}',
  experience_year int default 0
);

create table if not exists dietitians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialty text[] default '{}',
  city text,
  experience_year int default 0,
  bio text
);

create table if not exists workout_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  focus text check (focus in ('Gogus','Bacak','Kardiyo','Sirt','Omuz','Kol')) not null,
  preferred_date date default current_date
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id) on delete cascade,
  receiver_id uuid references users(id) on delete cascade,
  content text not null,
  sent_at timestamptz default now()
);

create table if not exists calorie_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  meal_name text not null,
  image_url text,
  calories int not null,
  logged_at timestamptz default now()
);
