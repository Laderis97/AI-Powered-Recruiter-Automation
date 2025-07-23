/**
 * LinkedIn Profile Scraping Workflow
 * Scrapes candidate profiles from LinkedIn for recruitment
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { setTimeout } from 'timers/promises';

interface CandidateProfile {
  name: string;
  title: string;
  location: string;
  profileUrl: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  summary?: string;
  connections?: number;
}

interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

interface EducationEntry {
  school: string;
  degree: string;
  field?: string;
  year?: string;
}

interface LinkedInSearchConfig {
  sessionCookie: string;
  keywords: string[];
  location?: string;
  experience?: string;
  maxResults?: number;
  headless?: boolean;
}

export class LinkedInScraper {
  private browser: Browser | null = null;
  private config: LinkedInSearchConfig;

  constructor(config: LinkedInSearchConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: this.config.headless ?? true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      console.log('✅ LinkedIn scraper initialized');
    } catch (error) {
      console.error('❌ Failed to initialize LinkedIn scraper:', error);
      throw error;
    }
  }

  async searchCandidates(
    jobTitle: string, 
    requiredSkills: string[], 
    location?: string
  ): Promise<CandidateProfile[]> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    try {
      // Set LinkedIn session cookie
      await this.setLinkedInSession(page);

      // Build search query
      const searchQuery = this.buildSearchQuery(jobTitle, requiredSkills, location);
      
      console.log(`🔍 Searching LinkedIn for: ${searchQuery}`);

      // Navigate to LinkedIn search
      await page.goto(`https://www.linkedin.com/search/people/?keywords=${encodeURIComponent(searchQuery)}`, {
        waitUntil: 'networkidle2'
      });

      // Wait for search results
      await page.waitForSelector('.search-results-container', { timeout: 10000 });

      // Extract candidate profile links
      const profileLinks = await this.extractProfileLinks(page);
      
      console.log(`📊 Found ${profileLinks.length} potential candidates`);

      // Scrape individual profiles
      const candidates: CandidateProfile[] = [];
      const maxResults = Math.min(profileLinks.length, this.config.maxResults || 20);

      for (let i = 0; i < maxResults; i++) {
        try {
          const candidate = await this.scrapeProfile(page, profileLinks[i]);
          if (candidate) {
            candidates.push(candidate);
            console.log(`✅ Scraped profile: ${candidate.name}`);
          }
          
          // Rate limiting
          await setTimeout(2000 + Math.random() * 3000);
        } catch (error) {
          console.error(`❌ Failed to scrape profile ${profileLinks[i]}:`, error);
        }
      }

      return candidates;

    } catch (error) {
      console.error('❌ LinkedIn search failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async setLinkedInSession(page: Page): Promise<void> {
    await page.setCookie({
      name: 'li_at',
      value: this.config.sessionCookie,
      domain: '.linkedin.com',
      path: '/',
      httpOnly: true,
      secure: true
    });
  }

  private buildSearchQuery(jobTitle: string, skills: string[], location?: string): string {
    const keywords = [jobTitle, ...skills.slice(0, 3)].join(' ');
    return keywords;
  }

  private async extractProfileLinks(page: Page): Promise<string[]> {
    return await page.evaluate(() => {
      const profileElements = document.querySelectorAll('.entity-result__title-text a');
      return Array.from(profileElements)
        .map(el => (el as HTMLAnchorElement).href)
        .filter(href => href.includes('/in/'))
        .slice(0, 50); // Limit initial results
    });
  }

  private async scrapeProfile(page: Page, profileUrl: string): Promise<CandidateProfile | null> {
    try {
      await page.goto(profileUrl, { waitUntil: 'networkidle2' });

      // Wait for profile to load
      await page.waitForSelector('.text-heading-xlarge', { timeout: 5000 });

      const profile = await page.evaluate(() => {
        // Extract basic info
        const nameElement = document.querySelector('.text-heading-xlarge');
        const titleElement = document.querySelector('.text-body-medium.break-words');
        const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words');

        // Extract skills
        const skillElements = document.querySelectorAll('[data-field="skill_card_skill_topic"] .visually-hidden');
        const skills = Array.from(skillElements).map(el => el.textContent?.trim() || '');

        // Extract experience
        const experienceSection = document.querySelector('#experience');
        const experienceEntries: ExperienceEntry[] = [];
        
        if (experienceSection) {
          const expItems = experienceSection.parentElement?.querySelectorAll('.artdeco-list__item');
          expItems?.forEach(item => {
            const titleEl = item.querySelector('.mr1.t-bold span');
            const companyEl = item.querySelector('.t-14.t-normal span');
            const durationEl = item.querySelector('.date-range');
            
            if (titleEl && companyEl) {
              experienceEntries.push({
                title: titleEl.textContent?.trim() || '',
                company: companyEl.textContent?.trim() || '',
                duration: durationEl?.textContent?.trim() || ''
              });
            }
          });
        }

        return {
          name: nameElement?.textContent?.trim() || '',
          title: titleElement?.textContent?.trim() || '',
          location: locationElement?.textContent?.trim() || '',
          skills: skills.filter(skill => skill.length > 0).slice(0, 10),
          experience: experienceEntries.slice(0, 5)
        };
      });

      if (!profile.name) {
        return null;
      }

      return {
        ...profile,
        profileUrl,
        education: [] // Could be expanded to scrape education
      };

    } catch (error) {
      console.error(`❌ Error scraping profile ${profileUrl}:`, error);
      return null;
    }
  }

  async searchBySkills(skills: string[], location?: string): Promise<CandidateProfile[]> {
    const searchQuery = skills.join(' OR ');
    return this.searchCandidates(searchQuery, skills, location);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('✅ LinkedIn scraper closed');
    }
  }
}

// Advanced search filters
export class LinkedInAdvancedSearch extends LinkedInScraper {
  async searchWithFilters(filters: {
    keywords: string[];
    title?: string;
    company?: string;
    location?: string;
    industry?: string;
    experience?: 'entry' | 'associate' | 'mid' | 'director' | 'executive';
    connections?: 'first' | 'second' | 'third';
  }): Promise<CandidateProfile[]> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    try {
      await this.setLinkedInSession(page);

      // Build advanced search URL
      const searchParams = new URLSearchParams();
      
      if (filters.keywords.length > 0) {
        searchParams.append('keywords', filters.keywords.join(' '));
      }
      
      if (filters.title) {
        searchParams.append('title', filters.title);
      }
      
      if (filters.location) {
        searchParams.append('geoUrn', `["${filters.location}"]`);
      }
      
      const searchUrl = `https://www.linkedin.com/search/people/?${searchParams.toString()}`;
      
      console.log(`🔍 Advanced LinkedIn search: ${searchUrl}`);

      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      const profileLinks = await this.extractProfileLinks(page);
      const candidates: CandidateProfile[] = [];

      for (const link of profileLinks.slice(0, this.config.maxResults || 20)) {
        try {
          const candidate = await this.scrapeProfile(page, link);
          if (candidate) {
            candidates.push(candidate);
          }
          await setTimeout(2000);
        } catch (error) {
          console.error('Profile scraping error:', error);
        }
      }

      return candidates;

    } finally {
      await page.close();
    }
  }
}

// Usage Example
export async function runLinkedInScraper(
  jobTitle: string, 
  requiredSkills: string[], 
  location?: string
): Promise<CandidateProfile[]> {
  const config: LinkedInSearchConfig = {
    sessionCookie: process.env.LINKEDIN_SESSION_COOKIE!,
    keywords: requiredSkills,
    location,
    maxResults: 25,
    headless: true
  };

  const scraper = new LinkedInScraper(config);
  
  try {
    await scraper.initialize();
    const candidates = await scraper.searchCandidates(jobTitle, requiredSkills, location);
    
    console.log(`🎯 Found ${candidates.length} qualified candidates`);
    
    return candidates;
  } catch (error) {
    console.error('❌ LinkedIn scraping workflow failed:', error);
    throw error;
  } finally {
    await scraper.close();
  }
}