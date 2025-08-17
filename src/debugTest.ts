// src/debugTest.ts

import { callOpenAI } from './openai.js';
import fs from 'fs-extra';
import path from 'path';

async function debugTest() {
  try {
    console.log('🔍 Debug Test Starting...\n');
    
    // Test 1: Check environment variables
    console.log('1. Checking environment variables...');
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('OPENAI_PROJECT_ID:', process.env.OPENAI_PROJECT_ID ? '✅ Set' : '❌ Missing');
    
    // Test 2: Test OpenAI API call
    console.log('\n2. Testing OpenAI API call...');
    try {
      const testResponse = await callOpenAI('Say "Hello World"');
      console.log('✅ OpenAI API working:', testResponse.substring(0, 50) + '...');
    } catch (error) {
      console.log('❌ OpenAI API failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Test 3: Test file reading
    console.log('\n3. Testing file reading...');
    try {
      const samplePath = path.join(process.cwd(), 'input', 'sample_resume.txt');
      const fileContent = await fs.readFile(samplePath, 'utf-8');
      console.log('✅ File reading working, content length:', fileContent.length);
      console.log('First 100 chars:', fileContent.substring(0, 100));
    } catch (error) {
      console.log('❌ File reading failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Test 4: Test JSON parsing
    console.log('\n4. Testing JSON parsing...');
    try {
      const testJson = '{"name": "John Doe", "email": "john@example.com"}';
      const parsed = JSON.parse(testJson);
      console.log('✅ JSON parsing working:', parsed);
    } catch (error) {
      console.log('❌ JSON parsing failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('\n🎯 Debug test completed!');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Run the debug test
debugTest();
