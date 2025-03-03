# OpenRouter Integration for Paradyze AI

## Overview

This document explains how the OpenRouter API has been integrated into the Paradyze AI Agent Creator v2 project. This integration provides direct access to hundreds of AI models through a unified API endpoint. The integration has been fully implemented and tested with both streaming and non-streaming modes.

## Implementation Details

### Client-Side Implementation

The integration uses a direct approach to communicate with the OpenRouter API through a backend proxy, replacing the previous Vercel AI SDK implementation. This provides better control over the API and reduces external dependencies.

#### `AIInput` Component

Located at `/src/components/ui/ai-input.tsx`, this component provides:

- Text input with automatic resizing
- Conversation history management
- Support for system prompts
- Streaming and non-streaming response modes
- Error handling and loading states with fallback mechanisms
- Conversation display and clear functionality
- Mock response fallback when the API is unavailable
- Buffer management for handling chunked streaming responses

Example usage:

```tsx
<AIInput 
  systemPrompt="You are an AI assistant that helps with trading strategies."
  initialPrompt="What are the key factors for successful algorithmic trading?"
  model="openai/gpt-4o-mini"
  temperature={0.7}
  maxTokens={1000}
  streamingEnabled={true}
  apiEndpoint="http://localhost:3005/api/ai-chat"
/>
```

#### Component Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `id` | string | "ai-input" | Unique ID for the component |
| `placeholder` | string | "Type your message..." | Placeholder text for the input field |
| `minHeight` | number | 52 | Minimum height of the input field in pixels |
| `maxHeight` | number | 200 | Maximum height of the input field in pixels |
| `onSubmit` | function | - | Callback function when a message is submitted |
| `className` | string | - | Additional CSS classes |
| `showConversation` | boolean | true | Whether to show the conversation history |
| `initialPrompt` | string | - | Initial prompt to start the conversation |
| `systemPrompt` | string | "You are a helpful AI assistant for creating AI agents." | System prompt for the AI |
| `apiEndpoint` | string | "http://localhost:3005/api/ai-chat" | Backend proxy endpoint |
| `model` | string | "openai/gpt-4o-mini" | OpenRouter model to use |
| `temperature` | number | 0.7 | Temperature setting for response randomness |
| `maxTokens` | number | 800 | Maximum tokens in the response |
| `streamingEnabled` | boolean | true | Whether to use streaming for responses |

### Backend Implementation

The backend proxy implementation is provided in `/src/api/chat/index.js` for the main application and in the standalone `local-openrouter-server.js` for local development. This proxy handles:

1. API key security
2. Rate limiting (50 requests per 15 minutes per IP)
3. Error handling and validation
4. Request validation
5. Service discovery via ping endpoints
6. Legacy path compatibility
7. Proper SSE streaming format conversion

#### Integration Steps

1. Integration with your Express app is already done both in the main application and in the local development server:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();
const aiProxyRoutes = require('./src/api/chat');

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3003', 'http://127.0.0.1:3003'], // Allow frontend origins
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add CORS preflight handler
app.options('*', cors({
  origin: ['http://localhost:3003', 'http://127.0.0.1:3003'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Add ping endpoints for service discovery
app.get('/api/ai-chat/ping', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'OpenRouter Proxy' });
});

// Mount API routes
app.use('/api', aiProxyRoutes);

app.listen(3005, () => {
  console.log('Server running on port 3005');
  console.log('Test the API with: http://localhost:3005/api/ai-chat');
});
```

2. Set up environment variables in your `.env` file:

```
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
APP_URL=https://your-app-domain.com
```

## Features

### Non-Streaming Mode
The implementation supports non-streaming mode which:
- Sends the full request to OpenRouter
- Waits for the complete response
- Returns the entire response at once
- Works reliably with both local and production environments

### Streaming Mode
The implementation fully supports streaming mode which:
- Sends a stream request to OpenRouter
- Processes the Server-Sent Events (SSE) format
- Uses buffer management to handle incomplete SSE chunks
- Updates the UI incrementally as tokens arrive
- Provides a more responsive user experience

**Note:** Streaming is enabled by default and can be controlled using the `streamingEnabled` prop on the `AIInput` component or the `stream` parameter in direct API requests.

## Security Considerations

- API keys are stored securely on the server
- The proxy adds rate limiting to prevent abuse
- Request validation ensures properly formatted messages
- Prevents direct exposure of API credentials to client-side code

## Deployment

When deploying to production:

1. Ensure your environment variables are properly set up
2. Consider adjusting rate limits based on expected usage
3. Set up monitoring for API usage and errors
4. Configure proper CORS settings if needed

## Troubleshooting

Common issues and solutions:

- **401 Unauthorized**: Check your OpenRouter API key
- **429 Too Many Requests**: Rate limit exceeded, implement backoff strategy
- **500 Server Error**: Check server logs for detailed error information
- **API Endpoint Not Found**: Ensure the correct path is configured (currently `/api/ai-chat`)
  - The system now tries multiple paths automatically, including `/api/proxy/ai-chat` for legacy compatibility
  - Check browser console logs to see which endpoint was detected and used
- **CORS Issues**: 
  - Ensure the server has proper CORS configuration
  - The server now explicitly allows `localhost:3003` and includes credential support
  - If running on a different port, update the CORS configuration in `local-openrouter-server.js`
- **Port Conflicts**: If port 3005 is already in use, modify the PORT constant in local-openrouter-server.js
- **Connection Refused**: 
  - Ensure the server is running: `node local-openrouter-server.js`
  - The AIInput component will now try multiple endpoints and fall back to mock responses if all fail
- **Streaming Format Errors**: 
  - If receiving incorrect format errors for streaming responses, check that the server-side stream formatter is parsing chunks correctly
  - The server now automatically reformats various response types to match what the frontend expects

## Recent Updates (March 2025)

### March 3rd, 2025 Update - Enhanced Reliability

1. **Smart Endpoint Detection**:
   - Dynamic API server discovery that automatically tries multiple endpoint URLs
   - Support for both current (`/api/ai-chat`) and legacy (`/api/proxy/ai-chat`) paths
   - Frontend can automatically adapt to different server configurations
   - Helpful console logging for debugging endpoint connections

2. **Compatibility Layer**:
   - Added compatibility proxy that forwards requests from legacy endpoints
   - Automatically forwards requests from `/api/proxy/ai-chat` to `/api/ai-chat`
   - Maintains backward compatibility with older code
   - Handles both streaming and non-streaming requests properly

3. **Server Discovery Endpoints**:
   - Added `/api/ai-chat/ping` endpoint for service detection
   - Added legacy endpoint `/api/proxy/ai-chat/ping` for compatibility
   - Frontend can now detect available servers and select the best one

4. **Improved SSE Response Formatting**:
   - Server now properly formats OpenRouter streaming responses to match frontend expectations
   - Consistent format of `{"choices":[{"delta":{"content":"..."}}]}`
   - Buffer management for handling chunked SSE data
   - Proper end-of-stream marker handling

5. **Enhanced CORS Configuration**:
   - Explicit CORS origins for improved security
   - Added preflight request handler for OPTIONS requests
   - Support for credentials in cross-origin requests
   - Detailed request logging for debugging

### Earlier March 2025 Updates

1. **Fixed API Endpoint Path**: Updated from `/api/chat/ai-chat` to `/api/ai-chat` to match server routes

2. **Improved Streaming Implementation**: 
   - Enhanced buffer management for handling incomplete SSE chunks
   - Updated server-side streaming handling for proper event forwarding
   - Fixed compatibility with node-fetch

3. **Error Handling and Fallbacks**:
   - Added mock response system when the API is unavailable
   - Improved error reporting with detailed messages
   - Enhanced state management during errors

4. **Local Development Server**:
   - Created dedicated local-openrouter-server.js for testing
   - Configurable port (currently 3005) to avoid conflicts
   - Comprehensive logging for troubleshooting

5. **TypeScript Improvements**:
   - Fixed TypeScript errors in the AIInput component
   - Improved type definitions and function declarations
   - Enhanced code readability and maintainability
