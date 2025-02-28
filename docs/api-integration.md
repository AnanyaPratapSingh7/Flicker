# AgentLaunchpad Integration API

This document outlines the API endpoints that the AgentLaunchpad frontend should use to interact with the ElizaOS agent backend services.

## Base URLs

- **Local Development**: `http://localhost:3001`
- **Production**: To be determined based on Google Cloud Run deployment

## Authentication

Authentication will be handled by Supabase in production. For local development, no authentication is required.

## API Endpoints

### ElizaOS Runtime Management

#### Get Runtime Status

```
GET /api/eliza/status
```

**Response:**
```json
{
  "status": "running",
  "uptime": 3600
}
```

#### Start Runtime

```
POST /api/eliza/start
```

**Response:**
```json
{
  "status": "running"
}
```

#### Stop Runtime

```
POST /api/eliza/stop
```

**Response:**
```json
{
  "status": "stopped"
}
```

### Characters

#### List Characters

```
GET /api/characters
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Trading Assistant",
    "description": "A trading assistant that helps with market analysis",
    "filePath": "/path/to/character.json",
    "createdAt": "2025-02-27T17:00:00Z",
    "updatedAt": "2025-02-27T17:00:00Z"
  }
]
```

#### Get Character Details

```
GET /api/characters/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Trading Assistant",
  "description": "A trading assistant that helps with market analysis",
  "filePath": "/path/to/character.json",
  "configuration": {
    "name": "Trading Assistant",
    "bio": "I help with trading strategies and market analysis",
    "lore": "...",
    "messageExamples": [...],
    "postExamples": [...],
    "style": {...},
    "adjectives": [...]
  },
  "createdAt": "2025-02-27T17:00:00Z",
  "updatedAt": "2025-02-27T17:00:00Z"
}
```

#### Create Character

```
POST /api/characters
```

**Request Body:**
```json
{
  "name": "Trading Assistant",
  "description": "A trading assistant that helps with market analysis",
  "configuration": {
    "name": "Trading Assistant",
    "bio": "I help with trading strategies and market analysis",
    "lore": "...",
    "messageExamples": [...],
    "postExamples": [...],
    "style": {...},
    "adjectives": [...]
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Trading Assistant",
  "description": "A trading assistant that helps with market analysis",
  "filePath": "/path/to/character.json",
  "createdAt": "2025-02-27T17:00:00Z",
  "updatedAt": "2025-02-27T17:00:00Z"
}
```

### Agents

#### List Agents

```
GET /api/agents
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Trading Assistant",
    "status": "running",
    "url": "http://localhost:12345",
    "createdAt": "2025-02-27T17:00:00Z"
  }
]
```

#### Get Agent Details

```
GET /api/agents/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Trading Assistant",
  "description": "A trading assistant that helps with market analysis",
  "status": "running",
  "url": "http://localhost:12345",
  "characterId": "uuid",
  "createdAt": "2025-02-27T17:00:00Z"
}
```

#### Deploy Agent

```
POST /api/agents
```

**Request Body:**
```json
{
  "characterId": "uuid",
  "name": "Trading Assistant Instance"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Trading Assistant Instance",
  "status": "starting",
  "url": "http://localhost:12345",
  "characterId": "uuid",
  "createdAt": "2025-02-27T17:00:00Z"
}
```

#### Start Agent

```
POST /api/agents/:id/start
```

**Response:**
```json
{
  "id": "uuid",
  "status": "running"
}
```

#### Stop Agent

```
POST /api/agents/:id/stop
```

**Response:**
```json
{
  "id": "uuid",
  "status": "stopped"
}
```

#### Delete Agent

```
DELETE /api/agents/:id
```

**Response:**
```json
{
  "id": "uuid",
  "status": "deleted"
}
```

### Twitter Integration

#### Connect Twitter Account

```
POST /api/twitter/connect
```

**Request Body:**
```json
{
  "agentId": "uuid",
  "apiKey": "your-twitter-api-key",
  "apiSecret": "your-twitter-api-secret",
  "accessToken": "your-twitter-access-token",
  "accessTokenSecret": "your-twitter-access-token-secret"
}
```

**Response:**
```json
{
  "id": "uuid",
  "agentId": "uuid",
  "connected": true,
  "username": "your-twitter-username"
}
```

#### Post Tweet

```
POST /api/twitter/tweet
```

**Request Body:**
```json
{
  "agentId": "uuid",
  "content": "This is a tweet from my trading assistant agent!"
}
```

**Response:**
```json
{
  "id": "uuid",
  "tweetId": "1234567890",
  "content": "This is a tweet from my trading assistant agent!",
  "createdAt": "2025-02-27T17:00:00Z"
}
```

## Interacting with Agents

Once an agent is deployed, the frontend can interact with it directly using the agent's URL.

### Agent Direct API

#### Send Message to Agent

```
POST {agent.url}/api/chat
```

**Request Body:**
```json
{
  "message": "What trading strategies do you recommend for a volatile market?"
}
```

**Response:**
```json
{
  "id": "message-id",
  "content": "For volatile markets, I recommend considering these strategies...",
  "createdAt": "2025-02-27T17:05:00Z"
}
```

#### Get Agent Information

```
GET {agent.url}/api/info
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

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource was successfully created
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON body with an error message:

```json
{
  "error": "Failed to create agent"
}
```

## WebSocket Support

For real-time communication with agents, WebSocket connections are available at:

```
ws://{agent.url}/api/ws
```

This allows for streaming responses from the agent.
