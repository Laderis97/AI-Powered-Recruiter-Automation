// src/emailService.ts

import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Check if email configuration is available
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailHost && emailPort && emailUser && emailPass) {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort),
        secure: parseInt(emailPort) === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      this.isConfigured = true;
      console.log('✅ Email service configured successfully');
    } else {
      console.log('⚠️ Email service not configured - missing environment variables');
      console.log('   Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS to enable email sending');
    }
  }

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        error: 'Email service not configured. Please set up email environment variables.'
      };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html || message.text.replace(/\n/g, '<br>'),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${message.to}:`, info.messageId);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendOutreachEmail(candidateEmail: string, candidateName: string, message: string, jobTitle: string): Promise<{ success: boolean; error?: string }> {
    const subject = `Exciting Opportunity: ${jobTitle} Position`;
    
    return this.sendEmail({
      to: candidateEmail,
      subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });
  }

  isEmailConfigured(): boolean {
    return this.isConfigured;
  }

  getConfigurationStatus(): { configured: boolean; missingVars: string[] } {
    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    return {
      configured: this.isConfigured,
      missingVars
    };
  }
}

// Export a singleton instance
export const emailService = new EmailService();
