// src/server.ts
import express from 'express';
import * as dotenv from 'dotenv';
import multer from 'multer';
import { documentParser } from './documentParser.js';
import { parseJobDescription, generateOutreach } from './openai.js';
import { emailService } from './emailService.js';
import { databaseService } from './databaseService.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
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
        // Create candidate object
        const newCandidate = {
            id: Date.now().toString(),
            name: candidate.name,
            email: candidate.email || '',
            phone: candidate.phone || '',
            title: candidate.title || 'Unknown',
            location: candidate.location || 'Unknown',
            experience: candidate.experience || 'Unknown',
            skills: candidate.skills || [],
            linkedin: candidate.linkedin || '',
            github: candidate.github || '',
            createdAt: new Date()
        };
        await databaseService.addCandidate(newCandidate);
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
                const newCandidate = {
                    id: Date.now().toString() + '-' + Math.random(),
                    name: candidate.name,
                    email: candidate.email || '',
                    phone: candidate.phone || '',
                    title: candidate.title || 'Unknown',
                    location: candidate.location || 'Unknown',
                    experience: candidate.experience || 'Unknown',
                    skills: candidate.skills || [],
                    linkedin: candidate.linkedin || '',
                    github: candidate.github || '',
                    createdAt: new Date()
                };
                await databaseService.addCandidate(newCandidate);
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
        const candidates = await databaseService.getCandidates();
        res.json(candidates);
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
});
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await databaseService.getJobs();
        res.json(jobs);
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
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
        const job = {
            id: Date.now().toString(),
            title,
            description,
            parsedData,
            createdAt: new Date()
        };
        await databaseService.addJob(job);
        res.json(job);
    }
    catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job posting' });
    }
});
app.get('/api/campaigns', async (req, res) => {
    try {
        const campaigns = await databaseService.getCampaigns();
        res.json(campaigns);
    }
    catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});
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
            }
            else {
                // Generate a basic message without AI
                message = `Hi ${candidate.name},\n\nI hope this message finds you well. I came across your profile and was impressed by your background in ${candidate.title}.\n\nWe have an exciting opportunity that I believe would be a great fit for your skills and experience.\n\nWould you be interested in discussing this further?\n\nBest regards,\nRecruitment Team`;
                console.log('⚠️ Using fallback outreach message (no AI parsing available)');
            }
        }
        catch (aiError) {
            console.log(`❌ Failed to generate AI outreach: ${aiError instanceof Error ? aiError.message : 'Unknown error'}. Using fallback message.`);
            message = `Hi ${candidate.name},\n\nI hope this message finds you well. I came across your profile and was impressed by your background in ${candidate.title}.\n\nWe have an exciting opportunity that I believe would be a great fit for your skills and experience.\n\nWould you be interested in discussing this further?\n\nBest regards,\nRecruitment Team`;
        }
        const campaign = {
            id: Date.now().toString(),
            jobId,
            candidateId,
            message,
            status: 'draft',
            createdAt: new Date()
        };
        await databaseService.addCampaign(campaign);
        res.json(campaign);
    }
    catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});
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
        const result = await emailService.sendOutreachEmail(candidate.email, candidate.name, campaign.message, job.title);
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
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error || 'Failed to send email'
            });
        }
    }
    catch (error) {
        console.error('Error sending campaign email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});
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
app.get('/api/campaigns/export', async (req, res) => {
    try {
        const csvData = await databaseService.exportCampaignsCSV();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="outreach-campaigns.csv"');
        res.send(csvData);
    }
    catch (error) {
        console.error('Error exporting campaigns:', error);
        res.status(500).json({ error: 'Failed to export campaigns' });
    }
});
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
    }
    catch (error) {
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
        }
        else if (connectionType === 'tls') {
            isSecure = false; // TLS uses STARTTLS, not SSL
        }
        else if (connectionType === 'auto') {
            isSecure = parseInt(port) === 465; // Auto-detect based on port
        }
        const config = {
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
    }
    catch (error) {
        console.error('Error updating email config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update email configuration'
        });
    }
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
