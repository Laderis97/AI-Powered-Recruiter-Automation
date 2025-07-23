/**
 * Message Sending Workflow
 * Handles automated delivery of outreach messages across platforms
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import nodemailer from 'nodemailer';
import { setTimeout } from 'timers/promises';

interface OutreachMessage {
  subject: string;
  message: string;
  tone: 'casual' | 'professional' | 'formal' | 'executive';
  characterCount: number;
  personalizationScore: number;
}

interface CandidateContact {
  name: string;
  email?: string;
  linkedinUrl?: string;
  profileUrl?: string;
}

interface MessageDelivery {
  candidate: CandidateContact;
  outreach: OutreachMessage;
  platform: 'email' | 'linkedin' | 'both';
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  sentAt?: Date;
  errorMessage?: string;
  messageId?: string;
}

interface SendingConfig {
  email?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    fromName: string;
    fromEmail: string;
  };
  linkedin?: {
    sessionCookie: string;
    headless?: boolean;
    dailyLimit?: number;
  };
  rateLimiting?: {
    delayBetweenMessages: number;
    maxConcurrent: number;
  };
}

export class MessageSender {
  private browser: Browser | null = null;
  private emailTransporter: nodemailer.Transporter | null = null;
  private config: SendingConfig;
  private sentToday: number = 0;

  constructor(config: SendingConfig) {
    this.config = config;
    this.initializeTransporters();
  }

  private async initializeTransporters(): Promise<void> {
    // Initialize email transporter
    if (this.config.email) {
      this.emailTransporter = nodemailer.createTransporter(this.config.email);
      console.log('✅ Email transporter initialized');
    }

    // Initialize browser for LinkedIn
    if (this.config.linkedin) {
      this.browser = await puppeteer.launch({
        headless: this.config.linkedin.headless ?? true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled'
        ]
      });
      console.log('✅ LinkedIn browser initialized');
    }
  }

  async sendMessage(delivery: MessageDelivery): Promise<MessageDelivery> {
    try {
      switch (delivery.platform) {
        case 'email':
          return await this.sendEmail(delivery);
        case 'linkedin':
          return await this.sendLinkedInMessage(delivery);
        case 'both':
          return await this.sendBothPlatforms(delivery);
        default:
          throw new Error(`Unsupported platform: ${delivery.platform}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send message to ${delivery.candidate.name}:`, error);
      return {
        ...delivery,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendEmail(delivery: MessageDelivery): Promise<MessageDelivery> {
    if (!this.emailTransporter || !delivery.candidate.email) {
      throw new Error('Email not configured or candidate email missing');
    }

    const mailOptions = {
      from: `${this.config.email!.fromName} <${this.config.email!.fromEmail}>`,
      to: delivery.candidate.email,
      subject: delivery.outreach.subject,
      text: delivery.outreach.message,
      html: this.formatEmailHTML(delivery.outreach.message, delivery.candidate.name)
    };

    const info = await this.emailTransporter.sendMail(mailOptions);
    
    console.log(`📧 Email sent to ${delivery.candidate.name}: ${info.messageId}`);

    return {
      ...delivery,
      status: 'sent',
      sentAt: new Date(),
      messageId: info.messageId
    };
  }

  private async sendLinkedInMessage(delivery: MessageDelivery): Promise<MessageDelivery> {
    if (!this.browser || !delivery.candidate.linkedinUrl) {
      throw new Error('LinkedIn not configured or profile URL missing');
    }

    // Check daily limit
    const dailyLimit = this.config.linkedin?.dailyLimit || 50;
    if (this.sentToday >= dailyLimit) {
      throw new Error('Daily LinkedIn message limit reached');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set LinkedIn session
      await this.setLinkedInSession(page);

      // Navigate to candidate profile
      await page.goto(delivery.candidate.linkedinUrl, { waitUntil: 'networkidle2' });

      // Find and click message button
      await page.waitForSelector('[data-control-name="topcard_message"]', { timeout: 10000 });
      await page.click('[data-control-name="topcard_message"]');

      // Wait for message modal
      await page.waitForSelector('.msg-form__contenteditable', { timeout: 5000 });

      // Type the message
      await page.click('.msg-form__contenteditable');
      await page.type('.msg-form__contenteditable', delivery.outreach.message);

      // Send the message
      await page.click('[data-control-name="send"]');

      // Wait for confirmation
      await page.waitForTimeout(2000);

      this.sentToday++;
      console.log(`💼 LinkedIn message sent to ${delivery.candidate.name}`);

      return {
        ...delivery,
        status: 'sent',
        sentAt: new Date()
      };

    } finally {
      await page.close();
    }
  }

  private async sendBothPlatforms(delivery: MessageDelivery): Promise<MessageDelivery> {
    let emailResult: MessageDelivery | null = null;
    let linkedinResult: MessageDelivery | null = null;

    // Try email first
    if (delivery.candidate.email) {
      try {
        emailResult = await this.sendEmail({
          ...delivery,
          platform: 'email'
        });
      } catch (error) {
        console.warn(`⚠️ Email failed for ${delivery.candidate.name}, trying LinkedIn`);
      }
    }

    // Try LinkedIn if email failed or unavailable
    if ((!emailResult || emailResult.status === 'failed') && delivery.candidate.linkedinUrl) {
      try {
        linkedinResult = await this.sendLinkedInMessage({
          ...delivery,
          platform: 'linkedin'
        });
      } catch (error) {
        console.warn(`⚠️ LinkedIn failed for ${delivery.candidate.name}`);
      }
    }

    // Return best result
    if (emailResult?.status === 'sent') return emailResult;
    if (linkedinResult?.status === 'sent') return linkedinResult;
    
    return {
      ...delivery,
      status: 'failed',
      errorMessage: 'Failed on both email and LinkedIn'
    };
  }

  private async setLinkedInSession(page: Page): Promise<void> {
    if (!this.config.linkedin?.sessionCookie) {
      throw new Error('LinkedIn session cookie not configured');
    }

    await page.setCookie({
      name: 'li_at',
      value: this.config.linkedin.sessionCookie,
      domain: '.linkedin.com',
      path: '/',
      httpOnly: true,
      secure: true
    });
  }

  private formatEmailHTML(message: string, candidateName: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <p>${message.replace(/\n/g, '<br>')}</p>
            <br>
            <p style="color: #666; font-size: 12px;">
              This message was sent via our automated recruiting platform.
              If you'd prefer not to receive these messages, please let us know.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  async batchSendMessages(deliveries: MessageDelivery[]): Promise<MessageDelivery[]> {
    console.log(`📤 Batch sending ${deliveries.length} messages`);

    const results: MessageDelivery[] = [];
    const concurrency = this.config.rateLimiting?.maxConcurrent || 3;
    const delay = this.config.rateLimiting?.delayBetweenMessages || 5000;

    // Process in batches with concurrency control
    for (let i = 0; i < deliveries.length; i += concurrency) {
      const batch = deliveries.slice(i, i + concurrency);

      const batchPromises = batch.map(delivery => this.sendMessage(delivery));
      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('❌ Batch message sending failed:', result.reason);
        }
      }

      // Rate limiting delay between batches
      if (i + concurrency < deliveries.length) {
        console.log(`⏳ Waiting ${delay}ms before next batch...`);
        await setTimeout(delay);
      }
    }

    // Generate sending report
    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    console.log(`📊 Sending complete: ${sent} sent, ${failed} failed`);

    return results;
  }

  async scheduleMessages(
    deliveries: MessageDelivery[],
    scheduleDate: Date
  ): Promise<MessageDelivery[]> {
    const now = new Date();
    const delay = scheduleDate.getTime() - now.getTime();

    if (delay <= 0) {
      throw new Error('Schedule date must be in the future');
    }

    console.log(`⏰ Scheduling ${deliveries.length} messages for ${scheduleDate.toISOString()}`);

    // Mark as scheduled
    const scheduledDeliveries = deliveries.map(delivery => ({
      ...delivery,
      status: 'scheduled' as const
    }));

    // Set timeout for future sending
    setTimeout(async () => {
      console.log(`🚀 Executing scheduled message batch`);
      await this.batchSendMessages(scheduledDeliveries);
    }, delay);

    return scheduledDeliveries;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    if (this.emailTransporter) {
      this.emailTransporter.close();
      this.emailTransporter = null;
    }

    console.log('✅ Message sender closed');
  }

  // Analytics and tracking
  generateSendingReport(deliveries: MessageDelivery[]): {
    totalSent: number;
    totalFailed: number;
    successRate: number;
    platformBreakdown: Record<string, number>;
    avgPersonalizationScore: number;
  } {
    const sent = deliveries.filter(d => d.status === 'sent');
    const failed = deliveries.filter(d => d.status === 'failed');

    const platformBreakdown: Record<string, number> = {};
    sent.forEach(d => {
      platformBreakdown[d.platform] = (platformBreakdown[d.platform] || 0) + 1;
    });

    const avgPersonalizationScore = sent.reduce(
      (sum, d) => sum + d.outreach.personalizationScore, 0
    ) / sent.length;

    return {
      totalSent: sent.length,
      totalFailed: failed.length,
      successRate: (sent.length / deliveries.length) * 100,
      platformBreakdown,
      avgPersonalizationScore
    };
  }
}

// Usage Example
export async function runMessageSender(
  candidates: Array<{
    candidate: CandidateContact;
    outreach: OutreachMessage;
  }>,
  platform: 'email' | 'linkedin' | 'both' = 'both'
): Promise<MessageDelivery[]> {
  const config: SendingConfig = {
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!
      },
      fromName: process.env.FROM_NAME || 'Recruiter',
      fromEmail: process.env.FROM_EMAIL!
    },
    linkedin: {
      sessionCookie: process.env.LINKEDIN_SESSION_COOKIE!,
      headless: true,
      dailyLimit: 50
    },
    rateLimiting: {
      delayBetweenMessages: 5000,
      maxConcurrent: 3
    }
  };

  const sender = new MessageSender(config);
  
  try {
    const deliveries: MessageDelivery[] = candidates.map(({ candidate, outreach }) => ({
      candidate,
      outreach,
      platform,
      status: 'pending'
    }));

    const results = await sender.batchSendMessages(deliveries);
    
    const report = sender.generateSendingReport(results);
    console.log(`📈 Sending Report:`, report);
    
    return results;
  } catch (error) {
    console.error('❌ Message sending workflow failed:', error);
    throw error;
  } finally {
    await sender.close();
  }
}