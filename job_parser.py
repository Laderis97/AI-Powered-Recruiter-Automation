#!/usr/bin/env python3
"""
AI Recruiter Assistant - Job Description Parser

This script parses job descriptions and extracts structured data for automated sourcing.
"""

import json
import re
from typing import Dict, List, Any


class JobDescriptionParser:
    def __init__(self):
        # Common skill patterns
        self.skill_patterns = [
            r'\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|Go|Rust|Ruby|PHP|Swift|Kotlin)\b',
            r'\b(?:React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel)\b',
            r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Git|Jenkins|CI/CD)\b',
            r'\b(?:SQL|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)\b',
            r'\b(?:Machine Learning|ML|AI|Data Science|Analytics|Statistics)\b',
            r'\b(?:Agile|Scrum|DevOps|Microservices|REST|API|GraphQL)\b'
        ]
        
        # Seniority level indicators
        self.seniority_keywords = {
            'junior': ['junior', 'entry', 'associate', 'graduate', 'intern'],
            'mid': ['mid', 'intermediate', 'regular', 'software engineer', 'developer'],
            'senior': ['senior', 'sr', 'lead', 'principal', 'staff', 'expert'],
            'manager': ['manager', 'director', 'head', 'chief', 'vp', 'vice president']
        }
        
        # Experience patterns
        self.experience_patterns = [
            r'(\d+)[\+\-\s]*(?:to|-)?\s*(\d+)?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+\s*years?',
            r'minimum\s*(\d+)\s*years?',
            r'at\s*least\s*(\d+)\s*years?'
        ]

    def extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from job description."""
        skills = set()
        text_lower = text.lower()
        
        for pattern in self.skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            skills.update(matches)
        
        # Additional manual extraction for common skills
        skill_keywords = [
            'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
            'node.js', 'django', 'flask', 'spring', 'aws', 'azure', 'docker',
            'kubernetes', 'git', 'sql', 'mongodb', 'postgresql', 'machine learning',
            'data science', 'agile', 'scrum', 'devops', 'rest api', 'microservices'
        ]
        
        for skill in skill_keywords:
            if skill in text_lower:
                skills.add(skill.title())
        
        return list(skills)

    def extract_seniority_level(self, text: str) -> str:
        """Determine seniority level from job description."""
        text_lower = text.lower()
        
        for level, keywords in self.seniority_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return level
        
        return 'mid'  # Default to mid-level if unclear

    def extract_years_of_experience(self, text: str) -> str:
        """Extract years of experience requirement."""
        for pattern in self.experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                if isinstance(matches[0], tuple):
                    # Handle range patterns
                    years = [int(x) for x in matches[0] if x.isdigit()]
                    if len(years) == 2:
                        return f"{years[0]}-{years[1]} years"
                    elif len(years) == 1:
                        return f"{years[0]}+ years"
                else:
                    return f"{matches[0]}+ years"
        
        return "Not specified"

    def extract_location(self, text: str) -> str:
        """Extract preferred location from job description."""
        # Common location patterns
        location_patterns = [
            r'location:?\s*([^\n\r]+)',
            r'based in\s*([^\n\r,]+)',
            r'([A-Z][a-z]+,?\s*[A-Z]{2})',  # City, State
            r'remote',
            r'hybrid',
            r'on-site'
        ]
        
        for pattern in location_patterns:
            matches = re.search(pattern, text, re.IGNORECASE)
            if matches:
                return matches.group(1).strip() if matches.group(1) else matches.group(0)
        
        return "Not specified"

    def extract_job_title(self, text: str) -> str:
        """Extract job title from description."""
        # Look for common title patterns at the beginning
        lines = text.split('\n')
        for line in lines[:5]:  # Check first few lines
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['engineer', 'developer', 'manager', 'analyst', 'scientist']):
                return line
        
        return "Position not clearly specified"

    def generate_summary(self, text: str, job_title: str, skills: List[str]) -> str:
        """Generate a brief summary of the role."""
        # Extract first paragraph or first few sentences
        sentences = re.split(r'[.!?]+', text)
        summary_parts = []
        
        for sentence in sentences[:3]:
            if len(sentence.strip()) > 20:  # Ignore very short sentences
                summary_parts.append(sentence.strip())
        
        if summary_parts:
            base_summary = '. '.join(summary_parts[:2])
        else:
            base_summary = f"Looking for a {job_title}"
        
        # Add key skills if available
        if skills:
            key_skills = ', '.join(skills[:3])
            base_summary += f" with expertise in {key_skills}."
        
        return base_summary

    def parse(self, job_description: str) -> Dict[str, Any]:
        """Parse job description and return structured data."""
        if not job_description or job_description.strip() == "{job_description}":
            return {
                "error": "No job description provided. Please replace {job_description} with actual job description text."
            }
        
        # Extract all components
        job_title = self.extract_job_title(job_description)
        seniority_level = self.extract_seniority_level(job_description)
        required_skills = self.extract_skills(job_description)
        years_of_experience = self.extract_years_of_experience(job_description)
        preferred_location = self.extract_location(job_description)
        summary = self.generate_summary(job_description, job_title, required_skills)
        
        return {
            "jobTitle": job_title,
            "seniorityLevel": seniority_level,
            "requiredSkills": required_skills,
            "yearsOfExperience": years_of_experience,
            "preferredLocation": preferred_location,
            "summary": summary
        }


def main():
    """Main function to demonstrate usage."""
    parser = JobDescriptionParser()
    
    # Example job description for testing
    sample_job_description = """
    Senior Software Engineer - Full Stack Development
    
    We are seeking a Senior Software Engineer to join our dynamic team. The ideal candidate will have 5+ years of experience in full-stack development and be proficient in modern web technologies.
    
    Requirements:
    - 5+ years of professional software development experience
    - Strong proficiency in Python, JavaScript, and React
    - Experience with AWS cloud services
    - Knowledge of Docker and Kubernetes
    - Familiarity with Agile development methodologies
    - Bachelor's degree in Computer Science or related field
    
    Location: San Francisco, CA (Hybrid work arrangement available)
    
    Join our innovative team and help build cutting-edge applications that serve millions of users worldwide.
    """
    
    # Parse the job description
    result = parser.parse(sample_job_description)
    
    # Output as formatted JSON
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()