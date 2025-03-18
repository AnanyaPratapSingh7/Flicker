# Docker Compose Migration Plan for Paradyze v2

This document outlines a comprehensive plan for migrating the Paradyze v2 application to Docker Compose, ensuring all services start with the correct port configurations and can communicate with each other reliably.

## 1. Service Analysis

Based on the codebase analysis, the following services are required for the Paradyze v2 application:

| Service | Purpose | Current Port | Dependencies |
|---------|---------|--------------|-------------|
| Frontend | React UI for user interaction | 3000 | OpenRouter Proxy, Integration API, API Server |
| Integration API | Integration layer between frontend and ElizaOS | 3001 | ElizaOS Main |
| API Server | API endpoints for agent management | 3002 | Integration API |
| OpenRouter Proxy | AI API proxy for LLM access | 3003 (should be, currently 3005) | None |
| ElizaOS Main | Core runtime for agent execution | 3005 | None |
| SQLite Database | Data storage | N/A (file-based) | None |

## 2. Current Issues

1. **Port Misconfiguration**: 
   - OpenRouter Proxy is hardcoded to use port 3005 instead of 3003
   - This conflicts with ElizaOS Main which should use port 3005

2. **CORS Configuration Issues**:
   - OpenRouter Proxy CORS settings are configured for port 3003, but it's running on 3005
   - Frontend expects services on specific ports

3. **Service Dependencies**:
   - Agent creation requires Integration API and ElizaOS Main
   - Agent messaging requires Integration API, API Server, and ElizaOS Main
   - AI chat functionality requires OpenRouter Proxy

## 3. Docker Compose Implementation Plan

### 3.1 Directory Structure

Create the following directory structure for Docker-related files:

```
paradyzev2/
├── docker/
│   ├── frontend/
│   │   └── Dockerfile
│   ├── integration-api/
│   │   └── Dockerfile
│   ├── api-server/
│   │   └── Dockerfile
│   ├── openrouter-proxy/
│   │   └── Dockerfile
│   └── elizaos-main/
│       └── Dockerfile
├── docker-compose.yml
├── .env
└── scripts/
    ├── start.sh
    ├── stop.sh
    └── logs.sh
```

### 3.2 Code Modifications

#### 3.2.1 Fix OpenRouter Proxy Port

Modify `local-openrouter-server.js`:

```javascript
// Change from hardcoded port to environment variable
const PORT = parseInt(process.env.PORT || 3003);

// Update CORS settings to allow frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

#### 3.2.2 Update Service URLs

For browser-based communication, keep using localhost URLs with the correct ports:
- Frontend: http://localhost:3000
- Integration API: http://localhost:3001
- API Server: http://localhost:3002
- OpenRouter Proxy: http://localhost:3003
- ElizaOS Main: http://localhost:3005

For service-to-service communication within Docker, use service names:
- Frontend: http://frontend:3000
- Integration API: http://integration-api:3001
- API Server: http://api-server:3002
- OpenRouter Proxy: http://openrouter-proxy:3003
- ElizaOS Main: http://elizaos-main:3005

### 3.3 Dockerfiles

#### 3.3.1 Frontend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

#### 3.3.2 Integration API Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/eliza-integration/package*.json ./

RUN npm install

COPY backend/eliza-integration ./

EXPOSE 3001

CMD ["npm", "run", "dev"]
```

#### 3.3.3 API Server Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY api-server/package*.json ./

RUN npm install

COPY api-server ./

EXPOSE 3002

CMD ["npm", "run", "dev"]
```

#### 3.3.4 OpenRouter Proxy Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src/api/chat ./src/api/chat
COPY local-openrouter-server.js ./

EXPOSE 3003

CMD ["node", "local-openrouter-server.js"]
```

#### 3.3.5 ElizaOS Main Dockerfile

```dockerfile
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY backend/eliza-main/package*.json ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application
COPY backend/eliza-main ./

EXPOSE 3005

# Use pnpm start as the command
CMD ["pnpm", "start"]
```

### 3.4 Docker Compose Configuration

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  # ElizaOS Main Runtime
  elizaos-main:
    build:
      context: .
      dockerfile: docker/elizaos-main/Dockerfile
    container_name: paradyze-elizaos-main
    environment:
      - ELIZAOS_PORT=3005
      - ELIZAOS_MODE=development
    ports:
      - "3005:3005"
    volumes:
      - ./backend/eliza-main:/app
      - ./data:/app/data
    networks:
      - paradyze-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3005/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Integration API
  integration-api:
    build:
      context: .
      dockerfile: docker/integration-api/Dockerfile
    container_name: paradyze-integration-api
    environment:
      - INTEGRATION_PORT=3001
      - ELIZA_API_URL=http://elizaos-main:3005
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_MODEL=${OPENROUTER_MODEL}
      - DATABASE_URL=sqlite:/app/data/paradyze.db
      - ELIZAOS_INTEGRATION_MODE=direct
    ports:
      - "3001:3001"
    volumes:
      - ./backend/eliza-integration:/app
      - ./data:/app/data
    networks:
      - paradyze-network
    depends_on:
      elizaos-main:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  # API Server
  api-server:
    build:
      context: .
      dockerfile: docker/api-server/Dockerfile
    container_name: paradyze-api-server
    environment:
      - API_PORT=3002
      - DATABASE_URL=sqlite:/app/data/paradyze.db
      - INTEGRATION_URL=http://integration-api:3001
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_MODEL=${OPENROUTER_MODEL}
    ports:
      - "3002:3002"
    volumes:
      - ./api-server:/app
      - ./data:/app/data
    networks:
      - paradyze-network
    depends_on:
      integration-api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3002/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  # OpenRouter Proxy
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
    volumes:
      - ./src:/app/src
      - ./local-openrouter-server.js:/app/local-openrouter-server.js
    networks:
      - paradyze-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3003/api/ai-chat/ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    container_name: paradyze-frontend
    environment:
      - PORT=3000
      - VITE_OPENROUTER_SERVER_URL=http://localhost:3003
      - VITE_API_ENDPOINT=/api/ai-chat
      - VITE_INTEGRATION_URL=http://localhost:3001
      - VITE_API_SERVER_URL=http://localhost:3002
      - VITE_OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - VITE_OPENROUTER_MODEL=${OPENROUTER_MODEL}
      - VITE_DATABASE_URL=sqlite:/app/data/paradyze.db
    ports:
      - "3000:3000"
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
      - integration-api

networks:
  paradyze-network:
    driver: bridge
```

### 3.5 Environment Configuration

Create a `.env` file:

```
# OpenRouter Configuration
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=openai/gpt-4o-mini

# Database Configuration
DATABASE_URL=sqlite:./data/paradyze.db

# Application Settings
NODE_ENV=development
```

### 3.6 Helper Scripts

#### 3.6.1 Start Script (scripts/start.sh)

```bash
#!/bin/bash
echo "Starting Paradyze services..."
docker-compose up -d
echo "Services are starting. Check status with: ./scripts/logs.sh"
```

#### 3.6.2 Stop Script (scripts/stop.sh)

```bash
#!/bin/bash
echo "Stopping Paradyze services..."
docker-compose down
echo "All services stopped."
```

#### 3.6.3 Logs Script (scripts/logs.sh)

```bash
#!/bin/bash
if [ -z "$1" ]; then
  echo "Showing logs for all services. Press Ctrl+C to exit."
  docker-compose logs -f
else
  echo "Showing logs for $1. Press Ctrl+C to exit."
  docker-compose logs -f $1
fi
```

## 4. Implementation Strategy

### 4.1 Phase 1: Preparation

1. Create the Docker directory structure
2. Modify the OpenRouter proxy to use environment variables for port configuration
3. Update CORS settings in all services

### 4.2 Phase 2: Dockerization

1. Create Dockerfiles for each service
2. Create the docker-compose.yml file
3. Create the .env file
4. Create helper scripts

### 4.3 Phase 3: Testing

1. Test each service individually
   - Build and run each Docker container separately
   - Verify that each service starts correctly
   - Check logs for any errors

2. Test the complete Docker Compose setup
   - Start all services with docker-compose up
   - Verify that services can communicate with each other
   - Test agent creation functionality
   - Test agent messaging functionality
   - Test AI chat functionality

### 4.4 Phase 4: Deployment

1. Document the Docker Compose setup
2. Create a README with instructions for starting and stopping services
3. Train team members on using the Docker Compose setup

## 5. Benefits

1. **Consistent Environment**: All developers will have the same environment
2. **One-Click Startup**: Start all services with a single command
3. **Correct Port Configuration**: No more port conflicts
4. **Isolated Services**: Each service runs in its own container
5. **Easy Scaling**: Add more instances of services as needed
6. **Simplified Onboarding**: New developers can get started quickly

## 6. Potential Challenges

1. **Performance**: Docker containers may have slightly lower performance than native applications
2. **Resource Usage**: Docker containers use more resources than native applications
3. **Learning Curve**: Team members may need to learn Docker and Docker Compose

## 7. Conclusion

Migrating to Docker Compose will solve the port configuration issues and provide a more reliable way to start all services with the correct configuration. The migration can be done incrementally, starting with the most critical services and adding more services as needed. 