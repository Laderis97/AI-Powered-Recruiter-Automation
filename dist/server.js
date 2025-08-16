// src/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';
import multer from 'multer';
import { parseJobDescription, generateOutreach } from './openai.js';
import { documentParser } from './documentParser.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, documentParser.getUploadDir());
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(fileExtension)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
let jobs = [];
let candidates = [];
let campaigns = [];
// Routes
app.get('/', (req, res) => {
    res.render('index', {
        jobsCount: jobs.length,
        candidatesCount: candidates.length,
        campaignsCount: campaigns.length
    });
});
app.get('/api/jobs', (req, res) => {
    res.json(jobs);
});
app.get('/api/candidates', (req, res) => {
    res.json(candidates);
});
app.get('/api/campaigns', (req, res) => {
    res.json(campaigns);
});
app.post('/api/jobs', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }
        const parsedData = await parseJobDescription(description);
        const job = {
            id: Date.now().toString(),
            title,
            description,
            parsedData,
            createdAt: new Date()
        };
        jobs.push(job);
        res.json(job);
    }
    catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job posting' });
    }
});
app.post('/api/candidates', (req, res) => {
    try {
        const { name, title, skills, location, experience, email, linkedin } = req.body;
        if (!name || !title) {
            return res.status(400).json({ error: 'Name and title are required' });
        }
        const candidate = {
            id: Date.now().toString(),
            name,
            title,
            skills: skills || [],
            location: location || '',
            experience: experience || '',
            email,
            linkedin
        };
        candidates.push(candidate);
        res.json(candidate);
    }
    catch (error) {
        console.error('Error creating candidate:', error);
        res.status(500).json({ error: 'Failed to create candidate' });
    }
});
app.post('/api/campaigns', async (req, res) => {
    try {
        const { jobId, candidateId } = req.body;
        const job = jobs.find(j => j.id === jobId);
        const candidate = candidates.find(c => c.id === candidateId);
        if (!job || !candidate) {
            return res.status(400).json({ error: 'Job and candidate not found' });
        }
        const message = await generateOutreach(candidate, job.parsedData);
        const campaign = {
            id: Date.now().toString(),
            jobId,
            candidateId,
            message,
            status: 'draft',
            createdAt: new Date()
        };
        campaigns.push(campaign);
        res.json(campaign);
    }
    catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create outreach campaign' });
    }
});
app.put('/api/campaigns/:id/status', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const campaign = campaigns.find(c => c.id === id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        campaign.status = status;
        if (status === 'sent') {
            campaign.sentAt = new Date();
        }
        res.json(campaign);
    }
    catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});
app.delete('/api/jobs/:id', (req, res) => {
    const { id } = req.params;
    jobs = jobs.filter(job => job.id !== id);
    res.json({ message: 'Job deleted successfully' });
});
app.delete('/api/candidates/:id', (req, res) => {
    const { id } = req.params;
    candidates = candidates.filter(candidate => candidate.id !== id);
    res.json({ message: 'Candidate deleted successfully' });
});
app.delete('/api/campaigns/:id', (req, res) => {
    const { id } = req.params;
    campaigns = campaigns.filter(campaign => campaign.id !== id);
    res.json({ message: 'Campaign deleted successfully' });
});
// File upload endpoints for resume parsing
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const parsedCandidate = await documentParser.parseDocument(req.file.path, req.file.originalname);
        // Convert ParsedCandidate to Candidate format for storage
        const candidate = {
            id: Date.now().toString(),
            name: parsedCandidate.name,
            title: parsedCandidate.title || 'Unknown',
            skills: parsedCandidate.skills,
            location: parsedCandidate.location || '',
            experience: parsedCandidate.experience,
            email: parsedCandidate.email,
            linkedin: parsedCandidate.linkedin
        };
        candidates.push(candidate);
        res.json({
            message: 'Resume parsed successfully',
            candidate,
            parsedData: parsedCandidate
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
        const files = req.files;
        const parsedCandidates = await documentParser.parseMultipleDocuments(files);
        const newCandidates = [];
        for (const parsedCandidate of parsedCandidates) {
            const candidate = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: parsedCandidate.name,
                title: parsedCandidate.title || 'Unknown',
                skills: parsedCandidate.skills,
                location: parsedCandidate.location || '',
                experience: parsedCandidate.experience,
                email: parsedCandidate.email,
                linkedin: parsedCandidate.linkedin
            };
            candidates.push(candidate);
            newCandidates.push(candidate);
        }
        res.json({
            message: `${newCandidates.length} resumes parsed successfully`,
            candidates: newCandidates,
            parsedData: parsedCandidates
        });
    }
    catch (error) {
        console.error('Error parsing resumes:', error);
        res.status(500).json({
            error: 'Failed to parse resumes',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Analytics endpoint
app.get('/api/analytics', (req, res) => {
    const totalJobs = jobs.length;
    const totalCandidates = candidates.length;
    const totalCampaigns = campaigns.length;
    const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
    const repliedCampaigns = campaigns.filter(c => c.status === 'replied').length;
    const responseRate = sentCampaigns > 0 ? (repliedCampaigns / sentCampaigns * 100).toFixed(1) : '0';
    res.json({
        totalJobs,
        totalCandidates,
        totalCampaigns,
        sentCampaigns,
        repliedCampaigns,
        responseRate: `${responseRate}%`
    });
});
app.listen(PORT, () => {
    console.log(`🚀 AI Recruiter server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}`);
});
