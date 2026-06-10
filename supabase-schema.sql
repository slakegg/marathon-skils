-- Run this in Supabase SQL Editor to set up the database

CREATE TABLE IF NOT EXISTS runners (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,                     -- Google sub from NextAuth
  first_name  VARCHAR(50)  NOT NULL,
  last_name   VARCHAR(50)  NOT NULL DEFAULT '',
  email       VARCHAR(100) NOT NULL,
  gender      VARCHAR(20)  NOT NULL DEFAULT 'Мужской',
  birth_date  DATE,
  country     VARCHAR(60)  NOT NULL DEFAULT 'Kazakhstan',
  role        VARCHAR(30)  NOT NULL DEFAULT 'Бегун',
  bmi         DECIMAL(5,2) DEFAULT 0,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE runners ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read all runners
CREATE POLICY "read_all" ON runners
  FOR SELECT USING (true);

-- Users can only insert/update/delete their own records
CREATE POLICY "insert_own" ON runners
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "update_own" ON runners
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "delete_own" ON runners
  FOR DELETE USING (auth.uid()::text = user_id);

-- Index for filtering
CREATE INDEX IF NOT EXISTS runners_user_id_idx ON runners(user_id);
CREATE INDEX IF NOT EXISTS runners_role_idx ON runners(role);
