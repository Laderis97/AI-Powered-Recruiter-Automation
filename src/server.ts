// src/server.ts

import express from "express";
import bodyParser from "body-parser";
import { callOpenAI } from "./openai";
import path from "path";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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
    const message = await callOpenAI(prompt);
    res.render("index", { output: message.trim() });
  } catch (err) {
    res.render("index", { output: "❌ Failed to generate message." });
  }
});

app.listen(port, () => {
  console.log(`🖥️  Recruiter UI running at http://localhost:${port}`);
});
