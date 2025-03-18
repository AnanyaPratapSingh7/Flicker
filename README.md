# ParadyzeV2 - AI Trading Agent Platform

ParadyzeV2 is a comprehensive cryptocurrency trading agent platform that enables users to create and manage AI-powered trading agents. Built with React and integrated with ElizaOS, it offers a seamless experience for users to create, customize, and deploy intelligent trading assistants.

## Features

- **Home Dashboard**: Overview of the platform's features and key metrics
- **Agent Launchpad**: Create and deploy AI-powered trading agents with customizable strategies
- **Direct Chat and Social Media Integration**: Connect your agents to Discord, Twitter/X, and Telegram
- **ElizaOS Integration**: Leverage powerful AI character framework for agent personalities

**Note**: Some features are marked as "Coming Soon" in the current version:
- **Tokenization**: The ability to tokenize agents is marked as a future enhancement
- **Prediction Market**: Will be available in a future update
- **Money Market**: Will be available in a future update

## Technology Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js with Express
- **AI Framework**: ElizaOS for agent management and personality customization
- **Social Media**: Discord, Twitter/X, and Telegram integrations
- **Database**: SQLite (development) / PostgreSQL (production)
- **Container Orchestration**: Docker and Docker Compose

## System Architecture

Paradyze v2 consists of several interconnected services:

| Service | Purpose | Port | Dependencies |
|---------|---------|------|-------------|
| Frontend | React UI for user interaction | 3000 (browser), 3004 (internal) | OpenRouter Proxy, Integration API, API Server |
| Integration API | Bridge between frontend and ElizaOS | 3001, 3006 | ElizaOS Main |
| API Server | API endpoints for agent management | 3002 | Integration API |
| OpenRouter Proxy | AI API proxy for LLM access | 3003 | None |
| ElizaOS Main | Core runtime for agent execution | 3000 (locally), 3005 (in Docker), 3007 (proxy) | None |

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later recommended)
- npm or pnpm (package manager)
- Docker and Docker Compose (for containerized setup)
- OpenRouter API key (for AI model access)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/paradyzev2.git
   cd paradyzev2
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your OpenRouter API key and other configuration settings:
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

## Running the Services

### Option 1: Using Docker (Recommended)

The easiest way to run the entire system is using Docker Compose:

1. Make sure Docker and Docker Compose are installed:
   ```bash
   docker --version
   docker compose --version
   ```

2. Make the helper scripts executable:
   ```bash
   chmod +x scripts/start.sh scripts/stop.sh scripts/logs.sh
   ```

3. Start all services:
   ```bash
   ./scripts/start.sh
   ```

4. Verify all services are running:
   ```bash
   docker ps
   ```

5. Check service logs:
   ```bash
   ./scripts/logs.sh
   ```
   
   Or view logs for a specific service:
   ```bash
   docker logs -f paradyze-elizaos-main
   docker logs -f paradyze-integration-api
   docker logs -f paradyze-api-server
   docker logs -f paradyze-openrouter-proxy
   docker logs -f paradyze-frontend
   ```

6. Access the application at http://localhost:3004

7. To stop all services:
   ```bash
   ./scripts/stop.sh
   ```

### Option 2: Running Services Manually

For development purposes, you may want to run the services individually:

#### Step 1: Start ElizaOS

```bash
# Navigate to the ElizaOS directory
cd elizabuild/eliza

# Install dependencies if not already done
pnpm install
# or
npm install

# Start ElizaOS
pnpm start
# or
npm start
```

ElizaOS will run on port 3000. Verify it's running:
```bash
curl -v http://localhost:3000/health
```

#### Step 2: Start Integration API

```bash
# Navigate to the integration API directory
cd backend/eliza-integration

# Install dependencies if not already done
npm install

# Start the Integration API
npx ts-node api.ts
```

The Integration API will run on port 3006.

#### Step 3: Start API Server

```bash
# Navigate to the API server directory
cd api-server

# Install dependencies if not already done
npm install

# Start the API server
node server.js
```

The API server will run on port 3002.

#### Step 4: Start OpenRouter Proxy

```bash
# Navigate to the project root
cd /path/to/paradyzev2

# Run the OpenRouter proxy server
node local-openrouter-server.js
```

The OpenRouter proxy will run on port 3003.

#### Step 5: Start Frontend

```bash
# Navigate to the project root
cd /path/to/paradyzev2

# Install dependencies if not already done
npm install

# Start the frontend
npm run dev
```

The frontend will be accessible at http://localhost:3000 in your browser.

## Database Configuration

Paradyze V2 supports two database options:

### SQLite (Development)

For development environments, we use SQLite, which is a lightweight, file-based database that requires no additional setup.

To initialize the SQLite database:

```bash
# Initialize SQLite database
./scripts/init-sqlite.sh
```

### PostgreSQL (Production)

For production environments, PostgreSQL with the pgvector extension is recommended for optimal performance, scalability, and vector embeddings support.

To initialize a PostgreSQL database:

```bash
# Initialize PostgreSQL database
./scripts/init-postgres.sh
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure no other services are running on the required ports (3000-3007)

2. **ElizaOS Health Check Fails**: 
   - Check if the ElizaOS service is running: `curl http://localhost:3000/health`
   - Verify the OPENROUTER_API_KEY is valid in your .env file

3. **Integration API Connection Issues**:
   - Ensure ElizaOS is running and accessible
   - Check the logs for connection errors: `docker logs -f paradyze-integration-api`

4. **Frontend Can't Connect to Backend Services**:
   - Verify all backend services are running
   - Check the VITE_* environment variables in your .env file

For more detailed troubleshooting steps, see [paradyze-system-guide.md](paradyze-system-guide.md).

## Development Workflow

When developing new features or fixing bugs:

1. Start all services using Docker or manually as described above
2. Make changes to the relevant components
3. Use the development servers' hot-reloading capabilities
4. Test your changes thoroughly

## Project Structure

```
paradyzev2/
├── api-server/              # API Server for application endpoints
├── backend/
│   └── eliza-integration/   # Integration service for ElizaOS
├── data/                    # Data storage for databases
├── docker/                  # Dockerfiles for all services
├── elizabuild/              # ElizaOS runtime
│   └── eliza/               # ElizaOS core service
├── public/                  # Static assets
├── scripts/                 # Utility scripts for setup and maintenance
├── src/                     # Frontend React application
│   ├── components/          # UI components
│   ├── contexts/            # React contexts
│   └── ...                  # Other application code
├── docker-compose.yml       # Docker Compose configuration
├── local-openrouter-server.js # OpenRouter proxy for development
└── .env                     # Environment configuration
```

## Documentation

For more detailed documentation, please refer to:

- [System Setup Guide](paradyze-system-guide.md) - Comprehensive instructions for setting up the system
- [Docker Compose Migration Plan](docker-compose-migration-plan.md) - Details about the Docker container setup

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

[License information here]
