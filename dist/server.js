// src/server.ts
import express from 'express';
import multer from 'multer';
import * as dotenv from 'dotenv';
import { documentParser } from './documentParser.js';
import { parseJobDescription } from './openai.js';
import { databaseService } from './databaseService.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
// Add access control middleware
function checkAccess(req, res, next) {
    const accessToken = process.env.ACCESS_TOKEN;
    // If no access token is set, allow public access
    if (!accessToken) {
        return next();
    }
    // Check for token in query parameter or header
    const providedToken = req.query.token || req.headers['x-access-token'];
    if (providedToken === accessToken) {
        return next();
    }
    // If token doesn't match, show access denied
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Access denied' });
    }
    // For web routes, show a simple access form
    if (req.path === '/') {
        return res.send(`
      <html>
        <head><title>Access Required</title></head>
        <body>
          <h2>Access Required</h2>
          <form method="GET">
            <input type="password" name="token" placeholder="Enter access token" required>
            <button type="submit">Access Application</button>
          </form>
        </body>
      </html>
    `);
    }
    res.status(401).send('Access denied');
}
// Apply access control to all routes
app.use(checkAccess);
// Multer configuration for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, documentParser.getUploadDir());
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Allow only specific file types
        if (file.mimetype === 'text/plain' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword') {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only .txt, .docx, and .doc files are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
// Routes
app.get('/', async (req, res) => {
    try {
        const analytics = await databaseService.getAnalytics();
        res.render('index', {
            jobsCount: analytics.totalJobs,
            candidatesCount: analytics.totalCandidates,
            campaignsCount: analytics.totalCampaigns
        });
    }
    catch (error) {
        console.error('Error rendering dashboard:', error);
        res.render('index', {
            jobsCount: 0,
            candidatesCount: 0,
            campaignsCount: 0
        });
    }
});
// API Routes
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const candidate = await documentParser.parseDocument(req.file.path, req.file.originalname);
        // Create candidate object using the new database service
        const newCandidate = await databaseService.createCandidate({
            name: candidate.name,
            email: candidate.email || '',
            phone: candidate.phone || '',
            title: candidate.title || 'Unknown',
            location: candidate.location || 'Unknown',
            experience: candidate.experience || 'Unknown',
            skills: candidate.skills || [],
            education: candidate.education || [],
            currentCompany: candidate.currentCompany || '',
            linkedin: candidate.linkedin || '',
            github: candidate.github || '',
            portfolio: candidate.portfolio || '',
            summary: candidate.summary || ''
        });
        res.json({
            success: true,
            candidate: newCandidate,
            message: `Resume parsed successfully! Added candidate: ${candidate.name}`
        });
    }
    catch (error) {
        console.error('Error parsing resume:', error);
        res.status(500).json({
            error: 'Failed to parse resume',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.post('/api/upload-multiple-resumes', upload.array('resumes', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const candidates = [];
        const errors = [];
        for (const file of req.files) {
            try {
                const candidate = await documentParser.parseDocument(file.path, file.originalname);
                const newCandidate = await databaseService.createCandidate({
                    name: candidate.name,
                    email: candidate.email || '',
                    phone: candidate.phone || '',
                    title: candidate.title || 'Unknown',
                    location: candidate.location || 'Unknown',
                    experience: candidate.experience || 'Unknown',
                    skills: candidate.skills || [],
                    education: candidate.education || [],
                    currentCompany: candidate.currentCompany || '',
                    linkedin: candidate.linkedin || '',
                    github: candidate.github || '',
                    portfolio: candidate.portfolio || '',
                    summary: candidate.summary || ''
                });
                candidates.push(newCandidate);
            }
            catch (error) {
                errors.push(`${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        res.json({
            success: true,
            candidates,
            errors: errors.length > 0 ? errors : undefined,
            message: `Successfully parsed ${candidates.length} resumes${errors.length > 0 ? ` (${errors.length} failed)` : ''}`
        });
    }
    catch (error) {
        console.error('Error parsing multiple resumes:', error);
        res.status(500).json({
            error: 'Failed to parse resumes',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.get('/api/candidates', async (req, res) => {
    try {
        const candidates = await databaseService.getAllCandidates();
        res.json(candidates);
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
});
app.get('/api/candidates/archived', async (req, res) => {
    try {
        const allCandidates = await databaseService.getAllCandidates();
        const archivedCandidates = allCandidates.filter((candidate) => candidate.isArchived);
        res.json(archivedCandidates);
    }
    catch (error) {
        console.error('Error fetching archived candidates:', error);
        res.status(500).json({ error: 'Failed to fetch archived candidates' });
    }
});
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await databaseService.getAllJobs();
        res.json({ jobs });
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});
app.get('/api/jobs/archived', async (req, res) => {
    try {
        const allJobs = await databaseService.getAllJobs();
        const archivedJobs = allJobs.filter((job) => job.status === 'closed');
        res.json(archivedJobs);
    }
    catch (error) {
        console.error('Error fetching archived jobs:', error);
        res.status(500).json({ error: 'Failed to fetch archived jobs' });
    }
});
app.post('/api/jobs', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }
        let parsedData = null;
        // Try to parse job description with AI, but don't fail if it doesn't work
        try {
            parsedData = await parseJobDescription(description);
            console.log('✅ Job description parsed successfully with AI');
        }
        catch (aiError) {
            console.error('⚠️ Failed to parse job description with AI:', aiError instanceof Error ? aiError.message : 'Unknown error');
            // Fallback: use basic data if AI parsing fails
            parsedData = {
                jobTitle: title,
                responsibilities: [],
                qualifications: [],
                skills: [],
                benefits: [],
                location: 'N/A',
                employmentType: 'N/A',
                experienceLevel: 'N/A',
                industry: 'N/A',
                companyName: 'N/A',
                salaryRange: 'N/A',
                keywords: []
            };
            console.log('   Using fallback job description data.');
        }
        const job = await databaseService.createJob({
            title,
            department: 'General',
            location: 'Remote',
            employmentType: 'Full-time',
            salary: 'Competitive',
            experienceLevel: 'Mid-Level',
            description,
            responsibilities: 'TBD',
            requirements: 'TBD',
            skills: 'TBD',
            niceToHave: 'TBD',
            benefits: 'Competitive benefits',
            perks: 'TBD',
            startDate: new Date().toISOString().split('T')[0],
            status: 'draft'
        });
        res.json(job);
    }
    catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job posting' });
    }
});
// Campaign endpoints temporarily disabled - not implemented in new database service
/*
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await databaseService.getCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

app.get('/api/campaigns/archived', async (req, res) => {
  try {
    const allCampaigns = await databaseService.getCampaigns(true); // includeArchived = true
    const archivedCampaigns = allCampaigns.filter(campaign => campaign.isArchived);
    res.json(archivedCampaigns);
  } catch (error) {
    console.error('Error fetching archived campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch archived campaigns' });
  }
});
*/
// Campaign creation endpoint temporarily disabled
/*
app.post('/api/campaigns', async (req, res) => {
  try {
    const { jobId, candidateId } = req.body;
    
    if (!jobId || !candidateId) {
      return res.status(400).json({ error: 'Job ID and candidate ID are required' });
    }

    const job = await databaseService.getJob(jobId);
    const candidate = await databaseService.getCandidate(candidateId);
    
    if (!job || !candidate) {
      return res.status(404).json({ error: 'Job or candidate not found' });
    }

    let message = 'Default outreach message';
    
    // Try to generate AI outreach, but don't fail if it doesn't work
    try {
      if (job.parsedData) {
        message = await generateOutreach(candidate, job.parsedData);
        console.log('✅ AI outreach generated successfully');
      } else {
        // Generate a basic message without AI
        message = `Hi ${candidate.name},\n\nI hope this message finds you well. I came across your profile and was impressed by your background in ${candidate.title}.\n\nWe have an exciting opportunity that I believe would be a great fit for your skills and experience.\n\nWould you be interested in discussing this further?\n\nBest regards,\nRecruitment Team`;
        console.log('⚠️ Using fallback outreach message (no AI parsing available)');
      }
    } catch (aiError) {
      console.log(`❌ Failed to generate AI outreach: ${aiError instanceof Error ? aiError.message : 'Unknown error'}. Using fallback message.`);
      message = `Hi ${candidate.name},\n\nI hope this message finds you well. I came across your profile and was impressed by your background in ${candidate.title}.\n\nWe have an exciting opportunity that I believe would be a great fit for your skills and experience.\n\nWould you be interested in discussing this further?\n\nBest regards,\nRecruitment Team`;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      jobId,
      candidateId,
      message,
      status: 'draft',
      createdAt: new Date()
    };

    await databaseService.addCampaign(campaign);
    res.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});
*/
// Campaign email endpoint temporarily disabled
/*
app.post('/api/campaigns/:id/send-email', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await databaseService.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const candidate = await databaseService.getCandidate(campaign.candidateId);
    const job = await databaseService.getJob(campaign.jobId);
    
    if (!candidate || !job) {
      return res.status(404).json({ error: 'Candidate or job not found' });
    }

    const result = await emailService.sendOutreachEmail(
      candidate.email,
      candidate.name,
      campaign.message,
      job.title
    );

    if (result.success) {
      // Update campaign status
      await databaseService.updateCampaign(campaignId, {
        status: 'sent',
        sentAt: new Date()
      });
      
      res.json({
        success: true,
        message: `Email sent successfully to ${candidate.name} (${candidate.email})`
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send email'
      });
    }
  } catch (error) {
    console.error('Error sending campaign email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});
*/
app.get('/api/analytics', async (req, res) => {
    try {
        const analytics = await databaseService.getAnalytics();
        res.json(analytics);
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
// Campaign export endpoint temporarily disabled
/*
app.get('/api/campaigns/export', async (req, res) => {
  try {
    const csvData = await databaseService.exportCampaignsCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="outreach-campaigns.csv"');
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting campaigns:', error);
    res.status(500).json({ error: 'Failed to export campaigns' });
  }
});
*/
// Email configuration endpoints temporarily disabled
/*
// Email configuration endpoints
app.get('/api/email-status', (req, res) => {
  const status = emailService.getConfigurationStatus();
  res.json(status);
});

app.get('/api/email-config', async (req, res) => {
  try {
    const config = await databaseService.getEmailConfig();
    res.json({
      success: true,
      config: config || null
    });
  } catch (error) {
    console.error('Error getting email config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get email configuration'
    });
  }
});

app.post('/api/email-config', async (req, res) => {
  try {
    const { host, port, user, pass, secure, connectionType } = req.body;
    
    // Validate required fields
    if (!host || !port || !user || !pass) {
      return res.status(400).json({
        success: false,
        error: 'All email configuration fields are required'
      });
    }

    // Determine secure setting based on connection type
    let isSecure = false;
    if (connectionType === 'ssl' || secure === 'true') {
      isSecure = true;
    } else if (connectionType === 'tls') {
      isSecure = false; // TLS uses STARTTLS, not SSL
    } else if (connectionType === 'auto') {
      isSecure = parseInt(port) === 465; // Auto-detect based on port
    }

    const config: EmailConfig = {
      host,
      port: parseInt(port),
      secure: isSecure,
      auth: { user, pass },
      connectionType: connectionType || 'auto'
    };

    // Update email service
    emailService.updateConfig(config);
    
    // Store configuration persistently
    await databaseService.setEmailConfig(config);

    res.json({
      success: true,
      message: 'Email configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating email config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update email configuration'
    });
  }
});
*/
// AI Role Alignment endpoints temporarily disabled
/*
// AI Role Alignment endpoints
  // Role alignment analysis
  app.post('/api/role-alignment', async (req, res) => {
    try {
      const { candidateId, jobId } = req.body;
      
      if (!candidateId || !jobId) {
        return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
      }

      const candidate = await databaseService.getCandidate(candidateId);
      const job = await databaseService.getJob(jobId);

      if (!candidate || !job) {
        return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
      }
*/
// AI endpoints temporarily disabled
/*
const result = await aiAgent.calculateRoleAlignment(candidate, job);

if (result.ok) {
  res.json({
    success: true,
    alignment: result.data,
    message: `Role alignment calculated: ${result.data?.overallScore || 0}% match`
  });
} else {
  console.error('Role alignment failed:', result.error);
  res.status(500).json({ success: false, error: 'Failed to analyze role alignment' });
}
} catch (error) {
console.error('Error in role alignment:', error);
res.status(500).json({ success: false, error: 'Internal server error' });
}
});

// Skills gap analysis
app.post('/api/skills-gap', async (req, res) => {
try {
const { candidateId, jobId } = req.body;

if (!candidateId || !jobId) {
  return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
}

const candidate = await databaseService.getCandidate(candidateId);
const job = await databaseService.getJob(jobId);

if (!candidate || !job) {
  return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
}

const result = await aiAgent.analyzeSkillsGap(candidate, job);

if (result.ok) {
  res.json({
    success: true,
    skillsGap: result.data,
    message: 'Skills gap analysis completed'
  });
} else {
  console.error('Skills gap analysis failed:', result.error);
  res.status(500).json({ success: false, error: 'Failed to analyze skills gap' });
}
} catch (error) {
console.error('Error in skills gap analysis:', error);
res.status(500).json({ success: false, error: 'Internal server error' });
}
});

// Interview questions generation
app.post('/api/interview-questions', async (req, res) => {
try {
const { candidateId, jobId } = req.body;

if (!candidateId || !jobId) {
  return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
}

const candidate = await databaseService.getCandidate(candidateId);
const job = await databaseService.getJob(jobId);

if (!candidate || !job) {
  return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
}

const result = await aiAgent.generateInterviewQuestions(candidate, job);

if (result.ok) {
  res.json({
    success: true,
    questions: result.data,
    message: `${result.data?.length || 0} interview questions generated`
  });
} else {
  console.error('Interview questions generation failed:', result.error);
  res.status(500).json({ success: false, error: 'Failed to generate interview questions' });
}
} catch (error) {
console.error('Error in interview questions generation:', error);
res.status(500).json({ success: false, error: 'Internal server error' });
}
});

// Categorized interview questions generation
app.post('/api/interview-questions/categorized', async (req, res) => {
try {
const { candidateId, jobId } = req.body;

if (!candidateId || !jobId) {
  return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
}
*/
// AI endpoints temporarily disabled
/*
const candidate = await databaseService.getCandidate(candidateId);
const job = await databaseService.getJob(jobId);

if (!candidate || !job) {
  return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
}

const result = await aiAgent.generateCategorizedInterviewQuestions(candidate, job);

if (result.ok) {
  res.json({
    success: true,
    categorizedQuestions: result.data,
    message: `${result.data?.all?.length || 0} categorized interview questions generated`,
    summary: {
      technical: result.data?.technical?.length || 0,
      experience: result.data?.experience?.length || 0,
      problemSolving: result.data?.problemSolving?.length || 0,
      leadership: result.data?.leadership?.length || 0,
      cultural: result.data?.cultural?.length || 0,
      total: result.data?.all?.length || 0
    }
  });
} else {
  console.error('Categorized interview questions generation failed:', result.error);
  res.status(500).json({ success: false, error: 'Failed to generate categorized interview questions' });
}
} catch (error) {
console.error('Error in categorized interview questions generation:', error);
res.status(500).json({ success: false, error: 'Internal server error' });
}
});
*/
// Cultural fit assessment temporarily disabled
/*
// Cultural fit assessment
app.post('/api/cultural-fit', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
    }

    const candidate = await databaseService.getCandidate(candidateId);
    const job = await databaseService.getJob(jobId);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
    }

    const result = await aiAgent.assessCulturalFit(candidate, job);
    
    if (result.ok) {
      res.json({
        success: true,
        culturalFit: result.data,
        message: `Cultural fit score: ${result.data?.fitScore || 0}%`
      });
    } else {
      console.error('Cultural fit assessment failed:', result.error);
      res.status(500).json({ success: false, error: 'Failed to assess cultural fit' });
    }
  } catch (error) {
    console.error('Error in cultural fit assessment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
*/
/*
// Enhanced AI Analysis endpoints temporarily disabled
app.post('/api/ai/enhanced-role-alignment', async (req, res) => {
  try {
    const { candidateId, jobId, config } = req.body;
    
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
    }

    // AI endpoints temporarily disabled
    const candidate = await databaseService.getCandidate(candidateId);
    const job = await databaseService.getJob(jobId);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
    }

    const result = await aiAgent.calculateRoleAlignment(candidate, job, config);
    
    if (result.ok && result.data) {
      res.json({
        success: true,
        alignment: result.data,
        provider: result.provider,
        model: result.model,
        latency: result.latency,
        message: `Enhanced role alignment calculated: ${result.data.overallScore}% match`
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Role alignment analysis failed',
        provider: result.provider,
        latency: result.latency
      });
    }
  } catch (error) {
    console.error('Enhanced role alignment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during role alignment analysis'
    });
  }
});
*/
// Enhanced skills gap endpoint temporarily disabled
/*
app.post('/api/ai/enhanced-skills-gap', async (req, res) => {
  try {
    const { candidateId, jobId, config } = req.body;
    
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
    }

    const candidate = await databaseService.getCandidate(candidateId);
    const job = await databaseService.getJob(jobId);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
    }

    const result = await aiAgent.analyzeSkillsGap(candidate, job, config);
    
    if (result.ok && result.data) {
      res.json({
        success: true,
        skillsGap: result.data,
        provider: result.provider,
        model: result.model,
        latency: result.latency,
        message: 'Enhanced skills gap analysis completed'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Skills gap analysis failed',
        provider: result.provider,
        latency: result.latency
      });
    }
  } catch (error) {
    console.error('Enhanced skills gap error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during skills gap analysis'
    });
  }
});
*/
// Semantic Search endpoints temporarily disabled
/*
// Semantic Search endpoints
app.post('/api/ai/semantic-search', async (req, res) => {
  try {
    const { candidateSkills, jobSkills } = req.body;
    
    if (!candidateSkills || !jobSkills) {
      return res.status(400).json({ success: false, error: 'Candidate skills and job skills are required' });
    }

    const semanticSearch = new (await import('./semanticSearch.js')).SemanticSearchService();
    const analysis = semanticSearch.analyzeSkills(candidateSkills, jobSkills);
    
    res.json({
      success: true,
      analysis,
      message: 'Semantic skills analysis completed'
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during semantic search'
    });
  }
});
*/
/*
// Predictive Analytics endpoints temporarily disabled
app.post('/api/ai/predictive-analytics', async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
    }

    // AI endpoints temporarily disabled
    const candidate = await databaseService.getCandidate(candidateId);
    const job = await databaseService.getJob(jobId);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
    }

    const predictiveAnalytics = new (await import('./predictiveAnalytics.js')).PredictiveAnalyticsService();
    const prediction = await predictiveAnalytics.predictCandidateSuccess(candidate, job, {
      salaryRange: { min: 80000, median: 120000, max: 200000, currency: 'USD' },
      skillsDemand: [],
      marketRate: 120000,
      competitorAnalysis: []
    });
    const marketIntelligence = await predictiveAnalytics.getMarketIntelligence(job.title, candidate.location || 'Remote', 'technology', job.parsedData?.seniority || 'IC');
    const hiringMetrics = await predictiveAnalytics.calculateHiringMetrics(job.title, 'technology', candidate.location || 'Remote');
    
    res.json({
      success: true,
      prediction,
      marketIntelligence,
      hiringMetrics,
      message: 'Predictive analytics completed'
    });
  } catch (error) {
    console.error('Predictive analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during predictive analytics'
    });
  }
});
*/
// Advanced Assessment endpoints temporarily disabled
/*
// Advanced Assessment endpoints
app.post('/api/ai/advanced-assessment', async (req, res) => {
  try {
    const { candidateId, jobId, assessmentType, config } = req.body;
    
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
    }

    const candidate = await databaseService.getCandidate(candidateId);
    const job = await databaseService.getJob(jobId);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
    }

    const advancedAssessment = new (await import('./advancedAssessment.js')).AdvancedAssessmentEngine();
    
    let assessment;
    switch (assessmentType) {
      case 'behavioral':
        assessment = advancedAssessment.assessBehavioralProfile(candidate, job, config?.interviewResponses);
        break;
      case 'technical':
        assessment = advancedAssessment.assessTechnicalCapabilities(candidate, job, config?.technicalQuestions);
        break;
      case 'soft-skills':
        assessment = advancedAssessment.evaluateSoftSkills(candidate, job, config?.behavioralQuestions);
        break;
      case 'leadership':
        assessment = advancedAssessment.assessLeadershipPotential(candidate, job, config?.assessmentData);
        break;
      case 'comprehensive':
      default:
        assessment = advancedAssessment.performComprehensiveAssessment(candidate, job, config);
        break;
    }
    
    res.json({
      success: true,
      assessment,
      assessmentType: assessmentType || 'comprehensive',
      message: 'Advanced assessment completed'
    });
  } catch (error) {
    console.error('Advanced assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during advanced assessment'
    });
  }
});
*/
// Machine Learning endpoints temporarily disabled
/*
// Machine Learning endpoints
app.post('/api/ai/machine-learning/predict', async (req, res) => {
  try {
    const { candidateId, jobId, assessmentData } = req.body;
    
    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, error: 'Candidate ID and Job ID are required' });
    }
*/
// AI endpoints temporarily disabled
/*
const candidate = await databaseService.getCandidate(candidateId);
const job = await databaseService.getJob(jobId);

if (!candidate || !job) {
  return res.status(404).json({ success: false, error: 'Candidate or Job not found' });
}

const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
const prediction = await machineLearning.predictCandidateSuccess(candidate, job, assessmentData);

res.json({
  success: true,
  prediction,
  message: 'Machine learning prediction completed'
});
} catch (error) {
console.error('Machine learning prediction error:', error);
res.status(500).json({
  success: false,
  error: 'Internal server error during machine learning prediction'
});
}
});
*/
// Machine learning endpoints temporarily disabled
/*
app.post('/api/ai/machine-learning/train', async (req, res) => {
  try {
    const { trainingData } = req.body;
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({ success: false, error: 'Training data array is required' });
    }

    const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
    const result = await machineLearning.trainModels(trainingData);
    
    res.json({
      success: true,
      result,
      message: 'Machine learning models training completed'
    });
  } catch (error) {
    console.error('Machine learning training error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during model training'
    });
  }
});

app.get('/api/ai/machine-learning/performance', async (req, res) => {
  try {
    const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
    const performance = await machineLearning.getModelPerformance();
    
    res.json({
      success: true,
      performance,
      message: 'Model performance metrics retrieved'
    });
  } catch (error) {
    console.error('Machine learning performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error retrieving performance metrics'
    });
  }
});

app.get('/api/ai/machine-learning/insights', async (req, res) => {
  try {
    const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
    const insights = await machineLearning.getContinuousLearningInsights();
    
    res.json({
      success: true,
      insights,
      message: 'Continuous learning insights retrieved'
    });
  } catch (error) {
    console.error('Machine learning insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error retrieving insights'
    });
  }
});
*/
// AI Orchestrator endpoints temporarily disabled
/*
// AI Orchestrator endpoints
app.post('/api/ai/orchestrator/workflow', async (req, res) => {
  try {
    const { workflowType, candidateId, jobId, priority, config, metadata } = req.body;
    
    if (!workflowType || !candidateId || !jobId || !priority) {
      return res.status(400).json({
        success: false,
        error: 'Workflow type, candidate ID, job ID, and priority are required'
      });
    }
*/
// AI endpoints temporarily disabled
/*
const orchestrator = new (await import('./aiOrchestrator.js')).AIOrchestrator();
const workflowRequest = {
  workflowType,
  candidateId,
  jobId,
  priority,
  config,
  metadata: metadata ? { ...metadata, timestamp: new Date() } : undefined
};

const workflowResult = await orchestrator.executeWorkflow(workflowRequest);

res.json({
  success: true,
  workflow: workflowResult,
  message: 'AI workflow executed successfully'
});
} catch (error) {
console.error('AI orchestrator workflow error:', error);
res.status(500).json({
  success: false,
  error: 'Internal server error during workflow execution'
});
}
});
*/
// AI orchestrator endpoints temporarily disabled
/*
app.get('/api/ai/orchestrator/workflow/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    if (!workflowId) {
      return res.status(400).json({ success: false, error: 'Workflow ID is required' });
    }

    const orchestrator = new (await import('./aiOrchestrator.js')).AIOrchestrator();
    const workflowStatus = orchestrator.getWorkflowStatus(workflowId);
    
    if (!workflowStatus) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    
    res.json({
      success: true,
      workflow: workflowStatus,
      message: 'Workflow status retrieved successfully'
    });
  } catch (error) {
    console.error('AI orchestrator workflow status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error retrieving workflow status'
    });
  }
});

app.post('/api/ai/orchestrator/workflow/:workflowId/cancel', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    if (!workflowId) {
      return res.status(400).json({ success: false, error: 'Workflow ID is required' });
    }

    const orchestrator = new (await import('./aiOrchestrator.js')).AIOrchestrator();
    const result = await orchestrator.cancelWorkflow(workflowId);
    
    res.json({
      success: true,
      result,
      message: 'Workflow cancellation processed'
    });
  } catch (error) {
    console.error('AI orchestrator workflow cancellation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during workflow cancellation'
    });
  }
});

app.get('/api/ai/orchestrator/health', async (req, res) => {
  try {
    const orchestrator = new (await import('./aiOrchestrator.js')).AIOrchestrator();
    const health = orchestrator.getServiceHealth();
    
    res.json({
      success: true,
      health,
      message: 'Service health status retrieved'
    });
  } catch (error) {
    console.error('AI orchestrator health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during health check'
    });
  }
});
*/
app.get('/api/ai/orchestrator/metrics', async (req, res) => {
    try {
        const orchestrator = new (await import('./aiOrchestrator.js')).AIOrchestrator();
        const metrics = orchestrator.getPerformanceMetrics();
        res.json({
            success: true,
            metrics,
            message: 'Performance metrics retrieved'
        });
    }
    catch (error) {
        console.error('AI orchestrator metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error retrieving performance metrics'
        });
    }
});
app.post('/api/ai/orchestrator/config', async (req, res) => {
    try {
        const { config } = req.body;
        if (!config) {
            return res.status(400).json({ success: false, error: 'Configuration object is required' });
        }
        const orchestrator = new (await import('./aiOrchestrator.js')).AIOrchestrator();
        const result = await orchestrator.updateConfig(config);
        res.json({
            success: true,
            result,
            message: 'Orchestrator configuration updated'
        });
    }
    catch (error) {
        console.error('AI orchestrator config update error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error updating configuration'
        });
    }
});
app.post('/api/ai/orchestrator/cache/clear', async (req, res) => {
    try {
        const orchestrator = new (await import('./aiOrchestrator.js')).AIOrchestrator();
        const result = await orchestrator.clearCache();
        res.json({
            success: true,
            result,
            message: 'Cache cleared successfully'
        });
    }
    catch (error) {
        console.error('AI orchestrator cache clear error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error clearing cache'
        });
    }
});
// A/B Testing endpoints
app.post('/api/ai/ab-test/setup', async (req, res) => {
    try {
        const { testConfig } = req.body;
        if (!testConfig) {
            return res.status(400).json({ success: false, error: 'Test configuration is required' });
        }
        const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
        const result = await machineLearning.setupABTest(testConfig);
        res.json({
            success: true,
            result,
            message: 'A/B test setup completed'
        });
    }
    catch (error) {
        console.error('A/B test setup error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during A/B test setup'
        });
    }
});
app.get('/api/ai/ab-test/:testId/variant', async (req, res) => {
    try {
        const { testId } = req.params;
        const { candidateId } = req.query;
        if (!testId || !candidateId) {
            return res.status(400).json({ success: false, error: 'Test ID and candidate ID are required' });
        }
        const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
        const variant = machineLearning.getABTestVariant(testId, candidateId);
        if (!variant) {
            return res.status(404).json({ success: false, error: 'A/B test variant not found' });
        }
        res.json({
            success: true,
            variant,
            message: 'A/B test variant retrieved'
        });
    }
    catch (error) {
        console.error('A/B test variant error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error retrieving A/B test variant'
        });
    }
});
app.post('/api/ai/ab-test/:testId/result', async (req, res) => {
    try {
        const { testId } = req.params;
        const { variantId, candidateId, metrics } = req.body;
        if (!testId || !variantId || !candidateId || !metrics) {
            return res.status(400).json({
                success: false,
                error: 'Test ID, variant ID, candidate ID, and metrics are required'
            });
        }
        const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
        const result = await machineLearning.recordABTestResult(testId, variantId, candidateId, metrics);
        res.json({
            success: true,
            result,
            message: 'A/B test result recorded'
        });
    }
    catch (error) {
        console.error('A/B test result recording error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error recording A/B test result'
        });
    }
});
app.get('/api/ai/ab-test/:testId/results', async (req, res) => {
    try {
        const { testId } = req.params;
        if (!testId) {
            return res.status(400).json({ success: false, error: 'Test ID is required' });
        }
        const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
        const result = await machineLearning.getABTestResults(testId);
        res.json({
            success: true,
            result,
            message: 'A/B test results retrieved'
        });
    }
    catch (error) {
        console.error('A/B test results error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error retrieving A/B test results'
        });
    }
});
// Feedback and Continuous Learning endpoints
app.post('/api/ai/feedback', async (req, res) => {
    try {
        const { feedback } = req.body;
        if (!feedback) {
            return res.status(400).json({ success: false, error: 'Feedback data is required' });
        }
        const machineLearning = new (await import('./machineLearning.js')).MachineLearningService();
        const result = await machineLearning.recordFeedback(feedback);
        res.json({
            success: true,
            result,
            message: 'Feedback recorded successfully'
        });
    }
    catch (error) {
        console.error('Feedback recording error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error recording feedback'
        });
    }
});
// Job and candidate management endpoints temporarily disabled
/*
// Delete a job posting
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting job: ${id}`);
    
    // Get the job first to check if it exists
    const job = await databaseService.getJob(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Delete from database (you'll need to implement this in databaseService)
    await databaseService.deleteJob(id);
    
    console.log(`✅ Job deleted: ${id}`);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({ success: false, error: 'Failed to delete job' });
  }
});

// Archive a job posting
app.post('/api/jobs/:id/archive', async (req, res) => {
  try {
  const { id } = req.params;
    console.log(`📦 Archiving job: ${id}`);
    
    // Get the job first to check if it exists
    const job = await databaseService.getJob(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Archive the job
    await databaseService.archiveJob(id);
    
    console.log(`✅ Job archived: ${id}`);
    res.json({ success: true, message: 'Job archived successfully' });
  } catch (error) {
    console.error('❌ Error archiving job:', error);
    res.status(500).json({ success: false, error: 'Failed to archive job' });
  }
});

// Unarchive a job posting
app.post('/api/jobs/:id/unarchive', async (req, res) => {
  try {
  const { id } = req.params;
    console.log(`📦 Unarchiving job: ${id}`);
    
    // Get the job first to check if it exists
    const job = await databaseService.getJob(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Unarchive the job
    await databaseService.unarchiveJob(id);
    
    console.log(`✅ Job unarchived: ${id}`);
    res.json({ success: true, message: 'Job unarchived successfully' });
  } catch (error) {
    console.error('❌ Error unarchiving job:', error);
    res.status(500).json({ success: false, error: 'Failed to unarchive job' });
  }
});

// Delete a candidate
app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting candidate: ${id}`);
    
    // Get the candidate first to check if it exists
    const candidate = await databaseService.getCandidate(id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    
    // Delete from database (you'll need to implement this in databaseService)
    await databaseService.deleteCandidate(id);
    
    console.log(`✅ Candidate deleted: ${id}`);
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting candidate:', error);
    res.status(500).json({ success: false, error: 'Failed to delete candidate' });
  }
});

/*
  // Archive a candidate
  app.post('/api/candidates/:id/archive', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`📦 Archiving candidate: ${id}`);
      
      // Get the candidate first to check if it exists
      const candidate = await databaseService.getCandidate(id);
      if (!candidate) {
        return res.status(404).json({ success: false, error: 'Candidate not found' });
      }
    
    // Archive the candidate
    await databaseService.archiveCandidate(id);
    
    console.log(`✅ Candidate archived: ${id}`);
    res.json({ success: true, message: 'Candidate archived successfully' });
  } catch (error) {
    console.error('❌ Error archiving candidate:', error);
    res.status(500).json({ success: false, error: 'Failed to archive candidate' });
  }
});
*/
/*
// Unarchive a candidate
app.post('/api/candidates/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Unarchiving candidate: ${id}`);
    
    // Get the candidate first to check if it exists
    const candidate = await databaseService.getCandidate(id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    
    // Unarchive the candidate
    await databaseService.unarchiveCandidate(id);
    
    console.log(`✅ Candidate unarchived: ${id}`);
    res.json({ success: true, message: 'Candidate unarchived successfully' });
  } catch (error) {
    console.error('❌ Error unarchiving candidate:', error);
    res.status(500).json({ success: false, error: 'Failed to unarchive candidate' });
  }
});

// Delete a campaign
app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting campaign: ${id}`);
    
    // Get the campaign first to check if it exists
    const campaign = await databaseService.getCampaign(id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    // Delete from database (you'll need to implement this in databaseService)
    await databaseService.deleteCampaign(id);
    
    console.log(`✅ Campaign deleted: ${id}`);
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting campaign:', error);
    res.status(500).json({ success: false, error: 'Failed to delete campaign' });
  }
});

// Archive a campaign
app.post('/api/campaigns/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Archiving campaign: ${id}`);
    
    // Get the campaign first to check if it exists
    const campaign = await databaseService.getCampaign(id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    // Archive the campaign
    await databaseService.archiveCampaign(id);
    
    console.log(`✅ Campaign archived: ${id}`);
    res.json({ success: true, message: 'Campaign archived successfully' });
  } catch (error) {
    console.error('❌ Error archiving campaign:', error);
    res.status(500).json({ success: false, error: 'Failed to archive campaign' });
  }
});

// Unarchive a campaign
app.post('/api/campaigns/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Unarchiving campaign: ${id}`);
    
    // Get the campaign first to check if it exists
    const campaign = await databaseService.getCampaign(id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    // Unarchive the campaign
    await databaseService.unarchiveCampaign(id);
    
    console.log(`✅ Campaign unarchived: ${id}`);
    res.json({ success: true, message: 'Campaign unarchived successfully' });
  } catch (error) {
    console.error('❌ Error unarchiving campaign:', error);
    res.status(500).json({ success: false, error: 'Failed to unarchive campaign' });
  }
});
*/
// Modern Dashboard Route
app.get('/modern', (req, res) => {
    res.render('modern-dashboard');
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 AI Recruiter server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Upload directory: ${documentParser.getUploadDir()}`);
    console.log(`💾 Database service: Supabase`);
}).on('error', (error) => {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
});
