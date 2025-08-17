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
          throw new Error(`PDF files are not yet supported. Please convert to TXT, DOCX, or DOC format.`);
        case '.docx':
        case '.doc':
          extractedText = await this.parseWordDocument(filePath);
          break;
        case '.txt':
          extractedText = await this.parseTextFile(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}. Supported formats: TXT, DOCX, DOC`);
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
      // For now, throw an error for PDFs to trigger fallback or better error handling
      throw new Error("PDF parsing is currently being implemented. Please convert to text format for now.");
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
You are an AI recruiter assistant. Extract candidate information from the following resume/document text.

Extract and return as JSON with these fields:
- name (full name)
- email (if found)
- phone (if found)
- title (current job title)
- currentCompany (current employer)
- location (city, state, or country)
- experience (years of experience as string, e.g., "5 years")
- skills (array of technical and soft skills)
- education (array of degrees/certifications)
- summary (brief professional summary)
- linkedin (LinkedIn URL if found)
- github (GitHub URL if found)
- portfolio (portfolio URL if found)
- rawText (the original extracted text)

Document text:
${text}

Return only valid JSON. If a field is not found, use null or empty string as appropriate:
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
    // Basic regex-based extraction as fallback
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract name (usually first line)
    const name = lines[0] || 'Unknown';
    
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
    
    // Extract skills (look for common skill keywords)
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Vue', 'Node.js', 'Express',
      'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS',
      'Angular', 'Vue.js', 'PHP', 'C#', '.NET', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'
    ];
    const skills = skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    return {
      name,
      email,
      phone,
      title: lines[1] || undefined,
      currentCompany: undefined,
      location: undefined,
      experience: 'Unknown',
      skills,
      education: [],
      summary: undefined,
      linkedin,
      github,
      portfolio: undefined,
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
