# 🗄️ Setup Supabase Database - Step by Step

**Status**: Database tables belum di-create - ini penyebab login blank

---

## 📋 STEP 1: Create Database Tables

### Procedure:
1. **Go to**: https://app.supabase.com/project/fnkbvqrvcsnwnuhjkwbe/sql/new
2. **New Query** - Klik tombol **"+ New Query"** di kiri atas
3. **Copy SQL** - Copy text di bawah ini:

```sql
-- ✅ CREATE TABLES

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS activity_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_sources (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS handover_tasks (
  id BIGSERIAL PRIMARY KEY,
  from_user_id BIGINT REFERENCES users(id),
  to_user_id BIGINT REFERENCES users(id),
  activity_date DATE,
  activity_name TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_team_leader ON users(team_leader_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON daily_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_user ON daily_activities(on_duty_user_id);
CREATE INDEX IF NOT EXISTS idx_activities_category ON daily_activities(category_id);
CREATE INDEX IF NOT EXISTS idx_handover_status ON handover_tasks(status);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy: Anyone can read from these tables
CREATE POLICY "Allow all read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON activity_categories FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON activity_sources FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON daily_activities FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON handover_tasks FOR SELECT USING (true);

-- Create RLS Policy: Authenticated users can insert/update/delete
CREATE POLICY "Allow authenticated users to insert" ON daily_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to insert" ON handover_tasks FOR INSERT WITH CHECK (true);
```

4. **Paste** ke SQL Editor
5. **Run** - Klik tombol **"▶ RUN"** (ikon play di kanan)
6. **Wait** untuk script selesai (biasanya 2-5 detik)

✅ Seharusnya muncul pesan **"Success"** di bawah

---

## 📋 STEP 2: Seed Data (Users & Categories)

### Procedure:
1. **New Query** - Klik **"+ New Query"** lagi
2. **Copy SQL** - Copy text di bawah ini:

```sql
-- ✅ SEED DATA (Users & Categories)

-- Insert 7 users (matched dengan auth users)
INSERT INTO users (name, role, area, email) VALUES
  ('Aan Sayudi', 'supervisor', 'HO', 'aan.sayudi@majoo.id'),
  ('Jhovan', 'team_leader', 'Area 1', 'jhovan@majoo.id'),
  ('Rofby Hidayadi', 'team_leader', 'Area 2', 'rofby.hidayadi@majoo.id'),
  ('Ridho Valentin', 'team_leader', 'Area 1', 'ridho.valentin@majoo.id'),
  ('Suro Rahardi', 'team_leader', 'Area 3', 'suro.rahardi@majoo.id'),
  ('Taufiq Hadiyanto', 'team_leader', 'Area 2', 'taufiq.hadiyanto@majoo.id'),
  ('Rahmat Hidayat', 'team_leader', 'Area 3', 'rahmat.hidayat@majoo.id')
ON CONFLICT DO NOTHING;

-- Insert activity categories
INSERT INTO activity_categories (name) VALUES
  ('Prospek'),
  ('Call Pelanggan'),
  ('Meeting Internal'),
  ('Maintenance'),
  ('Testing'),
  ('Dokumentasi'),
  ('Training'),
  ('Support Teknis'),
  ('Quality Assurance'),
  ('Delivery'),
  ('Admin')
ON CONFLICT DO NOTHING;

-- Insert activity sources
INSERT INTO activity_sources (name) VALUES
  ('Manual'),
  ('Google Calendar'),
  ('Email'),
  ('Chat'),
  ('System'),
  ('Mobile App'),
  ('Web Form')
ON CONFLICT DO NOTHING;
```

3. **Paste** ke SQL Editor
4. **Run** - Klik **"▶ RUN"**
5. **Wait** untuk selesai

✅ Seharusnya muncul **"Success"** dan text "7 rows affected" untuk users

---

## ✅ STEP 3: Verify Tables Created

1. **Go to**: https://app.supabase.com/project/fnkbvqrvcsnwnuhjkwbe/editor
2. **Check Tables** - Di sidebar kiri, kamu seharusnya lihat:
   - ✅ `users` (7 rows)
   - ✅ `activity_categories` (11 rows)
   - ✅ `activity_sources` (7 rows)
   - ✅ `daily_activities` (0 rows)
   - ✅ `handover_tasks` (0 rows)

---

## 🧪 STEP 4: Test Login

Sekarang coba login lagi:

```
URL: https://csmajoo.github.io/act/
Email: aan.sayudi@majoo.id
Password: 122333
```

**Expected**:
- ✅ Login page → Dashboard page (tidak blank)
- ✅ Sidebar menu terlihat
- ✅ Dashboard charts bisa di-scroll

---

## ❌ Troubleshooting

### Error: "Relation 'users' does not exist"
→ Significa STEP 1 tidak berhasil
→ Check console untuk error message
→ Re-run STEP 1

### Error: "Duplicate key value violates unique constraint"
→ User/kategori sudah ada
→ Tidak apa-apa, skip duplicate rows

### Login still blank after create tables
→ Go to: https://app.supabase.com/project/fnkbvqrvcsnwnuhjkwbe/auth/users
→ Verify 7 users ada
→ Check browser console (F12) untuk error details
→ Clear cache: Ctrl+Shift+Delete

---

**Mari jalankan STEP 1 & 2 sekarang! 🚀**
