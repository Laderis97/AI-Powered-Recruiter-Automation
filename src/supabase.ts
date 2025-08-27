// src/supabase.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  JOBS: 'jobs',
  CANDIDATES: 'candidates',
  CAMPAIGNS: 'campaigns',
  EMAIL_CONFIG: 'email_config',
} as const;

// Database types
export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          title: string;
          description: string;
          parsed_data?: any;
          created_at: string;
          is_archived?: boolean;
          archived_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          parsed_data?: any;
          created_at?: string;
          is_archived?: boolean;
          archived_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          parsed_data?: any;
          created_at?: string;
          is_archived?: boolean;
          archived_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          title: string;
          location: string;
          experience: string;
          skills: string[];
          linkedin?: string;
          github?: string;
          created_at: string;
          is_archived?: boolean;
          archived_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string;
          title: string;
          location: string;
          experience?: string;
          skills: string[];
          linkedin?: string;
          github?: string;
          created_at?: string;
          is_archived?: boolean;
          archived_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          title?: string;
          location?: string;
          experience?: string;
          skills?: string[];
          linkedin?: string;
          github?: string;
          created_at?: string;
          is_archived?: boolean;
          archived_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          job_id: string;
          candidate_id: string;
          message: string;
          status: 'draft' | 'sent' | 'replied';
          created_at: string;
          sent_at?: string;
          is_archived?: boolean;
          archived_at?: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          candidate_id: string;
          message: string;
          status?: 'draft' | 'sent' | 'replied';
          created_at?: string;
          sent_at?: string;
          is_archived?: boolean;
          archived_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          candidate_id?: string;
          message?: string;
          status?: 'draft' | 'sent' | 'replied';
          created_at?: string;
          sent_at?: string;
          is_archived?: boolean;
          archived_at?: string;
        };
      };
      email_config: {
        Row: {
          id: string;
          host: string;
          port: number;
          secure: boolean;
          auth_user: string;
          auth_pass: string;
          connection_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          host: string;
          port: number;
          secure: boolean;
          auth_user: string;
          auth_pass: string;
          connection_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          host?: string;
          port?: number;
          secure?: boolean;
          auth_user?: string;
          auth_pass?: string;
          connection_type?: string;
          created_at?: string;
        };
      };
    };
  };
}
