# AI Recruiter MVP

An AI-powered recruiting assistant that automatically parses job descriptions and generates personalized outreach messages for candidates.

## Features

- **Job Description Parsing**: Automatically extracts structured data from job postings using OpenAI
- **Personalized Outreach**: Generates customized messages for each candidate based on job requirements
- **Template-Based System**: Easily customizable prompt templates for different use cases

## Project Structure

```
├── cursor_mvp_ai_recruiter.ts  # Main application file
├── input/
│   └── job_description.txt     # Sample job description
├── prompts/
│   ├── job_parser.txt          # Job parsing prompt template
│   └── outreach_template.txt   # Outreach message template
├── package.json                # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up OpenAI API key**:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

## Usage

### 1. Add Job Description
Edit `input/job_description.txt` with your job posting content.

### 2. Customize Prompts
- **Job Parser**: Modify `prompts/job_parser.txt` to change how job descriptions are parsed
- **Outreach Template**: Edit `prompts/outreach_template.txt` to customize message generation

### 3. Run with Sample Data
The application includes a sample candidate (Alex Chen) for testing. The output will show:
- Parsed job information
- Generated personalized outreach message

## Example Output

```
💬 Outreach Message:
Subject: Exciting Senior Full Stack Developer Opportunity at YourCompany Inc.

Hi Alex Chen,

I hope this message finds you well! I came across your profile and was impressed by your background as a Senior Backend Engineer with expertise in JavaScript, React, Node.js, AWS, PostgreSQL.

We have an exciting Senior Full Stack Developer position at YourCompany Inc. that I believe could be a great fit for your experience and career goals...
```

## Customization

### Adding New Candidates
Modify the `sampleCandidate` object in `cursor_mvp_ai_recruiter.ts` or extend the code to load candidates from a file/database.

### Template Variables
Available variables in templates:
- `{name}` - Candidate name
- `{jobTitle}` - Job title
- `{skills}` - Required skills (comma-separated)
- `{seniorityLevel}` - Job seniority level
- `{company}` - Company name

## Dependencies

- `@cursorai/llm-utils`: Cursor's LLM utilities for OpenAI integration
- `openai`: OpenAI API client
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution environment

## Development

- `npm run dev`: Run with auto-reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run the compiled application

## License

MIT