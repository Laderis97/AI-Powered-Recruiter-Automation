"use strict";
// src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const openai_1 = require("./openai");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "..", "views"));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.get("/", (req, res) => {
    res.render("index", { output: null });
});
app.post("/generate", async (req, res) => {
    const { jobDescription, name, title, skills, location, experience } = req.body;
    const prompt = `
You are an AI recruiter assistant. Given this job description:

${jobDescription}

And candidate:
- Name: ${name}
- Title: ${title}
- Skills: ${skills}
- Location: ${location}
- Experience: ${experience}

Generate a concise outreach message to the candidate highlighting how their skills fit the role. Keep it under 300 words.
`;
    try {
        const message = await (0, openai_1.callOpenAI)(prompt);
        res.render("index", { output: message.trim() });
    }
    catch (err) {
        res.render("index", { output: "❌ Failed to generate message." });
    }
});
app.listen(port, () => {
    console.log(`🖥️  Recruiter UI running at http://localhost:${port}`);
});
