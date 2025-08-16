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
          throw new Error(`Unsupported file type: ${fileExtension}`);
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
      // For now, return a placeholder message for PDFs
      // In production, you would use a proper PDF parsing library
      return "PDF parsing is currently being implemented. Please convert to text format for now.";
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

    try {
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
      throw new Error(`Failed to extract candidate info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
