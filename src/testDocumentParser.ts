// src/testDocumentParser.ts

import { documentParser } from './documentParser.js';
import path from 'path';

async function testDocumentParser() {
  try {
    console.log('🧪 Testing Document Parser...\n');

    const sampleResumePath = path.join(
      process.cwd(),
      'input',
      'sample_resume.txt'
    );

    console.log('📄 Parsing sample resume...');
    const candidate = await documentParser.parseDocument(
      sampleResumePath,
      'sample_resume.txt'
    );

    console.log('\n✅ Parsed Candidate Information:');
    console.log('================================');
    console.log(`Name: ${candidate.name}`);
    console.log(`Email: ${candidate.email || 'Not found'}`);
    console.log(`Phone: ${candidate.phone || 'Not found'}`);
    console.log(`Title: ${candidate.title || 'Not found'}`);
    console.log(`Current Company: ${candidate.currentCompany || 'Not found'}`);
    console.log(`Location: ${candidate.location || 'Not found'}`);
    console.log(`Experience: ${candidate.experience}`);
    console.log(`Skills: ${candidate.skills.join(', ')}`);
    console.log(`Education: ${candidate.education.join(', ')}`);
    console.log(`LinkedIn: ${candidate.linkedin || 'Not found'}`);
    console.log(`GitHub: ${candidate.github || 'Not found'}`);
    console.log(`Portfolio: ${candidate.portfolio || 'Not found'}`);

    if (candidate.summary) {
      console.log(`\nSummary: ${candidate.summary}`);
    }

    console.log('\n🎉 Document parser test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing document parser:', error);
  }
}

// Run the test
testDocumentParser();
