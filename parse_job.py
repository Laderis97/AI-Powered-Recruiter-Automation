#!/usr/bin/env python3
"""
Simple Job Description Parser
Usage: Replace {job_description} with actual job description text
"""

import json
import sys
from job_parser import JobDescriptionParser


def parse_job_description(job_description_text):
    """Parse job description and return JSON output."""
    
    # Handle the placeholder case
    if "{job_description}" in job_description_text:
        return {
            "error": "Please replace {job_description} with actual job description text",
            "example": {
                "jobTitle": "Senior Software Engineer",
                "seniorityLevel": "senior", 
                "requiredSkills": ["Python", "JavaScript", "React", "AWS"],
                "yearsOfExperience": "5+ years",
                "preferredLocation": "San Francisco, CA", 
                "summary": "Senior Software Engineer position requiring 5+ years experience with modern web technologies."
            }
        }
    
    # Parse the actual job description
    parser = JobDescriptionParser()
    result = parser.parse(job_description_text)
    return result


if __name__ == "__main__":
    # Example usage - replace the placeholder with actual job description
    job_description = "{job_description}"
    
    result = parse_job_description(job_description)
    print(json.dumps(result, indent=2))