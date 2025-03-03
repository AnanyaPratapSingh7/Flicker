# OpenRouter AI Proxy Setup Guide

This guide provides instructions for setting up and testing the secure OpenRouter AI proxy in the Paradyze V2 backend.

## Installation

1. Navigate to the eliza-integration directory:
   ```bash
   cd backend/eliza-integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   ```bash
   # Copy the example .env file (if you haven't already)
   cp .env.example .env
   
   # Edit the .env file to add your OpenRouter API key
   # Make sure to add your real API key
   nano .env
   ```

## Running the Service

1. Start the ElizaOS integration service:
   ```bash
   npm run dev
   ```

2. The service will start on the configured port (default: 3001) and the AI proxy will be available at:
   ```
   POST http://localhost:3001/api/proxy/ai-chat
   ```

## Testing the Proxy

You can test the proxy using the included test script:

1. In a new terminal, navigate to the eliza-integration directory:
   ```bash
   cd backend/eliza-integration
   ```

2. Run the test script:
   ```bash
   node test-proxy.js
   ```

3. If everything is configured correctly, you should see output similar to this:
   ```
   Testing OpenRouter API proxy...
   
   Response from AI proxy:
   Status: 200
   Model: openai/gpt-4o-mini
   Content: Hello! This is a test response. How can I assist you today?
   Usage: { prompt_tokens: 23, completion_tokens: 13, total_tokens: 36 }
   
   Proxy test completed successfully!
   ```

## Common Issues

### API Key Not Set

If you see an error like this:
```
API configuration error
```

Make sure your OPENROUTER_API_KEY is properly set in the .env file.

### Rate Limit Exceeded

If you see an error like this:
```
Too many requests, please try again later
```

You've hit the rate limit. Wait 15 minutes before trying again.

### Network or Server Issues

If you cannot connect to the server, make sure:
1. The ElizaOS integration service is running
2. You're using the correct port
3. There are no firewall issues

## Updating the Frontend

After setting up the proxy, update your frontend code to use the secure proxy endpoint instead of calling OpenRouter directly. See the [AI Proxy Usage Guide](./ai-proxy-usage.md) for more details.

## Security Considerations

- Never expose your OpenRouter API key in frontend code
- Always use the proxy for AI requests
- Consider implementing additional security measures for production environments
- Monitor API usage to control costs 