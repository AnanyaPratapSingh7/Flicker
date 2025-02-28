# ElizaOS Integration for Paradyze V2

This document provides an overview of the ElizaOS integration in Paradyze V2's trading agent platform.

## Overview

ElizaOS is a powerful framework for building AI agents with multiple personality types, integration points, and capabilities. In Paradyze V2, we use ElizaOS to:

1. Create and manage trading-focused AI agents
2. Process user messages and generate AI responses
3. Post insights to social media platforms like Twitter

## Updated Architecture

The ElizaOS integration now follows a more modular approach:

```
backend/
├── eliza-main/               # Core ElizaOS repository (cloned from official repo)
│   ├── characters/           # Character templates
│   │   └── trading-agent.character.json
│   └── ...                   # Standard ElizaOS files
├── eliza-integration/        # Integration service layer
│   ├── ElizaIntegrationService.ts  # Service for managing ElizaOS
│   ├── api.ts                # Express API for frontend integration
│   └── ...                   # Configuration files
└── eliza/                    # Legacy components (for backward compatibility)
    ├── TwitterService.ts     # Twitter integration service
    ├── SupabaseService.ts    # Database integration service
    └── server.ts             # Legacy API server
```

## Integration Components

### ElizaIntegrationService

The `ElizaIntegrationService` provides a unified interface for:

- Starting and stopping the ElizaOS runtime
- Creating and managing agents based on character templates
- Sending and receiving messages
- Managing social media integrations

### Integration API

The integration API exposes ElizaOS functionality via HTTP endpoints:

```
/api/eliza/start           # Start ElizaOS runtime
/api/eliza/stop            # Stop ElizaOS runtime
/api/eliza/status          # Check ElizaOS status
/api/agents                # CRUD operations for agents
/api/agents/:id/messages   # Send/retrieve messages
/api/agents/:id/twitter/   # Twitter integration endpoints
```

## Character Configuration

We've created a specialized trading agent character template located at:
`backend/eliza-main/characters/trading-agent.character.json`

This character is optimized for financial market analysis, trading strategy development, and social media content generation.

### Example Character Configuration

```json
{
  "name": "Trading Assistant",
  "description": "An AI assistant specializing in financial markets and trading insights.",
  "basePrompt": "You are an AI trading assistant with expertise in financial markets...",
  "modelProvider": "openrouter",
  "clients": [
    "direct", 
    "twitter"
  ],
  "settings": {
    "memory": {
      "messageLimit": 50
    },
    "response": {
      "temperature": 0.7,
      "maxTokens": 500
    }
  },
  "topics": [
    "Financial Markets",
    "Trading Strategies",
    "Technical Analysis",
    "Fundamental Analysis",
    "Risk Management"
  ]
}
```

## Model Providers

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
```

### Model Selection Logic

ElizaOS uses a class-based model selection system:

1. **SMALL**: Used for simple, less computationally intensive tasks
2. **MEDIUM**: Used for moderately complex tasks
3. **LARGE**: Used for complex reasoning and detailed responses

The actual model used depends on your environment configuration and the task complexity. To ensure the correct model is used, specify all three model classes in your environment variables.

## Database Configuration

ElizaOS requires a database to store agent data, memories, and knowledge. In Paradyze V2, we support two database options:

### SQLite (Development)

For development environments, we use SQLite, which is a lightweight, file-based database that requires no additional setup. The database file is stored in the `data` directory at the project root.

Benefits of using SQLite for development:
- Zero configuration required
- Self-contained in a single file
- Easy to reset by deleting the database file
- No need to run a separate database server

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

To switch between database configurations, update the `DATABASE_URL` in your `.env` file and run the appropriate initialization script:

```bash
# For SQLite (development)
./scripts/init-sqlite.sh

# For PostgreSQL (production)
./scripts/init-postgres.sh
```

For detailed database configuration instructions, see the [ElizaOS Integration Guide](./elizaos-integration-guide.md#database-configuration).

## Getting Started

For detailed installation and usage instructions, please refer to the [ElizaOS Integration Guide](./elizaos-integration-guide.md).

### Prerequisites

- Node.js 23+
- pnpm (recommended) or npm
- OpenRouter API key (recommended) or OpenAI API key
- Twitter API credentials (for Twitter integration)

### Quick Setup

1. Clone the ElizaOS repository into `/backend/eliza-main` (if not already done)
2. Configure environment variables for both ElizaOS and the integration service
3. Install dependencies for the integration service
4. Start the integration service using `pnpm dev` or `npm run dev`

## Frontend Integration

Integrate with the ElizaOS API from your frontend components:

```typescript
// Example: Create a trading agent
const createTradingAgent = async (name, description) => {
  const response = await fetch('http://localhost:3001/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      templateName: 'trading-agent',
      name, 
      description 
    })
  });
  return response.json();
};

// Example: Send a message to get trading analysis
const getTradingAnalysis = async (agentId, marketSymbol) => {
  const response = await fetch(`http://localhost:3001/api/agents/${agentId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: `Analyze the current market conditions for ${marketSymbol}`,
      userId: 'user-123'
    })
  });
  return response.json();
};
```

## References and Resources

- [ElizaOS Official Documentation](https://elizaos.github.io/eliza/docs/quickstart/)
- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [Paradyze V2 ElizaOS Integration Guide](./elizaos-integration-guide.md)

## Chat Implementation Overview

The chat functionality in Paradyze V2 leverages ElizaOS's messaging capabilities with OpenRouter integration for optimal AI model selection. Here's how it works:

### Architecture

```
┌────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│                │    │                   │    │                 │
│  React UI      │───►│ Integration API   │───►│ ElizaOS Agent   │
│  Components    │◄───│ Service           │◄───│ Runtime         │
│                │    │                   │    │                 │
└────────────────┘    └───────────────────┘    └─────────────────┘
```

### Components

1. **Frontend React Components**: 
   - Chat UI with message history and input field
   - Real-time feedback (typing indicators)
   - Message sending and history retrieval

2. **Integration API Layer**:
   - RESTful API endpoints for sending messages and retrieving history
   - Message transformation and validation
   - Error handling and response formatting

3. **ElizaOS Agent Runtime**:
   - Message processing using the configured OpenRouter model
   - Context management using ElizaOS's memory managers
   - Model selection based on message complexity

### Model Selection

The chat implementation uses the `MEDIUM` model class by default, which maps to the configured OpenRouter model (`MEDIUM_OPENROUTER_MODEL`). This provides a good balance of performance and cost-effectiveness for standard chat interactions.

### Message Flow

1. User enters a message in the frontend UI
2. Message is sent to the Integration API via a POST request
3. API forwards the message to ElizaOS for processing
4. ElizaOS uses OpenRouter with gpt-4o-mini to generate a response
5. Response is returned to the API and then to the frontend
6. Frontend updates the UI with the new message

For detailed implementation code examples, see the [ElizaOS Integration Guide](./elizaos-integration-guide.md#chat-implementation).
