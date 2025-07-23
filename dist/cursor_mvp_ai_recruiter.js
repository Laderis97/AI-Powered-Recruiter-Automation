"use strict";
// src/cursor_mvp_ai_recruiter.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function callOpenAI(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    const projectId = process.env.OPENAI_PROJECT_ID;
    if (!apiKey)
        throw new Error("❌ Missing OPENAI_API_KEY in .env");
    if (!projectId)
        throw new Error("❌ Missing OPENAI_PROJECT_ID in .env");
    const response = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    }, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "OpenAI-Project": projectId,
        },
    });
    return response.data.choices[0].message.content;
}
async function loadJobDescription() {
    return await promises_1.default.readFile("./input/job_description.txt", "utf-8");
}
async function parseJobDescription(description) {
    const promptTemplate = await promises_1.default.readFile("./prompts/job_parser.txt", "utf-8");
    const fullPrompt = promptTemplate.replace("{job_description}", description);
    const result = await callOpenAI(fullPrompt);
    return JSON.parse(result);
}
async function generateOutreach(candidate, job) {
    const outreachTemplate = await promises_1.default.readFile("./prompts/outreach_template.txt", "utf-8");
    const filledPrompt = outreachTemplate
        .replace("{name}", candidate.name)
        .replace("{jobTitle}", job.jobTitle)
        .replace("{skills}", job.requiredSkills.join(", "))
        .replace("{seniorityLevel}", job.seniorityLevel)
        .replace("{company}", "YourCompany Inc.");
    const result = await callOpenAI(filledPrompt);
    return result.trim();
}
(async () => {
    try {
        const jobText = await loadJobDescription();
        const job = await parseJobDescription(jobText);
        const sampleCandidate = {
            name: "Alex Chen",
            title: "Senior Backend Engineer",
            skills: ["Node.js", "AWS", "MongoDB"],
            location: "Seattle",
            experience: "7 years"
        };
        const message = await generateOutreach(sampleCandidate, job);
        console.log("\n💬 Outreach Message:\n", message);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("🚨 Error:", error.message);
        }
        else {
            console.error("🚨 Unknown error:", error);
        }
    }
})();
