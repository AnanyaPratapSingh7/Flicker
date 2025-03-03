# Secure OpenRouter API Proxy Usage Guide

This document explains how to use the secure OpenRouter API proxy endpoint implemented in the Paradyze V2 backend.

## Overview

The OpenRouter API proxy allows you to make requests to AI models through OpenRouter while keeping your API key secure. The key is stored only on the server-side and never exposed to the client.

## API Endpoint

The proxy is available at:

```
POST /api/proxy/ai-chat
```

## Request Format

```javascript
{
  "messages": [
    {
      "role": "system",
      "content": "You are an AI assistant helping to create an agent."
    },
    {
      "role": "user",
      "content": "Help me create a trading agent that analyzes market trends."
    }
  ],
  "temperature": 0.7,  // optional, defaults to 0.7
  "max_tokens": 800    // optional, defaults to 800
}
```

### Required Fields

- `messages`: An array of message objects, each with a `role` ("system", "user", or "assistant") and a `content` string.

### Optional Fields

- `temperature`: Controls randomness. Higher values (e.g., 0.8) make output more random, lower values (e.g., 0.2) make it more deterministic.
- `max_tokens`: Maximum number of tokens in the response.

## Response Format

The response will match the OpenRouter API response format:

```javascript
{
  "id": "gen-xxx",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "openai/gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'll help you create a trading agent that analyzes market trends..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 100,
    "total_tokens": 125
  }
}
```

## Example Usage in React

Here's how to use the AI proxy in your React components:

```typescript
import axios from 'axios';

// Function to call the AI assistant
const callAIAssistant = async (userMessage, conversationContext) => {
  try {
    const response = await axios.post('/api/proxy/ai-chat', {
      messages: [
        {
          role: "system", 
          content: `You are an AI assistant helping to create an agent with Eliza framework. 
          You're currently in the "${conversationContext.stepTitle}" step of the creation process.`
        },
        ...conversationContext.previousMessages,
        { 
          role: "user", 
          content: userMessage 
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    
    // Extract the AI response content
    const aiContent = response.data.choices[0].message.content;
    
    return aiContent;
  } catch (error) {
    console.error('Error calling AI service:', error);
    throw error;
  }
};
```

## Security Features

The proxy implementation includes several security features:

1. **Rate Limiting**: Prevents abuse by limiting requests to 50 per 15 minutes per IP address.
2. **Request Validation**: Ensures requests are properly formatted before forwarding to OpenRouter.
3. **Error Handling**: Provides appropriate error responses without leaking sensitive information.
4. **Secure API Key Storage**: Keeps the API key on the server side only.

## Error Handling

The proxy will return appropriate HTTP status codes and error messages:

- `400 Bad Request`: If the request format is invalid.
- `429 Too Many Requests`: If you exceed the rate limit.
- `500 Internal Server Error`: For server-side issues or OpenRouter API failures.

## Implementation Details

The proxy is implemented using Express.js and makes server-side requests to the OpenRouter API. The implementation can be found in the `backend/eliza-integration/aiProxy.ts` file.

## Setting Up Your Environment

To use the OpenRouter API proxy, make sure you have set the following environment variables in your backend:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

You can create a `.env` file in the `backend/eliza-integration` directory based on the `.env.example` template. 