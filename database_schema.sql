-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('teacher', 'student')),
  avatar_url text,
  learning_style text check (learning_style in ('visual', 'auditory', 'reading', 'kinesthetic')),
  teacher_id uuid references profiles(id),
  class_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ... (skipping to RLS)

-- Helper for RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

-- Profiles policies
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Teachers can view student profiles" on profiles for select using (get_user_role(auth.uid()) = 'teacher');
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);


-- 2. Quizzes Table
create table quizzes (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references profiles(id) on delete cascade not null,
  topic text not null,
  difficulty text check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  language text default 'English',
  is_bilingual boolean default false,
  source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Questions Table
create table questions (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  question_text text not null,
  translation_text text,
  options jsonb not null, -- Array of strings
  correct_answer_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Attempts Table
create table attempts (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references quizzes(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  score integer not null,
  answers jsonb not null, -- Map of question_index to selected_option_index
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SET UP ROW LEVEL SECURITY (RLS)

-- Profiles: Users can only see their own profile
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Quizzes: Everyone can see quizzes, only teachers can create/edit their own
alter table quizzes enable row level security;
create policy "Quizzes are viewable by everyone" on quizzes for select using (true);
create policy "Teachers can insert own quizzes" on quizzes for insert with check (auth.uid() = teacher_id);
create policy "Teachers can update own quizzes" on quizzes for update using (auth.uid() = teacher_id);

-- Questions: Viewable by everyone, only quiz owner can edit
alter table questions enable row level security;
create policy "Questions are viewable by everyone" on questions for select using (true);
create policy "Quiz owners can manage questions" on questions for all using (
  exists (
    select 1 from quizzes
    where quizzes.id = questions.quiz_id
    and quizzes.teacher_id = auth.uid()
  )
);

-- Attempts: Students can see their own attempts, teachers can see attempts for their quizzes
alter table attempts enable row level security;
create policy "Students can view own attempts" on attempts for select using (auth.uid() = student_id);
create policy "Teachers can view attempts for their quizzes" on attempts for select using (
  exists (
    select 1 from quizzes
    where quizzes.id = attempts.quiz_id
    and quizzes.teacher_id = auth.uid()
  )
);
create policy "Students can insert own attempts" on attempts for insert with check (auth.uid() = student_id);
