// src/server.ts
import express from 'express';
import multer from 'multer';
import * as dotenv from 'dotenv';
import { documentParser } from './documentParser.js';
import { parseJobDescription, generateOutreach } from './openai.js';
import { emailService } from './emailService.js';
import { databaseService } from './databaseService.js';
import { aiAgent } from './aiAgent.js';
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
app.get('/api/candidates/archived', async (req, res) => {
    try {
        const candidates = await databaseService.getCandidates(true); // includeArchived = true
        res.json(candidates);
    }
    catch (error) {
        console.error('Error fetching archived candidates:', error);
        res.status(500).json({ error: 'Failed to fetch archived candidates' });
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
app.get('/api/jobs/archived', async (req, res) => {
    try {
        const jobs = await databaseService.getJobs(true); // includeArchived = true
        res.json(jobs);
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
app.get('/api/campaigns/archived', async (req, res) => {
    try {
        const campaigns = await databaseService.getCampaigns(true); // includeArchived = true
        res.json(campaigns);
    }
    catch (error) {
        console.error('Error fetching archived campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch archived campaigns' });
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
        const result = await aiAgent.calculateRoleAlignment(candidate, job);
        if (result.ok) {
            res.json({
                success: true,
                alignment: result.data,
                message: `Role alignment calculated: ${result.data.overallScore}% match`
            });
        }
        else {
            console.error('Role alignment failed:', result.error);
            res.status(500).json({ success: false, error: 'Failed to analyze role alignment' });
        }
    }
    catch (error) {
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
        }
        else {
            console.error('Skills gap analysis failed:', result.error);
            res.status(500).json({ success: false, error: 'Failed to analyze skills gap' });
        }
    }
    catch (error) {
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
                message: `${result.data.length} interview questions generated`
            });
        }
        else {
            console.error('Interview questions generation failed:', result.error);
            res.status(500).json({ success: false, error: 'Failed to generate interview questions' });
        }
    }
    catch (error) {
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
                message: `${result.data.all.length} categorized interview questions generated`,
                summary: {
                    technical: result.data.technical.length,
                    experience: result.data.experience.length,
                    problemSolving: result.data.problemSolving.length,
                    leadership: result.data.leadership.length,
                    cultural: result.data.cultural.length,
                    total: result.data.all.length
                }
            });
        }
        else {
            console.error('Categorized interview questions generation failed:', result.error);
            res.status(500).json({ success: false, error: 'Failed to generate categorized interview questions' });
        }
    }
    catch (error) {
        console.error('Error in categorized interview questions generation:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
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
                message: `Cultural fit score: ${result.data.fitScore}%`
            });
        }
        else {
            console.error('Cultural fit assessment failed:', result.error);
            res.status(500).json({ success: false, error: 'Failed to assess cultural fit' });
        }
    }
    catch (error) {
        console.error('Error in cultural fit assessment:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('❌ Error deleting candidate:', error);
        res.status(500).json({ success: false, error: 'Failed to delete candidate' });
    }
});
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
    }
    catch (error) {
        console.error('❌ Error archiving candidate:', error);
        res.status(500).json({ success: false, error: 'Failed to archive candidate' });
    }
});
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('❌ Error unarchiving campaign:', error);
        res.status(500).json({ success: false, error: 'Failed to unarchive campaign' });
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
