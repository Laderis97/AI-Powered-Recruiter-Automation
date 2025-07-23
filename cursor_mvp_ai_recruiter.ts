import { callOpenAI } from "@cursorai/llm-utils";
import fs from "fs/promises";

interface JobDescription {
  jobTitle: string;
  seniorityLevel: string;
  requiredSkills: string[];
  yearsOfExperience: string;
  preferredLocation: string;
  summary: string;
}

interface Candidate {
  name: string;
  title: string;
  skills: string[];
  location: string;
  experience: string;
}

// --- Load raw job description from file ---
async function loadJobDescription(): Promise<string> {
  const raw = await fs.readFile("./input/job_description.txt", "utf-8");
  return raw;
}

// --- Parse job description using OpenAI + prompt template ---
async function parseJobDescription(description: string): Promise<JobDescription> {
  const prompt = await fs.readFile("./prompts/job_parser.txt", "utf-8");
  const fullPrompt = prompt.replace("{job_description}", description);
  const response = await callOpenAI(fullPrompt, { model: "gpt-4" });
  return JSON.parse(response);
}

// --- Generate outreach message per candidate ---
async function generateOutreach(candidate: Candidate, job: JobDescription): Promise<string> {
  const prompt = await fs.readFile("./prompts/outreach_template.txt", "utf-8");
  let msg = prompt
    .replace("{name}", candidate.name)
    .replace("{jobTitle}", job.jobTitle)
    .replace("{skills}", job.requiredSkills.join(", "))
    .replace("{seniorityLevel}", job.seniorityLevel)
    .replace("{company}", "YourCompany Inc.");

  const response = await callOpenAI(msg, { model: "gpt-4" });
  return response.trim();
}

// --- Example usage ---
(async () => {
  try {
    console.log("🚀 Starting AI Recruiter MVP...\n");
    
    const description = await loadJobDescription();
    console.log("✅ Job description loaded successfully");
    
    const job = await parseJobDescription(description);
    console.log("✅ Job description parsed:", {
      title: job.jobTitle,
      seniority: job.seniorityLevel,
      skills: job.requiredSkills.slice(0, 3).join(", ") + "..."
    });

    const sampleCandidate: Candidate = {
      name: "Alex Chen",
      title: "Senior Backend Engineer",
      skills: ["Node.js", "AWS", "MongoDB"],
      location: "Seattle",
      experience: "7 years"
    };

    console.log("\n👤 Sample Candidate:", sampleCandidate.name);
    
    const message = await generateOutreach(sampleCandidate, job);
    console.log("\n💬 Generated Outreach Message:\n");
    console.log("=".repeat(50));
    console.log(message);
    console.log("=".repeat(50));
    
    console.log("\n✨ AI Recruiter MVP completed successfully!");
    
  } catch (error) {
    console.error("❌ Error running AI Recruiter MVP:", error);
    process.exit(1);
  }
})();