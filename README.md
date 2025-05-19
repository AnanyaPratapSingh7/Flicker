# [name]

[Name] is a feature-rich cryptocurrency trading agent platform that lets users design and run trading agents driven by AI. It provides a smooth experience for users to design, modify, and implement intelligent trading assistants thanks to its React architecture and ElizaOS integration.
## Features

- **Home Dashboard**: Overview of your portfolio and metrics
- **Agentic Launchpad**: Create AI-powered trading agents with customizable strategies.
- **Automatic Trading**: Use of *OKX*'s API in order to make trades as well as fetch the market data and make decisions. 
- **Direct Chat and Social Media Integration**: Connect your agents to Discord, Twitter/X, and Telegram with fluid integrations of ElizaOS
- **ElizaOS Integration**: Leverage powerful AI character framework for agent personalities

**Note**: Some features are marked as "Coming Soon" in the current version:
- **Tokenization**: The ability to tokenize agents is marked as a future enhancement
- **Prediction Market**: Will be available in a future update( Will use ICT Strategy)

## Technology Stack

- **Trading**: *OKX* for executing trades and fetching market data
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js with Express
- **AI Framework**: ElizaOS for agent management and personality customization
- **Social Media**: Discord, Twitter/X, and Telegram integrations via API
- **Database**: SQLite
- **Container Orchestration**: Docker


## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later recommended)
- npm or pnpm (package manager)
- Docker and Docker Compose (for containerized setup)
- OpenRouter API key (for AI model access)
- OKX APi key (with read, write, and trade access)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone [repolink]
   cd [name]
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your OKX API key and other configuration settings:
   ```
   # OKX API Configuration
   OKX_API_KEY=your_api_key_here
   OKX_API_SECRET=your_api_secret_here

   # OpenRouter API Configuration
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_MODEL=openai/gpt-4o-mini

   # Server Configuration
   # Local server port for OpenRouter proxy (default: 3005)
   PORT=3005
   # Frontend URL for CORS config
   APP_URL=http://localhost:5173

   # Environment
   NODE_ENV=development

   # Frontend Configuration
   # API Endpoint path (relative to frontend URL)
   VITE_API_ENDPOINT=/api/proxy/ai-chat
   # Absolute URL to OpenRouter server (for direct connection)
   VITE_OPENROUTER_SERVER_URL=http://localhost:3005

   # Debugging
   DEBUG_LEVEL=info  # Options: error, warn, info, debug, verbose

   ```

## System Architecture
We are mainly using three key APIs from OKX
1. Swap: /api/v5/dex/aggregate/swap
2. Orders: /api/v5/dex/spot/order
3. Balances: /api/v5/dex/account/balances

These APIs will provide the core functionality to the agents i.e. executing profitable trades and keeping records

Here's an overview of a trade flow `NLP Input → Chain Validation → OKX Liquidity Check → Transaction Signing
`
### Example FLow

User input: "Bridge 100 USDC from Ethereum to Solana and swap to BONK"
Expected actions:

Parse chain/token/amount

Check OKX cross-chain liquidity

Execute bridge via OKX API

Perform swap on Solana DEX

Return composite TX hash

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

### SQLite

We use SQLite, which is a lightweight, file-based database that requires no additional setup.

To initialize the SQLite database:

```bash
# Initialize SQLite database
./scripts/init-sqlite.sh
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


## Development Workflow

When developing new features or fixing bugs:

1. Start all services using Docker or manually as described above
2. Make changes to the relevant components
3. Use the development servers' hot-reloading capabilities
4. Test your changes thoroughly

## Project Structure

```
[name]/
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

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

