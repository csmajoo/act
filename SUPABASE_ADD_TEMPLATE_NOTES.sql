-- ============================================================
-- Add notes column to templates table
-- ============================================================
-- Run this in Supabase SQL Editor to allow notes/description per template

ALTER TABLE templates ADD COLUMN IF NOT EXISTS notes TEXT;

-- ✅ Done!
