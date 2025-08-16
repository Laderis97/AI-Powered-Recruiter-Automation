# 🤖 AI-Powered Recruiter Automation

A comprehensive AI-powered recruitment automation system that streamlines the entire hiring process from resume parsing to candidate outreach.

## ✨ Features

### 📄 **Resume & Document Parsing**
- **Multi-format Support**: PDF, DOCX, DOC, TXT files
- **AI-Powered Extraction**: Automatically extracts candidate information using GPT-4
- **Bulk Upload**: Process multiple resumes simultaneously
- **Structured Data**: Extracts name, contact info, skills, experience, education, and more

### 💼 **Job Management**
- **Job Description Parser**: AI-powered extraction of job requirements
- **Structured Job Data**: Automatically categorizes skills, seniority, and requirements
- **Job Posting Creation**: Easy job posting management through web interface

### 👥 **Candidate Management**
- **Automated Profile Creation**: From resume uploads
- **Skill Matching**: AI-powered candidate-job matching
- **Candidate Database**: Centralized candidate information storage

### 📧 **Outreach Automation**
- **Personalized Messages**: AI-generated outreach based on candidate and job data
- **Campaign Tracking**: Monitor outreach status and responses
- **Response Rate Analytics**: Track campaign performance

### 📊 **Analytics Dashboard**
- **Real-time Metrics**: Jobs, candidates, campaigns, and response rates
- **Modern UI**: Beautiful, responsive dashboard interface
- **Interactive Management**: Full CRUD operations through web interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- OpenAI Project ID

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Powered-Recruiter-Automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_PROJECT_ID=your_openai_project_id_here
   PORT=3000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Access the dashboard**
   Open your browser and go to `http://localhost:3000`

## 📁 Project Structure

```
AI-Powered-Recruiter-Automation/
├── src/
│   ├── server.ts              # Main Express server
│   ├── documentParser.ts      # Resume/document parsing logic
│   ├── openai.ts             # AI integration functions
│   ├── cursor_mvp_ai_recruiter.ts  # CLI version
│   └── types.d.ts            # TypeScript declarations
├── views/
│   └── index.ejs             # Dashboard interface
├── prompts/
│   ├── job_parser.txt        # Job parsing prompts
│   └── outreach_template.txt # Outreach generation prompts
├── input/
│   ├── job_description.txt   # Sample job description
│   └── sample_resume.txt     # Sample resume for testing
├── uploads/                  # Temporary file uploads (auto-created)
└── dist/                     # Compiled JavaScript files
```

## 🧪 Testing

### Test Resume Parser
```bash
npm run test-parser
```

This will parse the sample resume in `input/sample_resume.txt` and display the extracted information.

### Test CLI Version
```bash
npm run dev
```

## 🔧 API Endpoints

### Resume Upload
- `POST /api/upload-resume` - Upload single resume
- `POST /api/upload-multiple-resumes` - Upload multiple resumes

### Job Management
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job posting
- `DELETE /api/jobs/:id` - Delete job posting

### Candidate Management
- `GET /api/candidates` - List all candidates
- `POST /api/candidates` - Create new candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Campaign Management
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new outreach campaign
- `PUT /api/campaigns/:id/status` - Update campaign status
- `DELETE /api/campaigns/:id` - Delete campaign

### Analytics
- `GET /api/analytics` - Get system analytics

## 📄 Supported File Formats

### Resume Upload
- **PDF** (.pdf) - Most common resume format
- **Word Documents** (.docx, .doc) - Microsoft Word files
- **Text Files** (.txt) - Plain text resumes

### File Size Limits
- Maximum file size: 10MB per file
- Multiple files: Up to 10 files per upload

## 🤖 AI Features

### Resume Parsing
The system uses GPT-4 to extract structured information from resumes:
- Personal information (name, email, phone)
- Professional details (title, company, experience)
- Skills and technologies
- Education and certifications
- Social profiles (LinkedIn, GitHub, portfolio)

### Job Description Analysis
AI automatically parses job descriptions to extract:
- Job title and seniority level
- Required skills and technologies
- Years of experience needed
- Location preferences
- Role summary

### Outreach Generation
Personalized outreach messages are generated based on:
- Candidate's background and skills
- Job requirements and company culture
- Seniority level appropriate tone
- Specific skill matches

## 🎯 Use Cases

1. **Recruitment Agencies**: Process large volumes of resumes efficiently
2. **HR Departments**: Automate initial candidate screening
3. **Startups**: Scale recruitment without hiring more recruiters
4. **Tech Companies**: Match technical skills to job requirements
5. **Consulting Firms**: Manage multiple client hiring needs

## 🔮 Future Enhancements

- [ ] Email integration for automated outreach
- [ ] LinkedIn automation for candidate sourcing
- [ ] Advanced candidate scoring algorithms
- [ ] Interview scheduling automation
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and role-based access
- [ ] Advanced analytics and reporting
- [ ] Integration with ATS systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

---

**Built with ❤️ using Node.js, Express, TypeScript, and OpenAI GPT-4**
