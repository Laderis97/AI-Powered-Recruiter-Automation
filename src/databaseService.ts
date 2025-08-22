// src/databaseService.ts

import { supabase, TABLES } from './supabase.js';
import { v4 as uuidv4 } from 'uuid';

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  parsedData?: any;
  createdAt: Date;
  isArchived?: boolean;
  archivedAt?: Date;
}

export interface Candidate {
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
  createdAt: Date;
  isArchived?: boolean;
  archivedAt?: Date;
}

export interface Campaign {
  id: string;
  jobId: string;
  candidateId: string;
  message: string;
  status: 'draft' | 'sent' | 'replied';
  createdAt: Date;
  sentAt?: Date;
  isArchived?: boolean;
  archivedAt?: Date;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  connectionType: string;
}

export class DatabaseService {
  constructor() {
    console.log('🗄️ Database service initialized with Supabase');
  }

  // Job methods
  async getJobs(includeArchived: boolean = false): Promise<JobPosting[]> {
    try {
      let query = supabase
        .from(TABLES.JOBS)
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        parsedData: row.parsed_data,
        createdAt: new Date(row.created_at),
        isArchived: row.is_archived || false,
        archivedAt: row.archived_at ? new Date(row.archived_at) : undefined
      }));
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      return [];
    }
  }

  async addJob(job: Omit<JobPosting, 'id' | 'createdAt'>): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.JOBS)
        .insert({
          id: uuidv4(),
          title: job.title,
          description: job.description,
          parsed_data: job.parsedData,
          created_at: new Date().toISOString(),
          is_archived: false
        });

      if (error) throw error;
      console.log('✅ Job added to database');
    } catch (error) {
      console.error('❌ Error adding job:', error);
      throw error;
    }
  }

  async getJob(id: string): Promise<JobPosting | undefined> {
    try {
      const { data, error } = await supabase
        .from(TABLES.JOBS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        parsedData: data.parsed_data,
        createdAt: new Date(data.created_at),
        isArchived: data.is_archived || false,
        archivedAt: data.archived_at ? new Date(data.archived_at) : undefined
      };
    } catch (error) {
      console.error('❌ Error fetching job:', error);
      return undefined;
    }
  }

  async deleteJob(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.JOBS)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error deleting job from database:', error);
        throw new Error(`Failed to delete job: ${error.message}`);
      }
      
      console.log(`✅ Job deleted from database: ${id}`);
    } catch (error) {
      console.error('❌ Error in deleteJob:', error);
      throw error;
    }
  }

  async archiveJob(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.JOBS)
        .update({
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error archiving job from database:', error);
        throw new Error(`Failed to archive job: ${error.message}`);
      }
      
      console.log(`✅ Job archived in database: ${id}`);
    } catch (error) {
      console.error('❌ Error in archiveJob:', error);
      throw error;
    }
  }

  async unarchiveJob(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.JOBS)
        .update({
          is_archived: false,
          archived_at: null
        })
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error unarchiving job from database:', error);
        throw new Error(`Failed to unarchive job: ${error.message}`);
      }
      
      console.log(`✅ Job unarchived in database: ${id}`);
    } catch (error) {
      console.error('❌ Error in unarchiveJob:', error);
      throw error;
    }
  }

  // Candidate methods
  async getCandidates(includeArchived: boolean = false): Promise<Candidate[]> {
    try {
      let query = supabase
        .from(TABLES.CANDIDATES)
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        title: row.title,
        location: row.location,
        experience: row.experience,
        skills: row.skills,
        linkedin: row.linkedin,
        github: row.github,
        createdAt: new Date(row.created_at),
        isArchived: row.is_archived || false,
        archivedAt: row.archived_at ? new Date(row.archived_at) : undefined
      }));
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
      return [];
    }
  }

  async addCandidate(candidate: Omit<Candidate, 'id' | 'createdAt'>): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.CANDIDATES)
        .insert({
          id: uuidv4(),
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          title: candidate.title,
          location: candidate.location,
          experience: candidate.experience,
          skills: candidate.skills,
          linkedin: candidate.linkedin,
          github: candidate.github,
          created_at: new Date().toISOString(),
          is_archived: false
        });

      if (error) throw error;
      console.log('✅ Candidate added to database');
    } catch (error) {
      console.error('❌ Error adding candidate:', error);
      throw error;
    }
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CANDIDATES)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        title: data.title,
        location: data.location,
        experience: data.experience,
        skills: data.skills,
        linkedin: data.linkedin,
        github: data.github,
        createdAt: new Date(data.created_at),
        isArchived: data.is_archived || false,
        archivedAt: data.archived_at ? new Date(data.archived_at) : undefined
      };
    } catch (error) {
      console.error('❌ Error fetching candidate:', error);
      return undefined;
    }
  }

  async deleteCandidate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.CANDIDATES)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error deleting candidate from database:', error);
        throw new Error(`Failed to delete candidate: ${error.message}`);
      }
      
      console.log(`✅ Candidate deleted from database: ${id}`);
    } catch (error) {
      console.error('❌ Error in deleteCandidate:', error);
      throw error;
    }
  }

  async archiveCandidate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.CANDIDATES)
        .update({
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error archiving candidate from database:', error);
        throw new Error(`Failed to archive candidate: ${error.message}`);
      }
      
      console.log(`✅ Candidate archived in database: ${id}`);
    } catch (error) {
      console.error('❌ Error in archiveCandidate:', error);
      throw error;
    }
  }

  async unarchiveCandidate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.CANDIDATES)
        .update({
          is_archived: false,
          archived_at: null
        })
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error unarchiving candidate from database:', error);
        throw new Error(`Failed to unarchive candidate: ${error.message}`);
      }
      
      console.log(`✅ Candidate unarchived in database: ${id}`);
    } catch (error) {
      console.error('❌ Error in unarchiveCandidate:', error);
      throw error;
    }
  }

  // Campaign methods
  async getCampaigns(includeArchived: boolean = false): Promise<Campaign[]> {
    try {
      let query = supabase
        .from(TABLES.CAMPAIGNS)
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        jobId: row.job_id,
        candidateId: row.candidate_id,
        message: row.message,
        status: row.status,
        createdAt: new Date(row.created_at),
        sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
        isArchived: row.is_archived || false,
        archivedAt: row.archived_at ? new Date(row.archived_at) : undefined
      }));
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      return [];
    }
  }

  async addCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .insert({
          id: uuidv4(),
          job_id: campaign.jobId,
          candidate_id: campaign.candidateId,
          message: campaign.message,
          status: campaign.status,
          created_at: new Date().toISOString(),
          sent_at: campaign.sentAt?.toISOString(),
          is_archived: false
        });

      if (error) throw error;
      console.log('✅ Campaign added to database');
    } catch (error) {
      console.error('❌ Error adding campaign:', error);
      throw error;
    }
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.jobId) updateData.job_id = updates.jobId;
      if (updates.candidateId) updateData.candidate_id = updates.candidateId;
      if (updates.message) updateData.message = updates.message;
      if (updates.status) updateData.status = updates.status;
      if (updates.sentAt) updateData.sent_at = updates.sentAt.toISOString();

      const { error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Campaign updated in database');
    } catch (error) {
      console.error('❌ Error updating campaign:', error);
      throw error;
    }
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        jobId: data.job_id,
        candidateId: data.candidate_id,
        message: data.message,
        status: data.status,
        createdAt: new Date(data.created_at),
        sentAt: data.sent_at ? new Date(data.sent_at) : undefined
      };
    } catch (error) {
      console.error('❌ Error fetching campaign:', error);
      return undefined;
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error deleting campaign from database:', error);
        throw new Error(`Failed to delete campaign: ${error.message}`);
      }
      
      console.log(`✅ Campaign deleted from database: ${id}`);
    } catch (error) {
      console.error('❌ Error in deleteCampaign:', error);
      throw error;
    }
  }

  async archiveCampaign(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .update({
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error archiving campaign from database:', error);
        throw new Error(`Failed to archive campaign: ${error.message}`);
      }
      
      console.log(`✅ Campaign archived in database: ${id}`);
    } catch (error) {
      console.error('❌ Error in archiveCampaign:', error);
      throw error;
    }
  }

  async unarchiveCampaign(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.CAMPAIGNS)
        .update({
          is_archived: false,
          archived_at: null
        })
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error unarchiving campaign from database:', error);
        throw new Error(`Failed to unarchive campaign: ${error.message}`);
      }
      
      console.log(`✅ Campaign unarchived in database: ${id}`);
    } catch (error) {
      console.error('❌ Error in unarchiveCampaign:', error);
      throw error;
    }
  }

  // Email config methods
  async getEmailConfig(): Promise<EmailConfig | undefined> {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMAIL_CONFIG)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        host: data.host,
        port: data.port,
        secure: data.secure,
        auth: {
          user: data.auth_user,
          pass: data.auth_pass
        },
        connectionType: data.connection_type
      };
    } catch (error) {
      console.error('❌ Error fetching email config:', error);
      return undefined;
    }
  }

  async setEmailConfig(config: EmailConfig): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.EMAIL_CONFIG)
        .insert({
          id: uuidv4(),
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth_user: config.auth.user,
          auth_pass: config.auth.pass,
          connection_type: config.connectionType,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('✅ Email config saved to database');
    } catch (error) {
      console.error('❌ Error saving email config:', error);
      throw error;
    }
  }

  // Analytics methods
  async getAnalytics(): Promise<{
    totalJobs: number;
    totalCandidates: number;
    totalCampaigns: number;
    responseRate: string;
  }> {
    try {
      const [jobs, candidates, campaigns] = await Promise.all([
        this.getJobs(),
        this.getCandidates(),
        this.getCampaigns()
      ]);

      const totalJobs = jobs.length;
      const totalCandidates = candidates.length;
      const totalCampaigns = campaigns.length;

      const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
      const repliedCampaigns = campaigns.filter(c => c.status === 'replied').length;

      let responseRate = '0%';
      if (sentCampaigns > 0) {
        const rate = (repliedCampaigns / sentCampaigns) * 100;
        responseRate = `${rate.toFixed(1)}%`;
      }

      return {
        totalJobs,
        totalCandidates,
        totalCampaigns,
        responseRate
      };
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      return {
        totalJobs: 0,
        totalCandidates: 0,
        totalCampaigns: 0,
        responseRate: '0%'
      };
    }
  }

  // Export methods
  async exportCampaignsCSV(): Promise<string> {
    try {
      const campaigns = await this.getCampaigns();
      const headers = ['ID', 'Job Title', 'Candidate Name', 'Status', 'Created', 'Sent', 'Message'];
      
      const rows = await Promise.all(
        campaigns.map(async (campaign) => {
          const job = await this.getJob(campaign.jobId);
          const candidate = await this.getCandidate(campaign.candidateId);

          return [
            campaign.id,
            job?.title || 'Unknown',
            candidate?.name || 'Unknown',
            campaign.status,
            new Date(campaign.createdAt).toISOString(),
            campaign.sentAt ? new Date(campaign.sentAt).toISOString() : '',
            `"${campaign.message.replace(/"/g, '""')}"` // Escape quotes in CSV
          ].join(',');
        })
      );

      return [headers.join(','), ...rows].join('\n');
    } catch (error) {
      console.error('❌ Error exporting campaigns:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(TABLES.JOBS)
        .select('count', { count: 'exact', head: true });

      return !error;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();
