/**
 * Test script for the OpenRouter API proxy
 * 
 * Run this script with: node test-proxy.js
 */

const axios = require('axios');

async function testOpenRouterProxy() {
  try {
    console.log('Testing OpenRouter API proxy...');
    
    const response = await axios.post('http://localhost:3001/api/proxy/ai-chat', {
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant.'
        },
        {
          role: 'user',
          content: 'Hello, can you give me a quick test response?'
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });
    
    console.log('\nResponse from AI proxy:');
    console.log('Status:', response.status);
    console.log('Model:', response.data.model);
    console.log('Content:', response.data.choices[0].message.content);
    console.log('Usage:', response.data.usage);
    
    console.log('\nProxy test completed successfully!');
  } catch (error) {
    console.error('Error testing proxy:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testOpenRouterProxy(); 