# ElizaOS Integration Guide for Paradyze V2

This comprehensive guide explains how to set up, configure, and use the ElizaOS integration in Paradyze V2. It documents the working architecture and provides detailed troubleshooting steps to ensure reliable operation.

## Architecture Overview

The Paradyze V2 integration with ElizaOS follows a REST API approach with these components:

```
┌────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│                │    │                   │    │                 │
│  Frontend      │───►│ Integration API   │───►│ ElizaOS Runtime │
│  (Port 3004)   │◄───│ (Port 3006)       │◄───│ (Port 3001)     │
│                │    │                   │    │                 │
└────────────────┘    └───────────────────┘    └─────────────────┘
```

### Components and Port Configuration

1. **ElizaOS Runtime** (Port 3001)
   - Core AI engine that powers the agents
   - Handles model selection and message processing
   - Manages agent state and memory

2. **Integration API** (Port 3006)
   - REST API middleware between frontend and ElizaOS
   - Manages agent lifecycle (creation, deletion)
   - Handles message passing and formatting

3. **Frontend** (Port 3004)
   - React-based user interface
   - Chat components for agent interaction
   - Agent creation and management UI

4. **OpenRouter Proxy** (Port 3005)
   - Handles AI model API requests
   - Provides access to various AI models

5. **Service Registry** (Port 3999)
   - Optional service for service discovery
   - Helps components find each other

## Prerequisites

- Node.js 23.3.0 or later
- npm or pnpm (recommended)
- OpenRouter API key (recommended) or OpenAI API key
- Twitter API credentials (optional, for social media integration)

## Installation and Setup

### 1. Directory Structure

Ensure your project has the following structure:

```
paradyzev2/
├── backend/
│   ├── eliza-main/               # Core ElizaOS repository
│   │   ├── characters/           # Character templates
│   │   └── ...                   
│   └── eliza-integration/        # Integration service
│       ├── ElizaIntegrationService.ts
│       ├── api.ts
│       └── ...
├── docs/                         # Documentation
├── src/                          # Frontend code
└── ...
```

### 2. ElizaOS Runtime Setup

```bash
# Clone the ElizaOS repository if not already present
git clone git@github.com:elizaos/eliza.git backend/eliza-main

# Configure environment variables
cd backend/eliza-main
cp .env.example .env
```

Edit the `.env` file with the following configuration:

```
# Service Configuration
ELIZAOS_PORT=3001
ELIZAOS_MODE=development

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
DEFAULT_MODEL_PROVIDER=openrouter

# AI-specific variables (required for proper model access)
AI_OPENROUTER_API_KEY=your_openrouter_api_key
AI_OPENROUTER_MODEL=openai/gpt-4o-mini
```

> **IMPORTANT**: The `AI_OPENROUTER_API_KEY` variable is critical. ElizaOS specifically looks for variables with the `AI_` prefix when accessing model providers.

### 3. Integration Service Setup

```bash
# Navigate to the integration service directory
cd ../eliza-integration

# Create environment file
cp .env.example .env
```

Edit the `.env` file with the following configuration:

```
# Integration Service Configuration
INTEGRATION_PORT=3006
ELIZAOS_INTEGRATION_MODE=api

# ElizaOS Connection
ELIZAOS_PORT=3001

# OpenRouter Configuration (for reference)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini

# App settings
APP_URL=http://localhost:3004
NODE_ENV=development
```

Install dependencies:

```bash
npm install
```

### 4. Frontend Configuration

Ensure your `vite.config.ts` has the correct port and proxy settings:

```typescript
export default defineConfig({
  // ...other config
  server: {
    port: 3004,
    proxy: {
      '/api': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // ...other config
});
```

## Starting the Services

Start the services in the following order:

### 1. Start ElizaOS Runtime

```bash
cd backend/eliza-main
npm start
```

Or use the provided script:

```bash
node start-elizaos.js
```

### 2. Start Integration Service

```bash
cd backend/eliza-integration
npm run dev
```

### 3. Start OpenRouter Proxy (if needed)

```bash
node local-openrouter-server.js
```

### 4. Start Frontend

```bash
npm run dev
```

Alternatively, you can use the development manager script to start all services (except ElizaOS):

```bash
node paradyze-dev.js
```

## Integration Service Implementation

The integration service uses a REST API approach to communicate with ElizaOS. This is more reliable than direct library imports because:

1. It properly decouples your integration service from ElizaOS's internal implementation
2. It doesn't depend on the module system (ESM vs CommonJS) of the ElizaOS codebase
3. It uses stable HTTP interfaces instead of direct library imports

### Key Files

1. **ElizaIntegrationService.ts**
   - Core service that manages communication with ElizaOS
   - Handles starting/stopping the ElizaOS runtime
   - Manages agent creation and messaging

2. **api.ts**
   - Express server that exposes REST endpoints
   - Routes requests to the ElizaIntegrationService
   - Handles error handling and response formatting

### REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/eliza/start` | POST | Start the ElizaOS runtime |
| `/api/eliza/stop` | POST | Stop the ElizaOS runtime |
| `/api/eliza/status` | GET | Check if ElizaOS is running |
| `/api/agents` | POST | Create a new agent |
| `/api/agents` | GET | List all agents |
| `/api/agents/:agentId` | GET | Get agent details |
| `/api/agents/:agentId` | DELETE | Delete an agent |
| `/api/agents/:agentId/messages` | POST | Send a message to an agent |
| `/api/agents/:agentId/message` | POST | Alternative endpoint for sending messages |
| `/api/agents/:agentId/messages` | GET | Get conversation history |
| `/api/agents/:agentId/twitter/enable` | POST | Enable Twitter for an agent |
| `/api/agents/:agentId/twitter/tweet` | POST | Post a tweet via an agent |
| `/api/agents/:agentId/model-provider` | POST | Set the agent's model provider |

## Using the Integration

### Creating an Agent

```typescript
// Example: Create a trading agent
const createAgent = async () => {
  try {
    const response = await axios.post('http://localhost:3006/api/agents', {
      templateName: 'trading-agent', // Uses trading-agent.character.json template
      name: 'My Trading Assistant',
      description: 'Specialized in crypto market analysis'
    });
    
    const agentId = response.data.agentId;
    console.log('Agent created with ID:', agentId);
    return agentId;
  } catch (error) {
    console.error('Failed to create agent:', error);
  }
};
```

### Sending Messages

```typescript
// Example: Send a message to an agent
const sendMessage = async (agentId, message, userId = 'user') => {
  try {
    const response = await axios.post(`http://localhost:3006/api/agents/${agentId}/messages`, {
      message,
      userId
    });
    
    const agentResponse = response.data.response;
    console.log('Agent response:', agentResponse);
    return agentResponse;
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
```

### Enabling Twitter Integration

```typescript
// Example: Enable Twitter for an agent
const enableTwitter = async (agentId) => {
  try {
    await axios.post(`http://localhost:3006/api/agents/${agentId}/twitter/enable`);
    console.log('Twitter integration enabled for agent');
  } catch (error) {
    console.error('Failed to enable Twitter:', error);
  }
};
```

### Posting a Tweet

```typescript
// Example: Post a tweet via an agent
const postTweet = async (agentId, content) => {
  try {
    const response = await axios.post(`http://localhost:3006/api/agents/${agentId}/twitter/tweet`, {
      content
    });
    
    console.log('Tweet posted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to post tweet:', error);
  }
};
```

## Character Configuration

ElizaOS agents are defined using character templates. Here's an example of a trading agent character:

```json
{
  "name": "Trading Assistant",
  "description": "An AI assistant specializing in financial markets and trading insights.",
  "system": "You are Trading Assistant. An AI assistant specializing in financial markets and trading insights.",
  "modelProvider": "openrouter",
  "clients": [
    "direct", 
    "twitter"
  ],
  "plugins": [
    "search",
    "crypto",
    "stocks"
  ],
  "settings": {
    "ragKnowledge": true,
    "secrets": {},
    "model": "openai/gpt-4o-mini"
  },
  "lore": [
    "A trading agent focused on market analysis",
    "Provides clear entry and exit points for trades",
    "Risk-conscious but calculates potential rewards"
  ],
  "topics": [
    "Financial Markets",
    "Trading Strategies",
    "Technical Analysis",
    "Fundamental Analysis",
    "Risk Management"
  ],
  "adjectives": [
    "analytical",
    "data-driven",
    "strategic",
    "risk-conscious"
  ],
  "messageExamples": [[
    {
      "user": "user1",
      "content": { "text": "What's your trading strategy?" },
      "response": "As Trading Assistant, I analyze markets using technical and fundamental analysis to identify optimal trading opportunities."
    }
  ]],
  "postExamples": [
    "Market Analysis: BTC showing strong support at $45K with increasing volume...",
    "Trading Update: Key levels to watch - Support: $44,800, Resistance: $46,200..."
  ],
  "style": {
    "all": [],
    "chat": [
      "Clear and concise communication",
      "Data-driven analysis",
      "Professional tone"
    ],
    "post": []
  },
  "memorySettings": {
    "enableRagKnowledge": true,
    "enableLoreMemory": true,
    "enableDescriptionMemory": true,
    "enableDocumentsMemory": false
  }
}
```

### Required Character Fields

All character configurations must include:
1. Base information (`name`, `description`, `system`)
2. Model settings (`modelProvider`, `settings`)
3. Integration settings (`clients`, `plugins`)
4. Character attributes (`lore`, `topics`, `adjectives`)
5. Examples (`messageExamples`, `postExamples`)
6. Style guidelines (`style`)
7. Memory configuration (`memorySettings`)

## Model Configuration

ElizaOS supports multiple model providers. In Paradyze V2, we use OpenRouter for flexible access to various AI models.

### OpenRouter Configuration

OpenRouter allows you to use various models (OpenAI, Anthropic, etc.) with a single API key. Configure it in your `.env` file:

```bash
# Add to your .env file in backend/eliza-main
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
SMALL_OPENROUTER_MODEL=openai/gpt-4o-mini
MEDIUM_OPENROUTER_MODEL=openai/gpt-4o-mini
LARGE_OPENROUTER_MODEL=openai/gpt-4o-mini
DEFAULT_MODEL_PROVIDER=openrouter

# CRITICAL: Add AI-prefixed versions for direct model access
AI_OPENROUTER_API_KEY=your_openrouter_api_key
AI_OPENROUTER_MODEL=openai/gpt-4o-mini
```

### Model Selection Logic

ElizaOS uses a class-based model selection system:

1. **SMALL**: Used for simple, less computationally intensive tasks
2. **MEDIUM**: Used for moderately complex tasks
3. **LARGE**: Used for complex reasoning and detailed responses

## Database Configuration

ElizaOS requires a database to store agent data, memories, and knowledge. In Paradyze V2, we support two database options:

### SQLite (Development)

For development environments, we use SQLite, which is a lightweight, file-based database that requires no additional setup.

Configuration in `.env`:
```
DATABASE_URL=sqlite:./data/paradyze.db
```

### PostgreSQL (Production)

For production environments, we use PostgreSQL with the pgvector extension for optimal performance and scalability.

Configuration in `.env`:
```
DATABASE_URL=postgres://postgres:postgres@postgres:5432/paradyze
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Module System Mismatch

**Symptoms:**
- Error messages about "No exports main defined"
- Issues with ESM vs CommonJS modules

**Solution:**
- Use the REST API approach instead of direct library imports
- Ensure package.json doesn't have `"type": "module"`
- Use CommonJS module format in tsconfig.json

#### 2. Port Configuration Issues

**Symptoms:**
- Services can't communicate with each other
- "Connection refused" errors

**Solution:**
- Verify port configurations in all .env files
- Update ElizaIntegrationService to use the correct ElizaOS port
- Check proxy settings in vite.config.ts

#### 3. API Key Access Problems

**Symptoms:**
- "AI_LoadAPIKeyError" in ElizaOS logs
- Model provider errors

**Solution:**
- Add both standard and AI-prefixed API keys to ElizaOS .env
- Example: `OPENROUTER_API_KEY` and `AI_OPENROUTER_API_KEY`
- Restart ElizaOS after changing environment variables

#### 4. Direct Client Dependency Issues

**Symptoms:**
- Errors related to @elizaos/client-direct
- Module resolution problems

**Solution:**
- Remove direct dependencies on ElizaOS packages
- Use the REST API approach instead
- Update package.json to remove file: dependencies

### Debugging Steps

1. **Check Service Status**
   ```bash
   node check-services.js
   ```

2. **Verify Environment Variables**
   ```bash
   # ElizaOS
   cat backend/eliza-main/.env
   
   # Integration Service
   cat backend/eliza-integration/.env
   ```

3. **Check Logs**
   - ElizaOS logs in its terminal
   - Integration Service logs in its terminal
   - Frontend logs in browser console

4. **Test API Endpoints**
   ```bash
   # Check if ElizaOS is running
   curl http://localhost:3006/api/eliza/status
   
   # List agents
   curl http://localhost:3006/api/agents
   ```

## Best Practices

### 1. Use REST API Approach

Always use the REST API approach for integration. This provides better isolation between services and avoids module compatibility issues.

### 2. Proper Environment Configuration

- Keep environment variables consistent across services
- Use both standard and AI-prefixed API keys for ElizaOS
- Restart services after changing environment variables

### 3. Port Management

- Document the ports used by each service
- Use environment variables to configure ports
- Ensure proxy settings in the frontend match the integration service port

### 4. Error Handling

- Implement proper error handling in API calls
- Provide fallback mechanisms for when services are unavailable
- Log errors with sufficient context for debugging

## Advanced Configuration

### Custom Character Templates

You can create custom character templates for different types of trading agents:

1. Create a new character JSON file in `backend/eliza-main/characters/`
2. Use the template structure shown above
3. Customize the fields for your specific use case
4. Reference the template name when creating agents

### Model Provider Selection

You can configure different model providers for different agent types:

```json
{
  "name": "Premium Trading Assistant",
  "modelProvider": "openai",
  "settings": {
    "model": "gpt-4"
  }
}
```

```json
{
  "name": "Standard Trading Assistant",
  "modelProvider": "openrouter",
  "settings": {
    "model": "openai/gpt-4o-mini"
  }
}
```

## Conclusion

This guide provides a comprehensive overview of the ElizaOS integration in Paradyze V2. By following the REST API approach and proper configuration steps, you can ensure a reliable and maintainable integration.

For any issues not covered in this guide, please refer to the ElizaOS documentation or create an issue in the Paradyze V2 repository.
