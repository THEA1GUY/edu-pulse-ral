-- Create a simple test table
create table if not exists connection_test (
  id serial primary key,
  message text,
  created_at timestamp with time zone default now()
);

-- Insert a test record
insert into connection_test (message) values ('Supabase connection successful! 🚀');

-- Enable RLS and allow anyone to read (for testing purposes)
alter table connection_test enable row level security;
create policy "Anyone can read connection_test" on connection_test for select using (true);
