// src/storage.ts

import fs from 'fs-extra';
import path from 'path';

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  parsedData?: any;
  createdAt: Date;
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
}

export interface Campaign {
  id: string;
  jobId: string;
  candidateId: string;
  message: string;
  status: 'draft' | 'sent' | 'replied';
  createdAt: Date;
  sentAt?: Date;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface AppData {
  jobs: JobPosting[];
  candidates: Candidate[];
  campaigns: Campaign[];
  emailConfig?: EmailConfig;
}

export class StorageService {
  private dataPath: string;
  private data: AppData;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'app-data.json');
    this.data = {
      jobs: [],
      candidates: [],
      campaigns: [],
      emailConfig: undefined,
    };
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.ensureDir(path.dirname(this.dataPath));

      // Load existing data if it exists
      if (await fs.pathExists(this.dataPath)) {
        const fileData = await fs.readJson(this.dataPath);
        this.data = {
          jobs: fileData.jobs || [],
          candidates: fileData.candidates || [],
          campaigns: fileData.campaigns || [],
          emailConfig: fileData.emailConfig || undefined,
        };
        console.log('✅ Data loaded from storage');
      } else {
        // Create initial data file
        await this.saveData();
        console.log('✅ New data storage initialized');
      }
    } catch (error) {
      console.error('❌ Error initializing storage:', error);
      // Continue with empty data if storage fails
    }
  }

  private async saveData(): Promise<void> {
    try {
      await fs.writeJson(this.dataPath, this.data, { spaces: 2 });
    } catch (error) {
      console.error('❌ Error saving data:', error);
    }
  }

  // Job methods
  async getJobs(): Promise<JobPosting[]> {
    return this.data.jobs;
  }

  async addJob(job: JobPosting): Promise<void> {
    this.data.jobs.push(job);
    await this.saveData();
  }

  async getJob(id: string): Promise<JobPosting | undefined> {
    return this.data.jobs.find(job => job.id === id);
  }

  // Candidate methods
  async getCandidates(): Promise<Candidate[]> {
    return this.data.candidates;
  }

  async addCandidate(candidate: Candidate): Promise<void> {
    this.data.candidates.push(candidate);
    await this.saveData();
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    return this.data.candidates.find(candidate => candidate.id === id);
  }

  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return this.data.campaigns;
  }

  async addCampaign(campaign: Campaign): Promise<void> {
    this.data.campaigns.push(campaign);
    await this.saveData();
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    const campaignIndex = this.data.campaigns.findIndex(c => c.id === id);
    if (campaignIndex !== -1) {
      this.data.campaigns[campaignIndex] = {
        ...this.data.campaigns[campaignIndex],
        ...updates,
      };
      await this.saveData();
    }
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.data.campaigns.find(campaign => campaign.id === id);
  }

  // Email config methods
  async getEmailConfig(): Promise<EmailConfig | undefined> {
    return this.data.emailConfig;
  }

  async setEmailConfig(config: EmailConfig): Promise<void> {
    this.data.emailConfig = config;
    await this.saveData();
  }

  // Analytics methods
  async getAnalytics(): Promise<{
    totalJobs: number;
    totalCandidates: number;
    totalCampaigns: number;
    responseRate: string;
  }> {
    const totalJobs = this.data.jobs.length;
    const totalCandidates = this.data.candidates.length;
    const totalCampaigns = this.data.campaigns.length;

    const sentCampaigns = this.data.campaigns.filter(
      c => c.status === 'sent'
    ).length;
    const repliedCampaigns = this.data.campaigns.filter(
      c => c.status === 'replied'
    ).length;

    let responseRate = '0%';
    if (sentCampaigns > 0) {
      const rate = (repliedCampaigns / sentCampaigns) * 100;
      responseRate = `${rate.toFixed(1)}%`;
    }

    return {
      totalJobs,
      totalCandidates,
      totalCampaigns,
      responseRate,
    };
  }

  // Export methods
  async exportCampaignsCSV(): Promise<string> {
    const headers = [
      'ID',
      'Job Title',
      'Candidate Name',
      'Status',
      'Created',
      'Sent',
      'Message',
    ];
    const rows = await Promise.all(
      this.data.campaigns.map(async campaign => {
        const job = await this.getJob(campaign.jobId);
        const candidate = await this.getCandidate(campaign.candidateId);

        return [
          campaign.id,
          job?.title || 'Unknown',
          candidate?.name || 'Unknown',
          campaign.status,
          new Date(campaign.createdAt).toISOString(),
          campaign.sentAt ? new Date(campaign.sentAt).toISOString() : '',
          `"${campaign.message.replace(/"/g, '""')}"`, // Escape quotes in CSV
        ].join(',');
      })
    );

    return [headers.join(','), ...rows].join('\n');
  }

  // Backup and restore methods
  async createBackup(): Promise<string> {
    const backupPath = path.join(
      process.cwd(),
      'data',
      `backup-${Date.now()}.json`
    );
    await fs.writeJson(backupPath, this.data, { spaces: 2 });
    return backupPath;
  }

  async restoreFromBackup(backupPath: string): Promise<void> {
    const backupData = await fs.readJson(backupPath);
    this.data = backupData;
    await this.saveData();
  }
}

// Export a singleton instance
export const storageService = new StorageService();
