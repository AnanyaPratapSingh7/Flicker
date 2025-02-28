# ElizaOS Integration Guide for Paradyze V2

This guide explains how to set up and use the ElizaOS integration in Paradyze V2. The integration allows you to create and manage trading AI agents powered by ElizaOS.

## Setup Overview

The Paradyze V2 integration with ElizaOS consists of three main components:

1. **ElizaOS Runtime**: The core ElizaOS system that powers the AI agents
2. **Integration Service**: A middleware layer that manages communication between Paradyze V2 and ElizaOS
3. **Frontend Components**: React components that interact with the Integration Service

## Prerequisites

- Node.js 23.3.0 or later
- pnpm (recommended) or npm
- OpenAI API key (for the AI models) or OpenRouter API key
- Twitter API credentials (for social media integration)

## Installation Steps

### 1. ElizaOS Runtime Setup

ElizaOS is the core engine that powers the trading agents. Follow these steps to set it up:

```bash
# Clone the ElizaOS repository
git clone git@github.com:elizaos/eliza.git backend/eliza-main

# Configure environment variables
cd backend/eliza-main
cp .env.example .env

# Edit .env and add your API key (OpenAI or OpenRouter)
# OPENAI_API_KEY=your_key_here
# or
# OPENROUTER_API_KEY=your_key_here
```

### 2. Model Provider Configuration

ElizaOS supports multiple model providers. For enhanced flexibility, you can use OpenRouter to access various models:

```bash
# Add to your .env file in backend/eliza-main
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
SMALL_OPENROUTER_MODEL=openai/gpt-4o-mini
MEDIUM_OPENROUTER_MODEL=openai/gpt-4o-mini
LARGE_OPENROUTER_MODEL=openai/gpt-4o-mini
DEFAULT_MODEL_PROVIDER=openrouter
```

The above configuration sets OpenRouter as the default provider and configures all model classes (SMALL, MEDIUM, LARGE) to use the gpt-4o-mini model.

### 3. Install Integration Service Dependencies

```bash
cd ../eliza-integration
cp .env.example .env
npm install
```

### 4. Start the Integration Service

```bash
npm run dev
```

This will start the integration API service on port 3001 (or the port specified in your .env file).

## Using the Integration

### Starting ElizaOS

Before using the agents, you need to start the ElizaOS runtime:

```typescript
// In your React component or service
import axios from 'axios';

const startElizaOS = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/eliza/start');
    console.log('ElizaOS started:', response.data);
  } catch (error) {
    console.error('Failed to start ElizaOS:', error);
  }
};

// Call this function when initializing your application
startElizaOS();
```

### Creating a Trading Agent

```typescript
const createAgent = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/agents', {
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

### Agent Creation Interface

The Paradyze V2 platform provides a streamlined user interface for creating trading agents. The interface is designed to be intuitive and user-friendly while still allowing for powerful agent customization.

#### Interface Layout

The agent creation interface features a two-column layout:

1. **Left Column**: Agent configuration form with preview card
2. **Right Column**: Chat preview interface to test interaction with the agent

#### Agent Configuration Fields

The interface focuses on four primary input fields:

1. **Name**: The display name for the agent (e.g., "AlphaTrader")
2. **Ticker**: A unique 5-character identifier for the agent (automatically converted to uppercase)
3. **Description**: A brief summary of the agent's purpose and capabilities
4. **Personality**: A comprehensive field where users describe the agent's characteristics, trading style, expertise, and behavior

#### Personality Field

The personality field is the core of agent customization. Users are encouraged to provide rich, descriptive text about their desired agent characteristics. The backend system parses this field to generate the detailed character configuration.

Example personality description:
```
Analytical and data-driven with a focus on technical analysis. Provides clear entry and exit points for trades. Risk-conscious but willing to take calculated risks when the reward potential is high. Specializes in cryptocurrency markets with emphasis on Bitcoin and major altcoins.
```

#### Client Integration

Users can select which platforms the agent should be available on:
- Direct Chat (enabled by default)
- Twitter

#### Random Agent Generation

The interface includes a "Generate Random" button that creates a pre-configured agent with randomized:
- Name
- Ticker
- Description
- Personality

This feature allows users to quickly create diverse agent templates that can be further customized.

#### Backend Processing

When a user submits the agent creation form, the backend:
1. Receives the simplified agent configuration
2. Parses the personality field to generate detailed character attributes
3. Creates the agent using the ElizaOS framework
4. Returns the agent ID and connection details

### Sending Messages to an Agent

```typescript
const sendMessage = async (agentId: string, message: string, userId: string) => {
  try {
    const response = await axios.post(`http://localhost:3001/api/agents/${agentId}/messages`, {
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

### Enabling Twitter Integration for an Agent

```typescript
const enableTwitter = async (agentId: string) => {
  try {
    await axios.post(`http://localhost:3001/api/agents/${agentId}/twitter/enable`);
    console.log('Twitter integration enabled for agent');
  } catch (error) {
    console.error('Failed to enable Twitter:', error);
  }
};
```

### Posting a Tweet via an Agent

```typescript
const postTweet = async (agentId: string, content: string) => {
  try {
    const response = await axios.post(`http://localhost:3001/api/agents/${agentId}/twitter/tweet`, {
      content
    });
    
    console.log('Tweet posted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to post tweet:', error);
  }
};
```

## API Reference

### ElizaOS Runtime Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/eliza/start` | POST | Start the ElizaOS runtime |
| `/api/eliza/stop` | POST | Stop the ElizaOS runtime |
| `/api/eliza/status` | GET | Check if ElizaOS is running |

### Agent Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | POST | Create a new agent |
| `/api/agents` | GET | List all agents |
| `/api/agents/:agentId` | DELETE | Delete an agent |

### Messaging

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents/:agentId/messages` | POST | Send a message to an agent |
| `/api/agents/:agentId/messages` | GET | Get conversation history |

### Twitter Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents/:agentId/twitter/enable` | POST | Enable Twitter for an agent |
| `/api/agents/:agentId/twitter/tweet` | POST | Post a tweet via an agent |

## Chat Implementation

The chat functionality in Paradyze V2 is built on top of the ElizaOS messaging system, configured to use OpenRouter with gpt-4o-mini for optimal performance and cost efficiency.

### Backend Chat Implementation

The backend chat implementation handles message passing between the user and the ElizaOS agent:

```typescript
// backend/eliza-integration/services/ChatService.ts
import { AgentRuntime } from '@ai16z/eliza';
import { MessageManager } from './MessageManager';

export class ChatService {
  private agentRuntime: AgentRuntime;
  private messageManager: MessageManager;

  constructor(agentRuntime: AgentRuntime) {
    this.agentRuntime = agentRuntime;
    this.messageManager = new MessageManager();
  }

  async sendMessage(userId: string, agentId: string, message: string) {
    try {
      // Store the user message
      await this.messageManager.storeMessage({
        userId,
        agentId,
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Process the message using ElizaOS
      const response = await this.agentRuntime.processMessage({
        message,
        userId,
        modelClass: 'MEDIUM' // Uses MEDIUM_OPENROUTER_MODEL (gpt-4o-mini)
      });

      // Store the agent's response
      await this.messageManager.storeMessage({
        userId,
        agentId,
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      });

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  async getConversationHistory(userId: string, agentId: string, limit = 50) {
    return this.messageManager.getMessages(userId, agentId, limit);
  }
}
```

### REST API Endpoint

The chat functionality is exposed through a REST API endpoint:

```typescript
// backend/eliza-integration/api.ts
import express from 'express';
import { ChatService } from './services/ChatService';

const router = express.Router();
const chatService = new ChatService(agentRuntime);

// Send a message to an agent
router.post('/agents/:agentId/messages', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }

    const response = await chatService.sendMessage(userId, agentId, message);
    
    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation history
router.get('/agents/:agentId/messages', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { userId, limit } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const messages = await chatService.getConversationHistory(
      userId as string, 
      agentId, 
      limit ? parseInt(limit as string) : 50
    );
    
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;
```

### Frontend Chat Implementation

The frontend chat implementation uses React hooks to manage the chat state and communicate with the API:

```tsx
// frontend/src/hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const useChat = (agentId: string, userId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversation history
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/agents/${agentId}/messages`, {
        params: { userId }
      });
      setMessages(response.data.messages);
      setError(null);
    } catch (err) {
      setError('Failed to load conversation history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, userId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      
      // Optimistically update UI
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      
      // Send message to API
      const response = await axios.post(`/api/agents/${agentId}/messages`, {
        message: content,
        userId
      });
      
      // Add agent response
      const agentMessage: Message = {
        id: `response-${Date.now()}`,
        role: 'assistant',
        content: response.data.response.content,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, userId]);

  // Load initial messages
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages: fetchMessages
  };
};
```

### Chat Component

The React component for the chat interface:

```tsx
// frontend/src/components/Chat/Chat.tsx
import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './Chat.css';

interface ChatProps {
  agentId: string;
  userId: string;
}

const Chat: React.FC<ChatProps> = ({ agentId, userId }) => {
  const { messages, isLoading, sendMessage } = useChat(agentId, userId);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <MessageList messages={messages} />
        {isLoading && <div className="loading-indicator">Agent is typing...</div>}
      </div>
      
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <MessageInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !inputValue.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
```

### Model Selection for Chat

The chat implementation uses the ElizaOS model selection logic to determine which AI model to use:

1. API calls specify a `modelClass` parameter (SMALL, MEDIUM, or LARGE)
2. ElizaOS maps this class to the appropriate model based on environment variables
3. For OpenRouter, we use:
   - `SMALL_OPENROUTER_MODEL=openai/gpt-4o-mini` - For simpler messages
   - `MEDIUM_OPENROUTER_MODEL=openai/gpt-4o-mini` - For standard chat interactions
   - `LARGE_OPENROUTER_MODEL=openai/gpt-4o-mini` - For complex reasoning tasks

This flexible approach allows for changing models without modifying code, simply by updating environment variables.

## Troubleshooting

### Common Issues

1. **ElizaOS won't start**: Ensure that your API key (OpenAI or OpenRouter) is correctly set in the `.env` file in the `backend/eliza-main` directory.

2. **Agent creation fails**: Check that the character template file exists and is valid JSON.

3. **Twitter integration not working**: Ensure that the agent has Twitter client enabled and that your Twitter API credentials are correctly configured in ElizaOS.

4. **Incorrect model being used**: ElizaOS uses a model class system (SMALL, MEDIUM, LARGE) that maps to specific models based on your configuration. If you're seeing the wrong model being used:
   - Check the environment variables for your provider (e.g., `LARGE_OPENROUTER_MODEL`)
   - Ensure there are no duplicate entries in your `.env` file
   - Restart the ElizaOS server after making changes to environment variables

### Logs

Check the following logs for troubleshooting:

- ElizaOS logs in the terminal where you started the Integration Service
- Integration Service logs in its own terminal

## Advanced Configuration

### Model Selection

ElizaOS categorizes models into three classes: SMALL, MEDIUM, and LARGE. When using OpenRouter, you can specify which model to use for each class:

```bash
# Specific models for different complexity levels
SMALL_OPENROUTER_MODEL=openai/gpt-3.5-turbo
MEDIUM_OPENROUTER_MODEL=openai/gpt-4o-mini
LARGE_OPENROUTER_MODEL=openai/gpt-4o
```

This allows you to balance cost and performance based on the complexity of the task.

For advanced configuration options, refer to the ElizaOS documentation at [https://elizaos.github.io/eliza/docs/](https://elizaos.github.io/eliza/docs/).

## Contributing

If you encounter issues or have suggestions for improving the ElizaOS integration, please create an issue in the Paradyze V2 repository.

## Character Configuration

ElizaOS characters are defined using JSON configuration files. Here's an example of a trading assistant character:

```json
{
  "name": "Trading Assistant",
  "bio": "I'm a financial advisor specializing in cryptocurrency trading strategies.",
  "lore": "I was trained on extensive market data and trading patterns to help users make informed decisions about their cryptocurrency investments.",
  "messageExamples": [
    {
      "role": "user",
      "content": "What do you think about the current Bitcoin market?"
    },
    {
      "role": "assistant",
      "content": "Based on recent market data, Bitcoin is showing signs of consolidation after its recent rally. The key support levels to watch are $60,000 and $58,000, while resistance is around $65,000. Trading volume has been decreasing, which might indicate a potential move coming soon. Would you like me to analyze any specific aspects of the Bitcoin market?"
    }
  ],
  "postExamples": [
    {
      "title": "Market Analysis: Bitcoin's Recent Performance",
      "content": "Bitcoin has been showing interesting patterns over the past week. After testing the $62,000 support level multiple times, it has bounced back strongly, indicating resilient buyer interest at this price point. The 4-hour chart shows a bullish divergence forming on the RSI, which could signal a potential upward movement in the coming days. Keep an eye on the $65,000 resistance level - a clean break above this with significant volume could trigger a move toward $70,000."
    }
  ],
  "style": {
    "tone": "professional",
    "formality": "moderate",
    "vocabulary": "technical",
    "humor": "occasional"
  },
  "adjectives": [
    "analytical",
    "data-driven",
    "strategic",
    "insightful",
    "cautious"
  ]
}
```

## Deployment Process

When a character is deployed as an agent, the following steps occur:

1. The character configuration is saved to the database
2. The Agent Manager service creates a Docker container running ElizaOS
3. The character configuration is mounted into the container
4. The container is started and exposes an API endpoint

## Agent API

Once deployed, each ElizaOS agent exposes the following API endpoints:

### Chat API

```
POST /api/chat
```

**Request:**
```json
{
  "message": "What trading strategies do you recommend for a volatile market?"
}
```

**Response:**
```json
{
  "id": "msg_123456",
  "content": "For volatile markets, I recommend considering these strategies...",
  "created_at": "2025-02-27T17:05:00Z"
}
```

### Agent Information

```
GET /api/info
```

**Response:**
```json
{
  "name": "Trading Assistant",
  "description": "A trading assistant that helps with market analysis",
  "version": "1.0.0",
  "status": "running",
  "uptime": 3600
}
```

## WebSocket Support

For real-time communication with agents, WebSocket connections are available at:

```
ws://{service_url}/api/ws
```

This allows for streaming responses from the agent.

## Environment Variables

ElizaOS agents require the following environment variables:

- `OPENROUTER_API_KEY`: API key for OpenRouter
- `OPENROUTER_MODEL`: Model to use (e.g., openai/gpt-4o-mini)
- `DEFAULT_MODEL_PROVIDER`: Model provider (e.g., openrouter)

## Customizing Agents

To customize an ElizaOS agent:

1. Modify the character configuration JSON file
2. Update the character in the database
3. Deploy a new version of the agent

## Troubleshooting

Common issues and their solutions:

### Agent Not Starting

- Check Docker logs: `docker logs [container_id]`
- Verify the character configuration file exists and is valid JSON
- Ensure the required environment variables are set

### Agent Not Responding

- Check if the agent container is running: `docker ps`
- Verify the agent's API endpoint is accessible
- Check the agent logs for errors

### Poor Agent Responses

- Review and improve the character configuration
- Add more detailed message examples
- Adjust the style and tone settings

## Database Configuration

ElizaOS supports multiple database backends through its adapter system. This guide covers both PostgreSQL (for production) and SQLite (for development) configurations.

### SQLite Configuration (Development)

SQLite is recommended for development environments due to its simplicity and zero-configuration setup. To use SQLite with ElizaOS:

1. Set the database URL in your `.env` file:
   ```
   DATABASE_URL=sqlite:./data/paradyze.db
   ```

2. Ensure you have the required dependencies:
   ```bash
   npm install sqlite3 sqlite
   ```

3. Initialize the SQLite database:
   ```bash
   node scripts/init-sqlite-db.js
   ```

This will create a SQLite database file in the `data` directory with all the necessary tables for ElizaOS.

> **Note on SQLite Limitations**: Standard SQLite does not natively support vector similarity search operations required for ElizaOS's semantic memory features like `searchMemoriesByEmbedding()` and `getCachedEmbeddings()`. For development purposes, these limitations are acceptable, but for production use, PostgreSQL with pgvector is recommended.

### PostgreSQL Configuration (Production)

For production environments, PostgreSQL is recommended for better performance, concurrency, scalability, and full support for vector embeddings:

1. Set the database URL in your `.env` file:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/paradyze
   ```

2. Ensure you have the required dependencies:
   ```bash
   npm install pg pg-hstore
   ```

3. Install the pgvector extension for PostgreSQL:
   ```bash
   # Connect to your PostgreSQL database
   psql -U postgres -d paradyze
   
   # Install the pgvector extension
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

4. Initialize the PostgreSQL database:
   ```bash
   node scripts/init-postgres-db.js
   ```

#### Vector Embedding Support in PostgreSQL

ElizaOS uses vector embeddings for semantic memory retrieval, which requires database support for vector operations. PostgreSQL with the pgvector extension provides:

1. **Vector Data Type**: Stores embedding vectors efficiently
2. **Vector Similarity Search**: Enables semantic search using cosine similarity, Euclidean distance, or dot product
3. **Indexing**: Supports approximate nearest neighbor search for fast retrieval

The following ElizaOS features depend on vector embedding support:

- `searchMemoriesByEmbedding()`: Retrieves memories based on semantic similarity
- `getCachedEmbeddings()`: Reuses previously computed embeddings
- Semantic memory retrieval for contextual conversations
- Knowledge base search functionality

When using PostgreSQL, ensure that:
- The pgvector extension is installed
- Your database schema includes columns for storing embeddings
- The `@elizaos/adapter-postgres` package is properly configured

### Database Schema

ElizaOS uses the following tables to store agent data:

- **agents**: Stores agent configurations, including system prompts and metadata
- **messages**: Stores conversation history for each agent
- **memory**: Stores key-value pairs for agent memory
- **plugins**: Stores plugin configurations
- **agent_plugins**: Maps the many-to-many relationship between agents and plugins

### Switching Between Databases

To switch between SQLite and PostgreSQL, simply update the `DATABASE_URL` in your `.env` file and restart the application. ElizaOS's database adapter will automatically connect to the appropriate database.
