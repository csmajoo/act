# 🗄️ Supabase Database Setup - DUPLICATE KEY ERROR FIX

**Status**: 🔴 Duplicate key error - **FIXED with 2 options**

---

## ❌ The Problem
```
ERROR: 23505: duplicate key value violates unique constraint "users_pkey"
Key (id)=(1) already exists.
```

This means **data was already inserted before**. When trying to insert again, it errors.

---

## ✅ SOLUTION - Choose One Option

### **Option A: Fresh Start (DELETE & RE-INSERT)**

If you want to **clear old data and start fresh**:

1. **Create NEW query** in Supabase SQL Editor
2. Open file: [SUPABASE_RESET_DATA.sql](SUPABASE_RESET_DATA.sql)
3. Copy & Paste entire content
4. Click **RUN** → This deletes all old data
5. **Then** run [SUPABASE_SEED_DATA.sql](SUPABASE_SEED_DATA.sql) again
6. Click **RUN**

✅ **Result**: Fresh database with clean data

---

### **Option B: Keep Existing Data (SKIP DUPLICATES)**

If you want to **keep existing data** and only add missing records:

1. **Create NEW query** in Supabase SQL Editor
2. Open file: [SUPABASE_SEED_DATA.sql](SUPABASE_SEED_DATA.sql) ← **Updated with ON CONFLICT**
3. Copy & Paste entire content
4. Click **RUN**

✅ **Result**: Existing data kept, duplicates skipped, missing data added

---

## 📋 Files Available

| File | Purpose | Use When |
|------|---------|----------|
| [SUPABASE_CREATE_TABLES.sql](SUPABASE_CREATE_TABLES.sql) | Create table schema | First time only |
| [SUPABASE_SEED_DATA.sql](SUPABASE_SEED_DATA.sql) | Insert data (skip duplicates) | Default - safe |
| [SUPABASE_RESET_DATA.sql](SUPABASE_RESET_DATA.sql) | Delete all data | Start fresh |

---

## 🎯 Quick Decision

**Choose Option A if:**
- Want completely fresh database
- Don't care about old test data
- Want clean slate

**Choose Option B if:**
- Want keep existing data
- Just want to fill missing records
- Don't want to lose anything

---

## ✅ After Running

**Verify in Supabase Dashboard**:
1. Go to: Database → Tables
2. Click each table and verify:
   - users: 7 rows
   - activity_categories: 11 rows
   - activity_sources: 7 rows

---

**Next Step**: Enable GitHub Pages → Test live app

Created: 2026-06-05
Updated: After duplicate key error encountered

