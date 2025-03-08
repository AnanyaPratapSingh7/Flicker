# OpenRouter API Setup for Paradyze v2

This guide explains how to set up and use the OpenRouter API integration in the Paradyze v2 project. The integration allows you to connect directly to hundreds of AI models through a unified API endpoint.

## Quick Start

1. Make sure you have an OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))
2. Create a `.env` file with your API key and configuration (or copy from `.env.example`)
3. Start the OpenRouter proxy server: `node local-openrouter-server.js`
4. Start the frontend: `npm run dev`
5. Test the AI chat functionality

## Detailed Setup Steps

### 1. Environment Configuration

Copy the `.env.example` file to a new file named `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file with the following configuration:

```env
# Required: Your OpenRouter API key
OPENROUTER_API_KEY=your_api_key_here

# Optional: Default AI model to use
OPENROUTER_MODEL=openai/gpt-4o-mini

# Optional: Configure server port
PORT=3005

# Optional: Development mode
NODE_ENV=development

# Frontend configuration
VITE_OPENROUTER_SERVER_URL=http://localhost:3005
VITE_API_ENDPOINT=/api/proxy/ai-chat
```

### 2. Start the OpenRouter Proxy Server

Start the OpenRouter proxy server which handles API key security and request forwarding:

```bash
node local-openrouter-server.js
```

The server runs on port 3005 by default and provides these endpoints:
- Main endpoint: `http://localhost:3005/api/proxy/ai-chat`
- Legacy endpoint: `http://localhost:3005/api/ai-chat`
- Health check: `http://localhost:3005/api/proxy/ai-chat/ping`

### 3. Start the Frontend Development Server

In a new terminal, start the Vite development server:

```bash
npm run dev
```

The frontend will typically start on http://localhost:3001 or another available port.

## Testing Your Setup

Once both servers are running:

1. Navigate to your frontend URL (e.g., http://localhost:3001)
2. Find a page with the AI chat component (or add `<AIInput />` to a page)
3. Type a message and verify that you get a streaming response
4. Check browser console for any connection logs or errors

## Advanced Configuration

### Streaming vs. Non-Streaming Mode

The integration supports both streaming and non-streaming modes:

```jsx
// For streaming responses (default)
<AIInput streamingEnabled={true} />

// For complete responses (wait for full response)
<AIInput streamingEnabled={false} />
```

### Changing the Default Model

You can specify different models either in the environment or component:

```jsx
// In your component
<AIInput model="anthropic/claude-3-opus" />

// Or in .env
OPENROUTER_MODEL=anthropic/claude-3-opus
```

### Component Configuration Options

The `AIInput` component supports many configuration options:

```jsx
<AIInput
  systemPrompt="You are a helpful trading assistant."
  initialPrompt="What is a good trading strategy?"
  temperature={0.8}
  maxTokens={1000}
  showConversation={true}
/>
```

## Troubleshooting

### API Connection Issues

If you experience connection issues:

1. Run `curl http://localhost:3005/api/proxy/ai-chat/ping` to verify the server is responding
2. Check your OpenRouter API key validity on the OpenRouter dashboard
3. Examine the server logs for authentication or connection errors
4. Verify proper environment variables in your `.env` file

### Streaming Issues

If streaming isn't working:

1. Check server logs for any streaming format errors
2. Verify browser console doesn't show parsing errors
3. Ensure your server is properly handling SSE format with the latest updates
4. Try killing and restarting both the proxy server and the frontend

```bash
# Kill any existing server processes
pkill -f "node local-openrouter-server.js"

# Restart the server
node local-openrouter-server.js
```

### CORS Issues

If you see CORS-related errors in the console:

1. Verify that your frontend origin is in the allowed origins list in `local-openrouter-server.js`
2. Check that cookies and credentials are properly handled (the latest implementation uses `credentials: include`)
3. Add your frontend URL to the allowedOrigins array if using a non-standard port

## Port Configuration

Default port configuration:

- **OpenRouter Proxy**: Port 3005
- **Frontend (Vite)**: Automatically assigned (typically 3001, 3002, etc.)

To change the OpenRouter proxy port:

1. Update the `PORT` variable in your `.env` file
2. Update `VITE_OPENROUTER_SERVER_URL` to match the new port
3. Update any direct API calls in your code

## Security Considerations

- The OpenRouter API key is kept secure on the server side
- No API keys are exposed to the frontend
- The server implements rate limiting to prevent abuse
- CORS is configured to only allow specific origins
