-- database/schema.sql
-- Supabase database schema for AI Recruiter

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    parsed_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    linkedin TEXT,
    github TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Email configuration table
CREATE TABLE IF NOT EXISTS email_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    secure BOOLEAN NOT NULL DEFAULT false,
    auth_user TEXT NOT NULL,
    auth_pass TEXT NOT NULL,
    connection_type TEXT NOT NULL DEFAULT 'auto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_job_id ON campaigns(job_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_candidate_id ON campaigns(candidate_id);

-- Enable Row Level Security (RLS) for future user authentication
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these later for user authentication)
CREATE POLICY "Allow public access to jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow public access to candidates" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow public access to campaigns" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow public access to email_config" ON email_config FOR ALL USING (true);

-- Insert sample data (optional)
INSERT INTO jobs (title, description) VALUES 
('Sample Job Posting', 'This is a sample job description to get you started.') 
ON CONFLICT DO NOTHING;

INSERT INTO candidates (name, email, title, location, experience, skills) VALUES 
('John Doe', 'john@example.com', 'Software Engineer', 'San Francisco, CA', '5 years', ARRAY['JavaScript', 'React', 'Node.js']) 
ON CONFLICT DO NOTHING;
