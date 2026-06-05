-- ============================================================
-- FULL SUPABASE SCHEMA - Productivity Customer Support Leader
-- ============================================================
-- Run this in Supabase SQL Editor
-- Includes: users, categories, sources, activities, tasks, templates, sessions

-- Step 1: Drop existing tables (clean slate)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS handover_tasks CASCADE;
DROP TABLE IF EXISTS daily_activities CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS activity_sources CASCADE;
DROP TABLE IF EXISTS activity_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('supervisor', 'team_leader', 'caretaker')),
  team_leader_id BIGINT REFERENCES users(id),
  area TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  google_refresh_token TEXT,
  google_access_token TEXT,
  google_token_expiry BIGINT,
  google_email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create activity_categories
CREATE TABLE activity_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create activity_sources
CREATE TABLE activity_sources (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create daily_activities
CREATE TABLE daily_activities (
  id BIGSERIAL PRIMARY KEY,
  team_leader_id BIGINT REFERENCES users(id),
  on_duty_user_id BIGINT REFERENCES users(id),
  activity_date DATE NOT NULL,
  category_id BIGINT REFERENCES activity_categories(id),
  activity_name TEXT NOT NULL,
  duration INTEGER,
  start_time TIME,
  end_time TIME,
  source_id BIGINT REFERENCES activity_sources(id),
  notes TEXT,
  google_event_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create handover_tasks
CREATE TABLE handover_tasks (
  id BIGSERIAL PRIMARY KEY,
  team_leader_id BIGINT REFERENCES users(id),
  assigned_from_user_id BIGINT REFERENCES users(id),
  assigned_to_user_id BIGINT REFERENCES users(id),
  task_name TEXT NOT NULL,
  category_id BIGINT REFERENCES activity_categories(id),
  duration INTEGER,
  source_id BIGINT REFERENCES activity_sources(id),
  notes TEXT,
  assigned_date DATE,
  is_processed INTEGER DEFAULT 0,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create templates
CREATE TABLE templates (
  id BIGSERIAL PRIMARY KEY,
  team_leader_id BIGINT REFERENCES users(id),
  category_id BIGINT REFERENCES activity_categories(id),
  activity_name TEXT NOT NULL,
  duration INTEGER,
  source_id BIGINT REFERENCES activity_sources(id),
  created_by_user_id BIGINT REFERENCES users(id),
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create sessions
CREATE TABLE sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 9: Create indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_team_leader ON users(team_leader_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_activities_date ON daily_activities(activity_date);
CREATE INDEX idx_activities_user ON daily_activities(on_duty_user_id);
CREATE INDEX idx_activities_team ON daily_activities(team_leader_id);
CREATE INDEX idx_activities_category ON daily_activities(category_id);
CREATE INDEX idx_tasks_team ON handover_tasks(team_leader_id);
CREATE INDEX idx_tasks_assigned_to ON handover_tasks(assigned_to_user_id);
CREATE INDEX idx_tasks_processed ON handover_tasks(is_processed);
CREATE INDEX idx_templates_team ON templates(team_leader_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- Step 10: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Step 11: Allow all operations (open access for now - tighten later)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on categories" ON activity_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sources" ON activity_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activities" ON daily_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tasks" ON handover_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on templates" ON templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- Step 12: Seed sample users (password = "122333" - hash will be set in app)
-- Default password format: plain "122333" for simplicity in initial setup
INSERT INTO users (name, role, email, password_hash, area) VALUES
  ('Aan Sayudi', 'supervisor', 'aan.sayudi@majoo.id', '122333', 'All Areas'),
  ('Team Leader Sample', 'team_leader', 'tl@majoo.id', '122333', 'Jakarta'),
  ('Caretaker Sample', 'caretaker', 'ct@majoo.id', '122333', 'Jakarta');

-- Step 13: Update caretaker to reference team leader
UPDATE users SET team_leader_id = (SELECT id FROM users WHERE email = 'tl@majoo.id')
WHERE email = 'ct@majoo.id';

-- Step 14: Seed sample categories & sources
INSERT INTO activity_categories (name) VALUES
  ('Assign Leads'),
  ('Customer Follow-up'),
  ('Internal Meeting'),
  ('Training'),
  ('Other');

INSERT INTO activity_sources (name) VALUES
  ('CRM'),
  ('WhatsApp'),
  ('Email'),
  ('Phone'),
  ('In-person');

-- ✅ DONE! Schema is ready for the app
