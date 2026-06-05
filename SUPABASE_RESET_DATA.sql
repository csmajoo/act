-- ✅ CLEAN & RESET DATABASE
-- Use this if you want to DELETE all existing data and start fresh
-- WARNING: This deletes everything - only use if you want a fresh start

-- Delete all data (in correct order due to foreign keys)
DELETE FROM handover_tasks;
DELETE FROM daily_activities;
DELETE FROM activity_sources;
DELETE FROM activity_categories;
DELETE FROM users;

-- Reset ID sequences back to 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE activity_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE activity_sources_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_activities_id_seq RESTART WITH 1;
ALTER SEQUENCE handover_tasks_id_seq RESTART WITH 1;
