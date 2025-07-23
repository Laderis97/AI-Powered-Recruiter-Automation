/**
 * Salesforce Job Polling Workflow
 * Polls Salesforce for new job postings and returns structured job data
 */

import jsforce from 'jsforce';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  hiringManager: string;
  status: string;
  createdDate: Date;
  urgency: 'Low' | 'Medium' | 'High';
}

interface SalesforceConfig {
  username: string;
  password: string;
  securityToken: string;
  loginUrl?: string;
}

export class SalesforceJobPoller {
  private conn: jsforce.Connection;
  private config: SalesforceConfig;

  constructor(config: SalesforceConfig) {
    this.config = config;
    this.conn = new jsforce.Connection({
      loginUrl: config.loginUrl || 'https://login.salesforce.com'
    });
  }

  async authenticate(): Promise<void> {
    try {
      await this.conn.login(
        this.config.username, 
        this.config.password + this.config.securityToken
      );
      console.log('✅ Successfully authenticated with Salesforce');
    } catch (error) {
      console.error('❌ Salesforce authentication failed:', error);
      throw error;
    }
  }

  async pollNewJobs(lastPollTime?: Date): Promise<JobPosting[]> {
    try {
      await this.authenticate();

      const dateFilter = lastPollTime 
        ? `CreatedDate > ${lastPollTime.toISOString()}` 
        : `CreatedDate = TODAY`;

      // Query for new job postings
      const query = `
        SELECT 
          Id,
          Name,
          Description__c,
          Department__c,
          Location__c,
          Hiring_Manager__c,
          Status__c,
          CreatedDate,
          Urgency__c
        FROM Job_Posting__c 
        WHERE ${dateFilter}
        AND Status__c IN ('Open', 'Urgent')
        ORDER BY CreatedDate DESC
      `;

      const result = await this.conn.query(query);
      
      console.log(`📊 Found ${result.totalSize} new job postings`);

      return result.records.map(this.transformJobRecord);
    } catch (error) {
      console.error('❌ Failed to poll Salesforce jobs:', error);
      throw error;
    }
  }

  async updateJobStatus(jobId: string, status: string, notes?: string): Promise<void> {
    try {
      await this.conn.sobject('Job_Posting__c').update({
        Id: jobId,
        Status__c: status,
        ...(notes && { Recruiter_Notes__c: notes })
      });
      
      console.log(`✅ Updated job ${jobId} status to ${status}`);
    } catch (error) {
      console.error(`❌ Failed to update job ${jobId}:`, error);
      throw error;
    }
  }

  private transformJobRecord(record: any): JobPosting {
    return {
      id: record.Id,
      title: record.Name,
      description: record.Description__c || '',
      department: record.Department__c || '',
      location: record.Location__c || '',
      hiringManager: record.Hiring_Manager__c || '',
      status: record.Status__c,
      createdDate: new Date(record.CreatedDate),
      urgency: record.Urgency__c || 'Medium'
    };
  }

  async getJobDetails(jobId: string): Promise<JobPosting | null> {
    try {
      const query = `
        SELECT 
          Id,
          Name,
          Description__c,
          Department__c,
          Location__c,
          Hiring_Manager__c,
          Status__c,
          CreatedDate,
          Urgency__c
        FROM Job_Posting__c 
        WHERE Id = '${jobId}'
      `;

      const result = await this.conn.query(query);
      
      if (result.totalSize === 0) {
        return null;
      }

      return this.transformJobRecord(result.records[0]);
    } catch (error) {
      console.error(`❌ Failed to get job details for ${jobId}:`, error);
      throw error;
    }
  }
}

// Usage Example
export async function runSalesforcePoller(): Promise<JobPosting[]> {
  const config: SalesforceConfig = {
    username: process.env.SALESFORCE_USERNAME!,
    password: process.env.SALESFORCE_PASSWORD!,
    securityToken: process.env.SALESFORCE_TOKEN!
  };

  const poller = new SalesforceJobPoller(config);
  
  try {
    // Poll for jobs created in the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const newJobs = await poller.pollNewJobs(yesterday);
    
    console.log(`🔍 Processing ${newJobs.length} new job postings`);
    
    return newJobs;
  } catch (error) {
    console.error('❌ Salesforce polling workflow failed:', error);
    throw error;
  }
}