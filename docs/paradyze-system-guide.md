# Paradyze v2 System Setup Guide

This document provides a comprehensive guide for setting up and troubleshooting the Paradyze v2 system. Follow these steps exactly to ensure a working environment.

## System Architecture

Paradyze v2 consists of several interconnected services:

| Service | Purpose | Port | Dependencies |
|---------|---------|------|-------------|
| Frontend | React UI for user interaction | 3000 (browser), 3004 (internal) | OpenRouter Proxy, Integration API, API Server |
| Integration API | Bridge between frontend and ElizaOS | 3001, 3006 | ElizaOS Main |
| API Server | API endpoints for agent management | 3002 | Integration API |
| OpenRouter Proxy | AI API proxy for LLM access | 3003 | None |
| ElizaOS Main | Core runtime for agent execution | 3000 (locally), 3005 (in Docker), 3007 (proxy) | None |

## Port Configuration Summary

- **Frontend**: Serves on port 3000 for browser access, runs internally on 3004
- **Integration API**: Runs on port 3001 (Docker) or 3006 (local)
- **API Server**: Runs on port 3002
- **OpenRouter Proxy**: Runs on port 3003
- **ElizaOS**: 
  - Runs on port 3000 when started locally
  - Configured for port 3005 in Docker
  - Accessed via port 3007 when using proxy

## Running the System Locally

### Step 1: Start ElizaOS

ElizaOS is the core agent runtime and must be started first.

```bash
# Navigate to the ElizaOS directory
cd elizabuild/eliza

# Install dependencies if not already done
pnpm install

# Start ElizaOS
pnpm start
```

ElizaOS will run on port 3000 and is accessible via:
- Main API: http://localhost:3000/
- Health check: http://localhost:3000/health

Verify it's running with:
```bash
curl -v http://localhost:3000/health
```

Should return a `200 OK` response.

### Step 2: Start Integration API

The Integration API acts as a bridge between the frontend and ElizaOS.

```bash
# Navigate to the integration API directory
cd backend/eliza-integration

# Install dependencies if not already done
npm install

# Start the Integration API
npx ts-node api.ts
```

The Integration API will run on port 3006 and connect to ElizaOS at http://localhost:3000.

Verify it's running with:
```bash
curl -v http://localhost:3006/api/health
```

### Step 3: Start API Server

```bash
# Navigate to the API server directory
cd api-server

# Install dependencies if not already done
npm install

# Start the API server
node server.js
```

The API server will run on port 3002.

Verify it's running with:
```bash
curl -v http://localhost:3002/health
```

### Step 4: Start OpenRouter Proxy

```bash
# Navigate to the project root
cd /path/to/paradyzev2

# Run the OpenRouter proxy server
node local-openrouter-server.js
```

The OpenRouter proxy will run on port 3003.

Verify it's running with:
```bash
curl -v http://localhost:3003/api/ai-chat/ping
```

### Step 5: Start Frontend

```bash
# Navigate to the project root
cd /path/to/paradyzev2

# Install dependencies if not already done
npm install

# Start the frontend
npm run dev
```

The frontend will be accessible at http://localhost:3000 in your browser.

## Running with Docker

### Prerequisites

Ensure Docker and Docker Compose are installed:
```bash
docker --version
docker compose --version
```

### Step 1: Configure Environment Variables

Make sure the `.env` file in the project root has the correct values:

```
# OpenRouter Configuration
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini

# Database Configuration
DATABASE_URL=sqlite:./data/paradyze.db

# Application Settings
NODE_ENV=development

# Vite Configuration
VITE_SERVER_PROXY_TARGET=http://localhost:3006
```

### Step 2: Start All Services

```bash
# Make the helper scripts executable
chmod +x scripts/start.sh scripts/stop.sh scripts/logs.sh

# Start all services
./scripts/start.sh
```

This will start all services in Docker containers using the configuration in `docker-compose.yml`.

### Step 3: Check Service Health

```bash
# Check if all containers are running
docker ps

# View logs for all services
./scripts/logs.sh

# View logs for a specific service (e.g., elizaos-main)
./scripts/logs.sh elizaos-main
```

### Step 4: Access the Application

Open http://localhost:3000 in your browser to access the frontend.

## Docker Setup for ElizaOS

Now that we have confirmed our system works locally, we need to properly configure the ElizaOS Docker container. The goal is to create a reliable, production-ready container that can seamlessly replace our local ElizaOS instance.

### Building the ElizaOS Docker Image

1. Navigate to the elizabuild directory:
```bash
cd elizabuild
```

2. Build the ElizaOS Docker image:
```bash
docker build -t eliza:latest .
```

This uses the Dockerfile in the elizabuild directory to create an image with the full ElizaOS environment.

### Key Dockerfile Customizations for ElizaOS

The `elizabuild/Dockerfile` needs these essential configurations:

```dockerfile
FROM node:23.3.0-slim

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    python3 \
    build-essential \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/tokenizers /app/node_modules/@anush008/tokenizers /data

# Copy the ElizaOS source code
COPY eliza/ /app/

# Install pnpm
RUN npm install -g pnpm@10.6.3

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm build

# Environment variables
ENV ELIZAOS_PORT=3005
ENV ELIZAOS_MODE=development
ENV AI_OPENROUTER_API_KEY=
ENV AI_OPENROUTER_MODEL=openai/gpt-4o-mini
ENV DEFAULT_MODEL_PROVIDER=openrouter
ENV DATABASE_URL=sqlite:/data/elizaos.db

# Expose port 3005
EXPOSE 3005

# Set up volumes for data persistence
VOLUME ["/app/tokenizers", "/app/node_modules/@anush008/tokenizers", "/data"]

# Create and run startup script
RUN echo '#!/bin/bash\n\
echo "Setting up ElizaOS with tokenizer fix..."\n\
# Copy tokenizers if they exist\n\
if [ -d "/app/tokenizers" ] && [ "$(ls -A /app/tokenizers)" ]; then\n\
  echo "Copying tokenizers to the correct locations..."\n\
  cp -r /app/tokenizers/* /app/node_modules/@anush008/tokenizers/ || echo "Failed to copy tokenizers"\n\
  # Copy to nested directories if they exist\n\
  find /app/node_modules -path "*/node_modules/@anush008/tokenizers" -type d -exec cp -r /app/tokenizers/* {} \; || echo "No nested tokenizer directories found"\n\
fi\n\
# Start ElizaOS\n\
echo "Starting ElizaOS..."\n\
pnpm start\n\
' > /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

# Set the command to run the start script
CMD ["/app/docker-entrypoint.sh"]
```

### Adapting docker-compose.yml for ElizaOS

Update the ElizaOS section in your `docker-compose.yml`:

```yaml
# ElizaOS Main Runtime
elizaos-main:
  image: eliza:latest
  container_name: paradyze-elizaos-main
  environment:
    - ELIZAOS_PORT=3005
    - ELIZAOS_MODE=development
    - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    - OPENROUTER_MODEL=${OPENROUTER_MODEL}
    - AI_OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    - AI_OPENROUTER_MODEL=${OPENROUTER_MODEL}
    - DEFAULT_MODEL_PROVIDER=openrouter
    - DATABASE_URL=sqlite:/data/elizaos.db
  ports:
    - "3005:3005"
  volumes:
    - ./data:/data
    - ./tokenizers:/app/tokenizers
  networks:
    - paradyze-network
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3005/health"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 30s
  restart: unless-stopped
```

## Next Steps for Docker Deployment

Now that we have our local environment working and a plan for containerizing ElizaOS, here are the next steps to complete the Docker deployment:

### 1. Create and Configure Minimal Dockerfiles

For each service, ensure the Docker files in the `docker` directory are properly configured:

#### docker/elizaos-main/Dockerfile (Minimal Proxy Version)

```dockerfile
FROM node:23.3.0-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y git python3 wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create directories
RUN mkdir -p /app/data && chmod -R 755 /app/data

# Copy only the minimal server file
COPY server-files/elizaos-server.js /app/elizaos-server.js

# Set environment variables
ENV ELIZAOS_PORT=3005
ENV ELIZAOS_MODE=development
ENV AI_OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
ENV AI_OPENROUTER_MODEL=${OPENROUTER_MODEL}
ENV DEFAULT_MODEL_PROVIDER=openrouter
ENV DATABASE_URL=sqlite:/app/data/elizaos.db

# Expose the port
EXPOSE 3005

# Set up volume for data persistence
VOLUME ["/app/data"]

# Set the command to run the minimal server
CMD ["node", "elizaos-server.js"]
```

#### docker/integration-api/Dockerfile

```dockerfile
FROM node:20-slim

# Install only essential build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY backend/eliza-integration/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY backend/eliza-integration ./

# Create data directory
RUN mkdir -p /app/data && chmod 777 /app/data

# Set environment variables for API mode
ENV ELIZAOS_INTEGRATION_MODE=api
ENV ELIZA_API_URL=http://elizaos-main:3005

EXPOSE 3001

# Use standard command for running the application
CMD ["npx", "ts-node", "api.ts"]
```

### 2. Configure a Development and Production Docker Compose

Create separate Docker Compose files for development and production:

#### docker-compose.dev.yml (Development)

```yaml
version: '3.8'

services:
  # ElizaOS development configuration
  elizaos-main:
    build:
      context: .
      dockerfile: docker/elizaos-main/Dockerfile
    # ... other config from above
    volumes:
      - ./data:/data
      - ./tokenizers:/app/tokenizers
      - ./server-files:/app/server-files
    environment:
      - NODE_ENV=development
      # ... other env vars

  # Other services with development settings
```

#### docker-compose.prod.yml (Production)

```yaml
version: '3.8'

services:
  # ElizaOS production configuration
  elizaos-main:
    image: eliza:latest
    # ... other config from above
    restart: always
    environment:
      - NODE_ENV=production
      # ... other env vars with production settings

  # Other services with production settings
```

### 3. Update the Helper Scripts

Modify the helper scripts to support different environments:

#### scripts/start.sh

```bash
#!/bin/bash
if [ "$1" == "prod" ]; then
  echo "Starting Paradyze services in PRODUCTION mode..."
  docker compose -f docker-compose.prod.yml up -d
else
  echo "Starting Paradyze services in DEVELOPMENT mode..."
  docker compose -f docker-compose.dev.yml up -d
fi

echo "Services are starting. Check status with: ./scripts/logs.sh"
```

### 4. Data Persistence Setup

Ensure proper data persistence between local and Docker environments:

1. Create a data directory in the project root:
```bash
mkdir -p data/elizaos
chmod 777 data/elizaos
```

2. Configure your local `.env` file to use this directory:
```
DATABASE_URL=sqlite:./data/elizaos/elizaos.db
```

3. When using Docker, mount this directory:
```yaml
volumes:
  - ./data/elizaos:/data
```

### 5. Transitioning from Local to Docker

When moving from local development to Docker deployment:

1. Stop all local services:
```bash
# Stop local ElizaOS
cd elizabuild/eliza
pkill -f "pnpm start"

# Stop other services
pkill -f "node server.js"
pkill -f "ts-node api.ts"
```

2. Ensure no port conflicts:
```bash
lsof -i :3000-3007
```

3. Start the Docker environment:
```bash
./scripts/start.sh
```

## Production Deployment Considerations

For a production deployment, consider these additional steps:

### 1. Secure the Environment Variables

For production, never store API keys in the Docker Compose file:

```bash
# Create a secure .env file for production
cp .env .env.prod
# Edit with production values
nano .env.prod

# Use it in your deployment
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

### 2. Configure Container Resource Limits

Add resource limits to your Docker Compose file:

```yaml
services:
  elizaos-main:
    # ... other configuration
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
```

### 3. Set Up Monitoring and Logging

For production, add logging configuration:

```yaml
services:
  elizaos-main:
    # ... other configuration
    logging:
      driver: "json-file"
      options:
        max-size: "200m"
        max-file: "10"
```

### 4. Backup Strategy

Implement a backup strategy for your SQLite databases:

```bash
# Add to your crontab
0 * * * * mkdir -p /backup/$(date +\%Y-\%m-\%d) && cp /path/to/paradyzev2/data/elizaos/*.db /backup/$(date +\%Y-\%m-\%d)/
```

### 5. Health Check and Auto-recovery

Ensure robust health checks for all services:

```yaml
services:
  elizaos-main:
    # ... other configuration
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3005/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: always
```

## Troubleshooting

### ElizaOS Health Check Failing

If the ElizaOS container health check is failing:

1. Check if port 3005 is already in use:
   ```bash
   lsof -i :3005
   ```

2. If another process is using port 3005, stop it:
   ```bash
   kill -9 <PID>
   ```

3. Recreate the container:
   ```bash
   docker stop paradyze-elizaos-main && docker rm paradyze-elizaos-main && docker compose up elizaos-main -d
   ```

### Integration API Connection Issues

If the Integration API cannot connect to ElizaOS:

1. Check the value of `ELIZA_API_URL` in the Integration API container:
   ```bash
   docker exec -it paradyze-integration-api env | grep ELIZA_API_URL
   ```

2. Ensure it points to `http://elizaos-main:3005` for Docker or `http://localhost:3000` for local development.

3. Restart the Integration API:
   ```bash
   docker restart paradyze-integration-api
   ```

### Agent Creation Failing

If agent creation via the Integration API fails:

1. Check the Integration API logs:
   ```bash
   docker logs paradyze-integration-api
   ```

2. Ensure the correct ElizaOS URL is being used:
   ```bash
   curl -v http://localhost:3001/api/eliza-status
   ```

3. Make direct request to ElizaOS to test agent creation:
   ```bash
   curl -v -X POST -H "Content-Type: application/json" -d '{"templateName":"trading-agent","name":"Test Agent","description":"A test agent"}' http://localhost:3000/agent/start
   ```

### OpenRouter Proxy Issues

If the OpenRouter proxy is not working:

1. Check if your OpenRouter API key is valid:
   ```bash
   echo $OPENROUTER_API_KEY
   ```

2. Test a direct request to the API server:
   ```bash
   curl -v -X POST -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Hello"}],"stream":false}' http://localhost:3002/api/ai-chat
   ```

### Frontend Not Connecting to Backend

If the frontend cannot connect to the backend services:

1. Check the proxy settings in `vite.config.ts`

2. Verify that the environment variables are correctly set:
   ```bash
   grep -r "VITE_" .env
   ```

3. Restart the frontend:
   ```bash
   docker restart paradyze-frontend
   ```

### Docker-specific Issues

If you encounter issues specific to Docker:

1. Check container logs:
   ```bash
   docker logs paradyze-elizaos-main
   ```

2. Inspect container details:
   ```bash
   docker inspect paradyze-elizaos-main
   ```

3. Check if the container can access the network:
   ```bash
   docker exec -it paradyze-elizaos-main wget -q -O- http://localhost:3005/health
   ```

4. Verify volume mounts are working:
   ```bash
   docker exec -it paradyze-elizaos-main ls -la /data
   ```

## Important Files and Their Locations

- **Docker Compose**: `docker-compose.yml` in the project root
- **Environment Variables**: `.env` in the project root
- **Frontend Configuration**: `vite.config.ts` in the project root
- **ElizaOS Configuration**: `elizabuild/eliza/.env`
- **Integration API Configuration**: `backend/eliza-integration/.env`
- **Character Templates**: `elizabuild/eliza/characters/*.character.json`
- **Docker Configuration**: 
  - `docker/elizaos-main/Dockerfile` - ElizaOS minimal Docker configuration
  - `elizabuild/Dockerfile` - ElizaOS full Docker configuration
  - `docker/integration-api/Dockerfile` - Integration API Docker configuration
  - `docker/api-server/Dockerfile` - API Server Docker configuration
  - `docker/openrouter-proxy/Dockerfile` - OpenRouter Proxy Docker configuration
  - `docker/frontend/Dockerfile` - Frontend Docker configuration

## Manual Process for Running Components

If Docker is not working, you can run each component manually in the correct order:

1. ElizaOS (port 3000)
2. API Server (port 3002) 
3. OpenRouter Proxy (port 3003)
4. Integration API (port 3006)
5. Frontend (port 3000 browser, 3004 internal)

## Agent Creation Flow

When creating a new agent:

1. Frontend sends a request to Integration API (`POST /api/agents`)
2. Integration API forwards to ElizaOS (`POST /agent/start`)
3. ElizaOS creates the agent and returns an ID
4. Integration API stores the agent ID and returns it to the frontend

The correct payload for agent creation is:

```json
{
  "templateName": "trading-agent",
  "name": "Agent Name",
  "description": "Agent description"
}
```

## Port Conflict Resolution

If you encounter port conflicts:

1. Identify the conflicting service:
   ```bash
   lsof -i :<port_number>
   ```

2. Stop the conflicting process:
   ```bash
   kill -9 <PID>
   ```

3. Update the port in the relevant configuration file if needed

## Logging and Debugging

- **Docker Logs**: `./scripts/logs.sh <service_name>`
- **Local Logs**: Check the terminal output for each service
- **Health Checks**:
  - ElizaOS: `curl -v http://localhost:3000/health` (local) or `curl -v http://localhost:3007/health` (Docker)
  - Integration API: `curl -v http://localhost:3006/api/health` (local) or `curl -v http://localhost:3001/api/health` (Docker)
  - API Server: `curl -v http://localhost:3002/health`
  - OpenRouter Proxy: `curl -v http://localhost:3003/api/ai-chat/ping`

## Security Notes

- The OpenRouter API key is stored in the `.env` file and should be kept secure
- Docker containers expose ports only as needed
- All services use CORS settings to restrict access
- For production, consider using Docker secrets or a secure environment variable manager

## Current Working State

As of the current implementation:

1. ElizaOS runs locally on port 3000 and responds to health checks
2. Integration API connects to local ElizaOS successfully
3. API Server and OpenRouter Proxy are working correctly
4. Frontend connects to all backend services through appropriate proxies
5. Agent creation and messaging work through the Integration API

## Future Improvements

1. Implement a proper CI/CD pipeline for automated builds and deployments
2. Add monitoring with Prometheus and Grafana
3. Implement proper error handling and retry logic in all services
4. Create a multi-node deployment strategy for high availability

Remember to keep this document updated as the system evolves. 