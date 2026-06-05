# 🗄️ Supabase Setup - Step by Step (FIXED)

**Status**: ❌ Error encountered - **users table does not exist**  
**Solution**: Follow these steps IN ORDER

---

## ✅ STEP 1: Create Database Schema (REQUIRED FIRST)

**Location**: https://app.supabase.com/project/fnkbvqrvcsnwnuhjkwbe/sql

**Action**:
1. Click "New Query"
2. Copy **ENTIRE** content dari bawah ini:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('supervisor', 'team_leader', 'caretaker')),
  team_leader_id BIGINT,
  area TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(team_leader_id) REFERENCES users(id)
);

-- Activity Categories
CREATE TABLE IF NOT EXISTS activity_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Sources
CREATE TABLE IF NOT EXISTS activity_sources (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Activities
CREATE TABLE IF NOT EXISTS daily_activities (
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
  is_done INTEGER DEFAULT 0,
  google_event_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Handover Tasks
CREATE TABLE IF NOT EXISTS handover_tasks (
  id BIGSERIAL PRIMARY KEY,
  team_leader_id BIGINT REFERENCES users(id),
  task_name TEXT NOT NULL,
  category_id BIGINT REFERENCES activity_categories(id),
  duration INTEGER,
  source_id BIGINT REFERENCES activity_sources(id),
  notes TEXT,
  assigned_to_user_id BIGINT REFERENCES users(id),
  assigned_from_user_id BIGINT REFERENCES users(id),
  assigned_date DATE,
  is_processed INTEGER DEFAULT 0,
  activity_id BIGINT REFERENCES daily_activities(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_daily_activities_user ON daily_activities(on_duty_user_id);
CREATE INDEX idx_daily_activities_date ON daily_activities(activity_date);
CREATE INDEX idx_handover_tasks_user ON handover_tasks(assigned_to_user_id);
CREATE INDEX idx_handover_tasks_from ON handover_tasks(assigned_from_user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now)
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can read own activities" ON daily_activities FOR SELECT USING (true);
CREATE POLICY "Users can create activities" ON daily_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own activities" ON daily_activities FOR UPDATE USING (true);
CREATE POLICY "Users can delete own activities" ON daily_activities FOR DELETE USING (true);

CREATE POLICY "Users can read categories" ON activity_categories FOR SELECT USING (true);
CREATE POLICY "Users can read sources" ON activity_sources FOR SELECT USING (true);

CREATE POLICY "Users can read handover tasks" ON handover_tasks FOR SELECT USING (true);
CREATE POLICY "Users can create handover tasks" ON handover_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update handover tasks" ON handover_tasks FOR UPDATE USING (true);
```

3. Click **RUN** button
4. Wait untuk completion (biasanya <1 detik)
5. **Expected result**: ✅ No errors, success message

---

## ✅ STEP 2: Seed Initial Data (AFTER STEP 1 SUCCESS)

**Location**: Same SQL Editor (atau New Query)

**Copy & Paste seluruh script berikut:**

```sql
-- Step 1: Insert Users
INSERT INTO users (id, name, role, team_leader_id, area, email) VALUES
(1, 'Aan Sayudi', 'supervisor', NULL, 'Jakarta', 'aan.sayudi@majoo.id'),
(4, 'Jhovan Hidayat', 'team_leader', NULL, 'Jabodetabek', 'jhovan@majoo.id'),
(5, 'Rofbi Hidayadi', 'team_leader', NULL, 'Sumkalsulpap', 'rofby.hidayadi@majoo.id'),
(6, 'Ridho Valentin', 'team_leader', NULL, 'Jabalnusra', 'ridho.valentin@majoo.id'),
(7, 'Suro Rahadi', 'caretaker', 4, NULL, 'suro.rahardi@majoo.id'),
(8, 'Taufiq Hadiyanto', 'caretaker', 6, NULL, 'taufiq.hadiyanto@majoo.id'),
(9, 'Rahmat Hidayat', 'caretaker', 5, NULL, 'rahmat.hidayat@majoo.id');

-- Step 2: Insert Activity Categories
INSERT INTO activity_categories (id, name) VALUES
(8, 'Administrative & CRM Tasks'),
(9, 'Special Projects'),
(10, 'Enterprise'),
(11, 'Manage Teams'),
(16, 'Meet Internal'),
(23, 'Handling Enterprise'),
(24, 'Meet Enterprise'),
(25, 'Coaching Teams'),
(26, 'Assign Leads'),
(27, 'Follow Up Data'),
(28, 'Validasi H+1');

-- Step 3: Insert Activity Sources
INSERT INTO activity_sources (id, name) VALUES
(6, 'CRM'),
(7, 'Email'),
(8, 'Daily Tasklist'),
(10, 'WhatsApp'),
(13, 'Phone'),
(16, 'Chat System'),
(17, 'Ticket System');
```

3. Click **RUN**
4. **Expected result**: ✅ 3 successful inserts
   - 7 users inserted
   - 11 categories inserted
   - 7 sources inserted

---

## ✅ STEP 3: Verify Database

Di Supabase Dashboard:

1. **Go to**: Database → Tables
2. **Click each table** untuk verify data:

| Table | Expected Count |
|-------|-----------------|
| users | 7 users |
| activity_categories | 11 categories |
| activity_sources | 7 sources |
| daily_activities | empty (oke) |
| handover_tasks | empty (oke) |

---

## ❌ If Error

### Error: "relation 'users' does not exist"
**Fix**: Jalankan STEP 1 terlebih dahulu (CREATE TABLE script)

### Error: "duplicate key value violates unique constraint"
**Fix**: Delete sebelumnya data, atau gunakan `INSERT OR IGNORE` (specific untuk database)

### Error: "permission denied"
**Fix**: Check Supabase project authentikasi

---

## 📋 Checklist

- [ ] STEP 1: Run CREATE TABLE script → Success ✅
- [ ] STEP 2: Run INSERT data script → Success ✅
- [ ] STEP 3: Verify data di Dashboard
- [ ] Next: Enable GitHub Pages
- [ ] Then: Test aplikasi live

---

**After this is complete**: Database siap! Aplikasi bisa load data dari Supabase.

Database URL: https://fnkbvqrvcsnwnuhjkwbe.supabase.co  
Project: fnkbvqrvcsnwnuhjkwbe
