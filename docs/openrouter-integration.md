# OpenRouter AI Integration in Paradyze Chat

This document details how we successfully integrated the OpenRouter AI service into the Paradyze application using Docker Compose, focusing on the implementation of streaming responses.

## System Architecture

The Paradyze app uses a Docker Compose setup with multiple services:

- **Frontend**: React application that provides the user interface (port 3000)
- **API Server**: Express-based server that handles API requests and proxies to OpenRouter (port 3002)
- **OpenRouter Proxy**: Service to handle AI chat requests securely (port 3003)

## Implementation Details

### 1. API Server

The key implementation was in the API server (`api-server/server.js`), which needed to:

- Accept chat requests from the frontend
- Forward those requests to OpenRouter with proper authentication
- Handle streaming responses for real-time chat
- Manage error states gracefully

#### Key Components:

```javascript
// API Server - Key Components
const axios = require('axios');

// Connection to OpenRouter
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

// Streaming implementation with axios
const response = await axios({
  method: 'post',
  url: OPENROUTER_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Paradyze Trading Agent'
  },
  data: payload,
  responseType: 'stream'
});
```

### 2. Stream Processing

Handling streaming responses was particularly challenging. We used the following approach:

1. Set up server-sent events (SSE) headers on the response
2. Use axios with `responseType: 'stream'` to get a readable stream
3. Process incoming chunks and forward them to the client
4. Handle stream completion and errors properly

```javascript
// Stream processing logic
let chunkCount = 0;
let streamActive = true;
let buffer = '';

response.data.on('data', (chunk) => {
  if (!streamActive) return;
  
  try {
    // Convert buffer to string and add to existing buffer
    const text = chunk.toString('utf8');
    buffer += text;
    
    // Process complete events from the buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the incomplete line in the buffer
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      if (line.startsWith('data: ')) {
        const data = line.substring(6);
        
        if (data === '[DONE]') {
          // Handle stream completion
          console.log('Received [DONE] marker from OpenRouter');
          if (!res.writableEnded && streamActive) {
            res.write('data: [DONE]\n\n');
          }
          streamActive = false;
          break;
        }
        
        // Forward chunks to client
        if (!res.writableEnded && streamActive) {
          res.write(`data: ${data}\n\n`);
          chunkCount++;
        }
      }
    }
  } catch (err) {
    console.error('Error processing chunk:', err);
    streamActive = false;
  }
});
```

### 3. Docker Configuration

The Docker setup required careful configuration to ensure services could communicate properly. Below is a detailed explanation of our Docker Compose setup for all relevant services.

#### Complete Docker Compose Configuration

The full `docker-compose.yml` file is structured as follows:

```yaml
services:
  # API Server Service
  api-server:
    build:
      context: .
      dockerfile: docker/api-server/Dockerfile
    container_name: paradyze-api-server
    environment:
      - API_PORT=3002
      - DATABASE_URL=sqlite:/app/data/paradyze.db
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_MODEL=${OPENROUTER_MODEL}
    ports:
      - "3002:3002"
    volumes:
      - ./api-server:/app/api-server
      - ./data:/app/data
    networks:
      - paradyze-network
    command: ["node", "api-server/server.js"]
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3002/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  # OpenRouter Proxy Service
  openrouter-proxy:
    build:
      context: .
      dockerfile: docker/openrouter-proxy/Dockerfile
    container_name: paradyze-openrouter-proxy
    environment:
      - PORT=3003
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_MODEL=${OPENROUTER_MODEL}
    ports:
      - "3003:3003"
    networks:
      - paradyze-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3003/api/ai-chat/ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Frontend Service
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    container_name: paradyze-frontend
    environment:
      - PORT=3004
      - VITE_OPENROUTER_SERVER_URL=http://localhost:3003
      - VITE_API_ENDPOINT=/api/ai-chat
      - VITE_API_SERVER_URL=http://localhost:3002
      - VITE_OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - VITE_OPENROUTER_MODEL=${OPENROUTER_MODEL}
      - VITE_DATABASE_URL=sqlite:/app/data/paradyze.db
    ports:
      - "3000:3004"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./index.html:/app/index.html
      - ./vite.config.ts:/app/vite.config.ts
      - ./data:/app/data
    networks:
      - paradyze-network
    depends_on:
      - openrouter-proxy
      - api-server

networks:
  paradyze-network:
    driver: bridge
```

#### API Server Dockerfile

```dockerfile
FROM node:23-alpine

WORKDIR /app

# Create a minimal package.json with required dependencies
RUN echo '{"name":"api-server","version":"1.0.0","dependencies":{"express":"^4.18.2","cors":"^2.8.5","dotenv":"^16.3.1","axios":"^1.6.2"}}' > package.json

# Install dependencies
RUN npm install

# Copy only the API server files
COPY api-server ./api-server

EXPOSE 3002

CMD ["node", "api-server/server.js"]
```

#### OpenRouter Proxy Dockerfile

```dockerfile
FROM node:23-alpine

WORKDIR /app

# Create package.json
RUN echo '{\
  "name": "openrouter-proxy",\
  "version": "1.0.0",\
  "description": "Proxy for OpenRouter API",\
  "main": "server.js",\
  "dependencies": {\
    "express": "^4.18.2",\
    "cors": "^2.8.5",\
    "node-fetch": "^2.7.0"\
  }\
}' > /app/package.json

# Install dependencies
RUN npm install

# Copy the server file
COPY server-files/openrouter-server.js /app/server.js

# Expose port 3003
EXPOSE 3003

# Start the server
CMD ["node", "server.js"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

RUN npm install

COPY . .

# Set environment variable for Vite server proxy
ENV VITE_SERVER_PROXY_TARGET=http://openrouter-proxy:3003

EXPOSE 3004

# Set environment variable to prevent browser opening
ENV BROWSER=none

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 4. Service Communication

The services communicate with each other through the Docker network:

1. **Frontend to API Server**: The frontend communicates with the API server through the Vite proxy configuration, which forwards requests from `/api/chat/ai-chat` to the API server at port 3002.

2. **API Server to OpenRouter API**: The API server makes direct HTTPS requests to the OpenRouter API using the API key from environment variables.

3. **Network Configuration**: All services are connected via the `paradyze-network` bridge network, which allows containers to communicate with each other using their service names.

```javascript
// Vite proxy configuration (in vite.config.ts)
server: {
  port: 3004,
  open: true,
  hmr: {
    overlay: false
  },
  proxy: {
    '/api': {
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => {
        return path;
      }
    }
  }
}
```

### 5. Environment Configuration

The Docker Compose setup uses a `.env` file at the root of the project to manage environment variables. These variables are injected into the containers at runtime:

```
# OpenRouter Configuration
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-4o-mini

# Database Configuration
DATABASE_URL=sqlite:./data/paradyze.db

# Application Settings
NODE_ENV=development
```

The key environment variables that affect the OpenRouter integration are:

- **OPENROUTER_API_KEY**: The API key for accessing the OpenRouter service
- **OPENROUTER_MODEL**: The default model to use (e.g., openai/gpt-4o-mini)
- **PORT**: The port each service runs on inside its container
- **VITE_OPENROUTER_SERVER_URL**: URL for the frontend to reach the OpenRouter proxy
- **VITE_API_ENDPOINT**: The endpoint path for AI chat requests

### 6. Volume Mappings

Volume mappings are critical for development and data persistence:

1. **API Server Volumes**:
   - `./api-server:/app/api-server`: Mounts the local API server code into the container, allowing live code changes without rebuilding
   - `./data:/app/data`: Shared volume for database and other persistent data

2. **Frontend Volumes**:
   - `./src:/app/src`: For live code changes to React components
   - `./public:/app/public`: For static assets
   - `./index.html:/app/index.html`: The main HTML entry point
   - `./vite.config.ts:/app/vite.config.ts`: Vite configuration
   - `./data:/app/data`: Shared access to database and persistent data

### 7. Health Checks

Health checks ensure that services are running properly:

- **API Server**: Checks that the `/health` endpoint returns a 200 status
- **OpenRouter Proxy**: Checks that the `/api/ai-chat/ping` endpoint returns a 200 status

These health checks are used by Docker Compose to determine if a service is healthy before allowing dependent services to start.

## Challenges Overcome

### 1. Node Fetch vs Axios

Initially, we tried using `node-fetch`, but encountered module loading issues. The solution was to use `axios` which was already included in the Docker image.

```javascript
// Before: Error with node-fetch
const fetch = require('node-fetch');  // Error: Cannot find module 'node-fetch'

// After: Working solution with axios
const axios = require('axios');
```

### 2. Streaming Response Handling

Properly handling the streaming response required:

- Careful buffer management to handle partial JSON chunks
- Proper event handling for 'data', 'end', and 'error' events
- Forwarding properly formatted SSE data to the client

### 3. Docker Volume Configuration

Ensuring the server.js file with our changes was properly mounted in the container:

```yaml
volumes:
  - ./api-server:/app/api-server
```

### 4. Port Configuration

We needed to ensure all services used the correct ports to avoid conflicts:

- Frontend: Port 3000 (mapped from container port 3004)
- API Server: Port 3002
- OpenRouter Proxy: Port 3003

### 5. Inter-Service Dependencies

Managing the startup order of services using the `depends_on` configuration to ensure that the frontend starts after the API server and OpenRouter proxy are available.

## Testing and Verification

To verify the integration is working:

1. Start all services with `docker compose up`
2. Access the frontend at http://localhost:3000
3. Send a message in the chat interface
4. Observe real-time streaming of the AI response
5. Check logs with `docker compose logs api-server` to see detailed information about request handling

### Useful Docker Commands

Here are some useful commands for managing the Docker setup:

```bash
# Start all services
docker compose up

# Start all services in detached mode
docker compose up -d

# Rebuild a specific service
docker compose build api-server

# Restart a specific service
docker compose restart api-server

# View logs for a specific service
docker compose logs api-server

# View logs for all services and follow them
docker compose logs -f

# Stop all services
docker compose down
```

## Environment Configuration

The integration uses these environment variables from `.env`:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_MODEL=openai/gpt-4o-mini
```

## Conclusion

The successful integration enables real-time AI responses through OpenRouter in the Paradyze application. The streaming implementation provides an excellent user experience with immediate, word-by-word responses rather than waiting for complete messages.

Future improvements could include:
- Enhanced error handling and retry logic
- Response caching for common questions
- User-selectable AI models within the interface
- Load balancing for multiple API keys
- Rate limiting to manage API costs
- Analytics to track usage patterns and optimize performance
