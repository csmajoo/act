-- ============================================================
-- Add Google Calendar columns to users table (if not exists)
-- ============================================================
-- Run this if you already ran SUPABASE_FULL_SCHEMA.sql but need
-- to add google_email column.

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expiry BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_email TEXT;

-- ✅ Done!
