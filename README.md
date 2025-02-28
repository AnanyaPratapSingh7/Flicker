# ParadyzeV2 - AI Trading Agent Platform

ParadyzeV2 is a comprehensive cryptocurrency trading agent platform that enables users to create and manage AI-powered trading agents. Built with React and integrated with ElizaOS, it offers a seamless experience for users to create, customize, and deploy intelligent trading assistants.

## Features

- **Home Dashboard**: Overview of the platform's features and key metrics
- **Agent Launchpad**: Create and deploy AI-powered trading agents with customizable strategies
- **Social Media Integration**: Automatically post trading insights to Twitter/X
- **ElizaOS Integration**: Leverage powerful AI character framework for agent personalities
- **Prediction Market**: Participate in decentralized prediction markets across various categories
- **Money Market**: Lend, borrow, and earn interest on cryptocurrency assets

## Technology Stack

- **Frontend**: React, React Router with lazy loading for optimized performance
- **Backend**: Node.js with Express
- **AI Framework**: ElizaOS for agent management and personality customization
- **Social Media**: Twitter API integration via OAuth
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS (easily extendable to styled-components or other CSS-in-JS solutions)

## Getting Started

### Prerequisites

- Node.js (v23.0.0 or later recommended)
- pnpm (recommended) or npm
- OpenAI API key (for ElizaOS)
- Twitter Developer credentials (for social media integration)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/paradyzev2.git
cd paradyzev2
```

2. Set up ElizaOS runtime
```bash
# ElizaOS is included as a git submodule
cd backend/eliza-main
cp .env.example .env
# Edit the .env file with your OpenAI API key and other configuration
```

3. Set up ElizaOS integration service
```bash
cd ../eliza-integration
cp .env.example .env
pnpm install
# or npm install
```

4. Install frontend dependencies
```bash
cd ../../  # Back to project root
pnpm install
# or npm install
```

5. Start all services
```bash
# In one terminal, start the ElizaOS integration service
cd backend/eliza-integration
pnpm dev
# or npm run dev

# In another terminal, start the frontend
cd ../..  # Back to project root
pnpm start
# or npm start
```

The application will be available at http://localhost:3000

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- npm or pnpm

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/paradyzev2.git
   cd paradyzev2
   ```

2. The project uses the existing .env file in the eliza-main folder:
   ```bash
   # Verify the .env file exists
   ls -la backend/eliza-main/.env
   ```
   
   If it doesn't exist, create it:
   ```bash
   cp backend/eliza-integration/.env.example backend/eliza-main/.env
   ```
   
   Edit the .env file to include your OpenRouter API key.

3. Run the setup script:
   ```bash
   chmod +x scripts/setup-local.sh
   ./scripts/setup-local.sh
   ```

4. Test an agent deployment:
   ```bash
   chmod +x scripts/test-agent.sh
   ./scripts/test-agent.sh
   ```

### Architecture

The local development environment consists of:

1. **PostgreSQL Database**: Stores user, character, and agent data
2. **ElizaOS Integration Service**: Manages the interaction with ElizaOS, including starting/stopping the runtime, creating and managing agents
3. **Agent Manager**: Handles the deployment lifecycle of ElizaOS agent containers

### Component Interaction

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  AgentLaunchpad │────▶│    ElizaOS      │◀───▶│  Agent Manager  │
│    Frontend     │     │  Integration    │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 ▼                       ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │                 │     │                 │
                        │   PostgreSQL    │     │  ElizaOS Agent  │
                        │    Database     │     │   Containers    │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
```

This architecture is designed to be cloud-ready, with each component deployable as a separate service in Google Cloud Run.

### API Documentation

See [api-integration.md](docs/api-integration.md) for details on how to integrate the AgentLaunchpad frontend with the backend services.

### Deployment Strategy

See [deployment-strategy.md](docs/deployment-strategy.md) for details on the deployment strategy for production.

## Project Structure

```
paradyzev2/
├── backend/
│   ├── eliza-main/            # Main ElizaOS repository (cloned)
│   │   └── characters/        # Agent templates
│   ├── eliza-integration/     # Integration service
│   │   ├── ElizaIntegrationService.ts  # Core integration service
│   │   └── api.ts             # REST API for frontend
│   └── eliza/                 # Legacy integration components
│       ├── TwitterService.ts  # Twitter integration service
│       ├── SupabaseService.ts # Database service
│       └── server.ts          # API server
├── docs/                      # Documentation
│   ├── database.md            # Database schema and design
│   ├── elizaos-integration.md # Overview of ElizaOS integration
│   └── elizaos-integration-guide.md # Detailed integration guide
├── public/                    # Static assets
├── src/                       # Frontend code
│   ├── components/
│   │   ├── AgentLaunchpad/
│   │   ├── HomeDashboard/
│   │   ├── MoneyMarket/
│   │   ├── Navbar/
│   │   └── PredictionMarket/
│   ├── App.js                 # Main application with React Router setup
│   ├── App.css                # Global styles
│   └── index.js               # Entry point
├── package.json
└── README.md
```

## AI Agent Capabilities

The ElizaOS integration enables sophisticated AI trading agents with:

- Customizable personalities and trading strategies
- Memory of past conversations and market analysis
- Social media publishing capabilities (Twitter/X)
- Integration with trading APIs (future enhancement)

## Documentation

For detailed documentation about specific components:

- [ElizaOS Integration Overview](./docs/elizaos-integration.md)
- [ElizaOS Integration Guide](./docs/elizaos-integration-guide.md)
- [Database Schema](./docs/database.md)

## Future Enhancements

- Integration with Web3 wallets
- Real-time market data connections
- Trading API integrations
- Expanded social media platforms
- Advanced agent capabilities with custom plugins
- Mobile responsive design improvements

## Database Configuration

Paradyze V2 supports two database options:

### SQLite (Development)

For development environments, we use SQLite, which is a lightweight, file-based database that requires no additional setup.

To configure SQLite:

```bash
# Initialize SQLite database
./scripts/init-sqlite.sh

# Install dependencies
npm install better-sqlite3 sqlite3 @elizaos/adapter-sqlite --save
```

> **Note**: SQLite has limitations for production use, particularly for vector embedding features required by ElizaOS's semantic memory system.

### PostgreSQL (Production)

For production environments, we use PostgreSQL with the pgvector extension for optimal performance, scalability, and full support for vector embeddings.

To configure PostgreSQL:

```bash
# Initialize PostgreSQL database
./scripts/init-postgres.sh

# Install dependencies
npm install pg @elizaos/adapter-postgres --save
```

#### Vector Embedding Support

ElizaOS uses vector embeddings for semantic memory retrieval, which requires database support for vector operations. The pgvector extension for PostgreSQL provides:

- Efficient storage of embedding vectors
- Vector similarity search (cosine, Euclidean, dot product)
- Fast retrieval with approximate nearest neighbor search

These capabilities enable key ElizaOS features:
- Semantic memory retrieval
- Context-aware conversations
- Knowledge base search

For detailed database configuration instructions, see the [ElizaOS Integration Guide](./docs/elizaos-integration-guide.md#database-configuration).

## License

MIT
