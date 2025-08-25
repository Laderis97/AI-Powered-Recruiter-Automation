// src/documentParser.ts

import fs from 'fs-extra';
import path from 'path';
import mammoth from 'mammoth';
import { callOpenAI } from './openai.js';

export interface ParsedCandidate {
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  currentCompany?: string;
  location?: string;
  experience: string;
  skills: string[];
  education: string[];
  summary?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  rawText: string;
}

export class DocumentParser {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.ensureDir(this.uploadDir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  async parseDocument(filePath: string, originalName: string): Promise<ParsedCandidate> {
    const fileExtension = path.extname(originalName).toLowerCase();
    let extractedText = '';

    try {
      switch (fileExtension) {
        case '.pdf':
          extractedText = await this.parsePDF(filePath);
          break;
        case '.docx':
        case '.doc':
          extractedText = await this.parseWordDocument(filePath);
          break;
        case '.txt':
          extractedText = await this.parseTextFile(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}. Supported formats: PDF, TXT, DOCX, DOC`);
      }

      // Use AI to extract structured candidate information
      const candidate = await this.extractCandidateInfo(extractedText, originalName);
      
      // Clean up the uploaded file
      await fs.remove(filePath);
      
      return candidate;
    } catch (error) {
      // Clean up on error
      try {
        await fs.remove(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      throw error;
    }
  }

  private async parsePDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      // Use dynamic import to avoid test file access during module loading
      const pdf = (await import('pdf-parse')).default;
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseWordDocument(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to parse Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async parseTextFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to parse text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractCandidateInfo(text: string, fileName: string): Promise<ParsedCandidate> {
    // Try AI extraction first
    try {
      const prompt = `
You are an AI recruiter assistant. Extract comprehensive candidate information from the following resume/document text.

Extract and return as JSON with these fields:
- name (full name - extract from header or contact section)
- email (email address if found)
- phone (phone number if found)
- title (current job title or most recent position)
- currentCompany (current employer or most recent company)
- location (city, state, or country - prefer current location)
- experience (total years of experience as string, e.g., "5 years" - calculate from work history)
- skills (array of technical skills, programming languages, frameworks, tools, and soft skills)
- education (array of degrees, certifications, and educational institutions)
- summary (brief professional summary or objective statement)
- linkedin (LinkedIn URL if found)
- github (GitHub URL if found)
- portfolio (portfolio or personal website URL if found)
- rawText (the original extracted text)

Important extraction guidelines:
1. For skills: Include programming languages, frameworks, databases, cloud platforms, tools, methodologies
2. For experience: Calculate total years from work history, not just current role
3. For education: Include degree type, field of study, and institution
4. For location: Prefer current/most recent location
5. For title: Use current or most recent job title

Document text:
${text}

Return only valid JSON. If a field is not found, use null or empty string as appropriate. Ensure all arrays are properly formatted:
`;

      const result = await callOpenAI(prompt);
      const parsed = JSON.parse(result);
      
      // Ensure required fields exist
      return {
        name: parsed.name || 'Unknown',
        email: parsed.email || undefined,
        phone: parsed.phone || undefined,
        title: parsed.title || undefined,
        currentCompany: parsed.currentCompany || undefined,
        location: parsed.location || undefined,
        experience: parsed.experience || 'Unknown',
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        summary: parsed.summary || undefined,
        linkedin: parsed.linkedin || undefined,
        github: parsed.github || undefined,
        portfolio: parsed.portfolio || undefined,
        rawText: text
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        console.log('⚠️ OpenAI API authentication failed, using fallback text parsing...');
        return this.extractBasicInfo(text);
      } else if (error instanceof Error && error.message.includes('429')) {
        console.log('⚠️ OpenAI API rate limit exceeded, using fallback text parsing...');
        return this.extractBasicInfo(text);
      } else if (error instanceof Error && error.message.includes('JSON')) {
        console.log('⚠️ Failed to parse AI response, using fallback text parsing...');
        return this.extractBasicInfo(text);
      } else {
        // Fallback to basic text extraction
        console.log('⚠️ AI extraction failed, using fallback text parsing...');
        return this.extractBasicInfo(text);
      }
    }
  }

  private extractBasicInfo(text: string): ParsedCandidate {
    // Enhanced regex-based extraction as fallback
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract name (usually first line or after "Name:" pattern)
    let name = lines[0] || 'Unknown';
    const nameMatch = text.match(/(?:name|full name)[:\s]+([a-zA-Z\s]+)/i);
    if (nameMatch) {
      name = nameMatch[1].trim();
    }
    
    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;
    
    // Extract phone
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;
    
    // Extract LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/);
    const linkedin = linkedinMatch ? `https://${linkedinMatch[0]}` : undefined;
    
    // Extract GitHub
    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9-]+/);
    const github = githubMatch ? `https://${githubMatch[0]}` : undefined;
    
    // Extract portfolio/website
    const portfolioMatch = text.match(/(?:portfolio|website|personal site)[:\s]+(https?:\/\/[^\s]+)/i);
    const portfolio = portfolioMatch ? portfolioMatch[1] : undefined;
    
    // Extract title (look for common patterns)
    let title = undefined;
    const titleMatch = text.match(/(?:title|position|role)[:\s]+([^,\n]+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      // Look for common job titles in the text
      const commonTitles = [
        'Software Engineer', 'Developer', 'Programmer', 'Full Stack', 'Frontend', 'Backend',
        'DevOps', 'Data Scientist', 'Product Manager', 'Designer', 'Architect', 'Lead',
        'Senior', 'Junior', 'Principal', 'Manager', 'Director', 'VP', 'CTO', 'CEO'
      ];
      for (const jobTitle of commonTitles) {
        if (text.toLowerCase().includes(jobTitle.toLowerCase())) {
          title = jobTitle;
          break;
        }
      }
    }
    
    // If no title found, set a default
    if (!title) {
      title = 'Professional';
    }
    
    // Extract location
    let location = undefined;
    const locationMatch = text.match(/(?:location|address|city)[:\s]+([^,\n]+)/i);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }
    
    // Extract skills (enhanced list)
    const skillKeywords = [
      // Programming Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
      // Web Technologies
      'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'jQuery', 'HTML', 'CSS', 'Sass', 'Less',
      // Databases
      'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
      // Cloud & DevOps
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab', 'GitHub Actions',
      // Frameworks & Libraries
      'Django', 'Flask', 'Spring', 'Laravel', 'Symfony', 'ASP.NET', 'FastAPI', 'GraphQL', 'REST',
      // Tools & Methodologies
      'Git', 'SVN', 'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban', 'CI/CD', 'TDD', 'BDD',
      // Data & AI
      'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
      // Soft Skills
      'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Project Management', 'Analytical'
    ];
    const skills = skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    // Extract education
    const educationKeywords = ['Bachelor', 'Master', 'PhD', 'MBA', 'BSc', 'MSc', 'BA', 'MA', 'University', 'College'];
    const education = educationKeywords.filter(edu => 
      text.toLowerCase().includes(edu.toLowerCase())
    );
    
    return {
      name,
      email,
      phone,
      title,
      currentCompany: undefined,
      location,
      experience: 'Unknown',
      skills,
      education,
      summary: undefined,
      linkedin,
      github,
      portfolio,
      rawText: text
    };
  }

  async parseMultipleDocuments(files: Array<{ path: string; originalname: string }>): Promise<ParsedCandidate[]> {
    const results: ParsedCandidate[] = [];
    
    for (const file of files) {
      try {
        const candidate = await this.parseDocument(file.path, file.originalname);
        results.push(candidate);
      } catch (error) {
        console.error(`Error parsing ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }
    
    return results;
  }

  getUploadDir(): string {
    return this.uploadDir;
  }
}

// Export a singleton instance
export const documentParser = new DocumentParser();
