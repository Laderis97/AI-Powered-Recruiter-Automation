# Cursor AI Recruiter

An AI-powered recruiting automation system that streamlines the entire recruitment process from job parsing to candidate outreach.

## Features

- **Job Description Parsing**: Automatically extract structured data from job descriptions
- **Candidate Scoring**: AI-powered matching between candidates and job requirements
- **Personalized Outreach**: Generate tailored messages based on role seniority and candidate profile
- **LinkedIn Integration**: Scrape candidate profiles and automate messaging
- **Salesforce Integration**: Poll for new job postings and update candidate status
- **End-to-End Workflow**: Complete automation from job posting to candidate contact

## Project Structure

```
cursor-ai-recruiter/
├── prompts/                    # AI prompt templates
│   ├── job_parser.txt         # Job description parsing prompts
│   ├── outreach_template.txt  # Outreach message generation
│   └── candidate_scorer.txt   # Candidate matching prompts
├── workflows/                  # Automation workflows
│   ├── poll_salesforce.ts     # Salesforce job polling
│   ├── parse_job.ts          # Job description processing
│   ├── scrape_linkedin.ts    # LinkedIn profile scraping
│   ├── generate_outreach.ts  # Message generation
│   └── send_messages.ts      # Message delivery
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and credentials
   ```

3. Run the workflow:
   ```bash
   npm run start
   ```

## Environment Variables

```
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_PASSWORD=your_salesforce_password
SALESFORCE_TOKEN=your_security_token
LINKEDIN_SESSION_COOKIE=your_linkedin_session
OPENAI_API_KEY=your_openai_key
```

## Workflow

1. **Poll Salesforce** for new job postings
2. **Parse job descriptions** to extract requirements
3. **Scrape LinkedIn** for potential candidates
4. **Score candidates** against job requirements
5. **Generate personalized outreach** messages
6. **Send messages** to top candidates

## AI Prompts

The system uses specialized AI prompts for different tasks:

- **Job Parser**: Extracts structured data (title, skills, seniority, location)
- **Candidate Scorer**: Provides relevance scores (1-100) with explanations
- **Outreach Generator**: Creates personalized messages matching role seniority

## Usage Examples

### Job Parsing
```typescript
const jobData = await parseJob(jobDescription);
// Returns: { jobTitle, seniorityLevel, requiredSkills, yearsOfExperience, preferredLocation, summary }
```

### Candidate Scoring
```typescript
const score = await scoreCandidate(jobData, candidateProfile);
// Returns: { matchScore: 87, reason: "Candidate has 5+ years..." }
```

### Outreach Generation
```typescript
const message = await generateOutreach(candidateData, jobData);
// Returns personalized message under 500 characters
```

## License

MIT License