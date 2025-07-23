/**
 * Cursor AI Recruiter - Main Orchestration
 * Complete end-to-end recruiting automation workflow
 */

import { config } from 'dotenv';
import { runSalesforcePoller } from './workflows/poll_salesforce';
import { runJobParser } from './workflows/parse_job';
import { runLinkedInScraper } from './workflows/scrape_linkedin';
import { runOutreachGenerator } from './workflows/generate_outreach';
import { runMessageSender } from './workflows/send_messages';

// Load environment variables
config();

interface RecruitingMetrics {
  jobsProcessed: number;
  candidatesFound: number;
  messagesGenerated: number;
  messagesSent: number;
  successRate: number;
  avgPersonalizationScore: number;
  executionTime: number;
}

class AIRecruiterOrchestrator {
  private metrics: RecruitingMetrics = {
    jobsProcessed: 0,
    candidatesFound: 0,
    messagesGenerated: 0,
    messagesSent: 0,
    successRate: 0,
    avgPersonalizationScore: 0,
    executionTime: 0
  };

  async runFullWorkflow(): Promise<RecruitingMetrics> {
    const startTime = Date.now();
    
    console.log('🚀 Starting AI Recruiter Workflow');
    console.log('═'.repeat(50));

    try {
      // Step 1: Poll Salesforce for new jobs
      console.log('📋 Step 1: Polling Salesforce for new job postings...');
      const jobs = await runSalesforcePoller();
      
      if (jobs.length === 0) {
        console.log('ℹ️ No new jobs found. Workflow complete.');
        return this.metrics;
      }

      this.metrics.jobsProcessed = jobs.length;
      console.log(`✅ Found ${jobs.length} new job(s) to process`);

      // Step 2: Parse job descriptions
      console.log('\n🤖 Step 2: Parsing job descriptions with AI...');
      const jobDescriptions = jobs.map(job => job.description);
      const parsedJobs = await runJobParser(jobDescriptions);
      
      console.log(`✅ Successfully parsed ${parsedJobs.length} job description(s)`);

      // Step 3: Search for candidates on LinkedIn
      console.log('\n🔍 Step 3: Searching LinkedIn for qualified candidates...');
      
      let allCandidates: any[] = [];
      
      for (const parsedJob of parsedJobs) {
        console.log(`\n🎯 Searching candidates for: ${parsedJob.jobTitle}`);
        
        const candidates = await runLinkedInScraper(
          parsedJob.jobTitle,
          parsedJob.requiredSkills,
          parsedJob.preferredLocation !== 'Not specified' ? parsedJob.preferredLocation : undefined
        );
        
        // Add job context to candidates
        const candidatesWithJob = candidates.map(candidate => ({
          ...candidate,
          targetJob: parsedJob,
          originalJobPosting: jobs.find(job => job.description === jobDescriptions[parsedJobs.indexOf(parsedJob)])
        }));
        
        allCandidates.push(...candidatesWithJob);
        
        console.log(`📊 Found ${candidates.length} candidates for ${parsedJob.jobTitle}`);
        
        // Rate limiting between job searches
        if (parsedJobs.indexOf(parsedJob) < parsedJobs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      this.metrics.candidatesFound = allCandidates.length;
      console.log(`\n✅ Total candidates found: ${allCandidates.length}`);

      if (allCandidates.length === 0) {
        console.log('ℹ️ No candidates found. Workflow complete.');
        return this.metrics;
      }

      // Step 4: Generate personalized outreach messages
      console.log('\n💬 Step 4: Generating personalized outreach messages...');
      
      let allOutreachResults: any[] = [];

      // Group candidates by job
      const candidatesByJob = allCandidates.reduce((acc, candidate) => {
        const jobTitle = candidate.targetJob.jobTitle;
        if (!acc[jobTitle]) acc[jobTitle] = [];
        acc[jobTitle].push(candidate);
        return acc;
      }, {} as Record<string, any[]>);

      for (const [jobTitle, jobCandidates] of Object.entries(candidatesByJob)) {
        console.log(`\n✍️ Generating outreach for ${jobCandidates.length} candidates for ${jobTitle}...`);
        
        const targetJob = jobCandidates[0].targetJob;
        const jobData = {
          ...targetJob,
          company: process.env.COMPANY_NAME || 'Our Company'
        };

        const candidateData = jobCandidates.map(candidate => ({
          name: candidate.name,
          title: candidate.title,
          skills: candidate.skills,
          experience: candidate.experience.map((exp: any) => exp.duration).join(', ') || 'Not specified',
          location: candidate.location,
          profileUrl: candidate.profileUrl
        }));

        const outreachResults = await runOutreachGenerator(candidateData, jobData);
        allOutreachResults.push(...outreachResults);
      }

      this.metrics.messagesGenerated = allOutreachResults.length;
      console.log(`\n✅ Generated ${allOutreachResults.length} personalized outreach messages`);

      // Step 5: Send messages
      console.log('\n📤 Step 5: Sending outreach messages...');
      
      // Prepare message delivery data
      const messagesToSend = allOutreachResults.map(result => ({
        candidate: {
          name: result.candidate.name,
          email: undefined, // Would need to be enriched from another source
          linkedinUrl: result.candidate.profileUrl
        },
        outreach: result.outreach
      }));

      const deliveryResults = await runMessageSender(messagesToSend, 'linkedin');
      
      const sentMessages = deliveryResults.filter(result => result.status === 'sent');
      this.metrics.messagesSent = sentMessages.length;
      this.metrics.successRate = (sentMessages.length / deliveryResults.length) * 100;
      
      // Calculate average personalization score
      this.metrics.avgPersonalizationScore = sentMessages.reduce(
        (sum, result) => sum + result.outreach.personalizationScore, 0
      ) / sentMessages.length;

      console.log(`\n✅ Successfully sent ${sentMessages.length}/${deliveryResults.length} messages`);

      // Final metrics
      this.metrics.executionTime = (Date.now() - startTime) / 1000;
      
      console.log('\n🎉 AI Recruiter Workflow Complete!');
      console.log('═'.repeat(50));
      this.printMetrics();

      return this.metrics;

    } catch (error) {
      console.error('❌ Workflow failed:', error);
      throw error;
    }
  }

  private printMetrics(): void {
    console.log('\n📊 Workflow Metrics:');
    console.log(`• Jobs Processed: ${this.metrics.jobsProcessed}`);
    console.log(`• Candidates Found: ${this.metrics.candidatesFound}`);
    console.log(`• Messages Generated: ${this.metrics.messagesGenerated}`);
    console.log(`• Messages Sent: ${this.metrics.messagesSent}`);
    console.log(`• Success Rate: ${this.metrics.successRate.toFixed(1)}%`);
    console.log(`• Avg Personalization: ${this.metrics.avgPersonalizationScore.toFixed(1)}%`);
    console.log(`• Execution Time: ${this.metrics.executionTime.toFixed(1)}s`);
  }

  async runTargetedWorkflow(
    jobDescription: string,
    targetSkills: string[],
    location?: string
  ): Promise<void> {
    console.log('🎯 Starting Targeted Recruiting Workflow');
    console.log('═'.repeat(50));

    try {
      // Parse the provided job description
      console.log('🤖 Parsing job description...');
      const [parsedJob] = await runJobParser([jobDescription]);
      
      // Search for candidates
      console.log('🔍 Searching for candidates...');
      const candidates = await runLinkedInScraper(
        parsedJob.jobTitle,
        targetSkills,
        location
      );

      if (candidates.length === 0) {
        console.log('ℹ️ No candidates found.');
        return;
      }

      // Generate outreach
      console.log('💬 Generating outreach messages...');
      const candidateData = candidates.map(candidate => ({
        name: candidate.name,
        title: candidate.title,
        skills: candidate.skills,
        experience: candidate.experience.map((exp: any) => exp.duration).join(', ') || 'Not specified',
        location: candidate.location,
        profileUrl: candidate.profileUrl
      }));

      const jobData = {
        ...parsedJob,
        company: process.env.COMPANY_NAME || 'Our Company'
      };

      const outreachResults = await runOutreachGenerator(candidateData, jobData);

      // Display results without sending
      console.log('\n✅ Generated outreach messages:');
      console.log('═'.repeat(50));
      
      outreachResults.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.candidate.name} (${result.candidate.title})`);
        console.log(`   Personalization: ${result.outreach.personalizationScore}%`);
        console.log(`   Message: ${result.outreach.message}`);
        console.log('   ' + '─'.repeat(40));
      });

    } catch (error) {
      console.error('❌ Targeted workflow failed:', error);
      throw error;
    }
  }
}

// CLI Interface
async function main(): Promise<void> {
  const orchestrator = new AIRecruiterOrchestrator();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AI Recruiter Usage:
  npm start                           # Run full workflow (Salesforce → LinkedIn → Outreach)
  npm run targeted [job] [skills]     # Run targeted search for specific role
  npm run test                        # Run test suite
  
Environment Setup:
  1. Copy .env.example to .env
  2. Fill in your API keys and credentials
  3. Run: npm start
    `);
    return;
  }

  if (args.includes('--targeted')) {
    // Targeted workflow example
    const jobDescription = args[1] || "Senior Software Engineer with React and Node.js experience";
    const skills = args[2]?.split(',') || ['React', 'Node.js', 'TypeScript'];
    const location = args[3];
    
    await orchestrator.runTargetedWorkflow(jobDescription, skills, location);
  } else {
    // Full workflow
    await orchestrator.runFullWorkflow();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { AIRecruiterOrchestrator };