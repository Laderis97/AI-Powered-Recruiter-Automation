-- Database Migration Script for Archive Functionality
-- Run this in your Supabase SQL Editor

-- Add archive columns to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add archive columns to jobs table  
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add archive columns to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have is_archived = false
UPDATE candidates SET is_archived = FALSE WHERE is_archived IS NULL;
UPDATE jobs SET is_archived = FALSE WHERE is_archived IS NULL;
UPDATE campaigns SET is_archived = FALSE WHERE is_archived IS NULL;

-- Verify the changes
SELECT 
    'candidates' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'candidates' 
    AND column_name IN ('is_archived', 'archived_at')
UNION ALL
SELECT 
    'jobs' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
    AND column_name IN ('is_archived', 'archived_at')
UNION ALL
SELECT 
    'campaigns' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
    AND column_name IN ('is_archived', 'archived_at');
