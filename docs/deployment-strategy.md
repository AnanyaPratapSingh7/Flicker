# Paradyze V2 Deployment Strategy

## Overview

This document outlines the deployment strategy for Paradyze V2, focusing on a local-first development approach with a clear path to cloud deployment using Google Cloud Run and Supabase.

## Deployment Approach

### Phase 1: Local Development
- Develop and test the entire platform locally
- Use Docker Compose to simulate the production environment
- Ensure all components work together before moving to the cloud

### Phase 2: Cloud Deployment
- Deploy to Google Cloud Run for scalable, serverless compute
- Use Supabase for database, authentication, and storage
- Maintain the same architecture with minimal code changes

## Technology Stack

### Infrastructure
- **Compute**: Google Cloud Run (serverless containers)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth

### Local Development
- **Container Orchestration**: Docker Compose
- **Database**: PostgreSQL container
- **Agent Runtime**: ElizaOS in Docker containers

## Local Development Setup

The local development environment consists of the following components:

1. **PostgreSQL Database**: A local instance of PostgreSQL that serves as an alternative to Supabase in production.
2. **ElizaOS Integration Service**: A service that manages the interaction between Paradyze V2 and ElizaOS, including starting/stopping the ElizaOS runtime, creating and managing agents, and handling messages.
3. **Agent Manager**: A service responsible for creating and managing ElizaOS agent containers.

The existing AgentLaunchpad frontend will be used to interact with these backend services.

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

In this architecture:
- The AgentLaunchpad frontend communicates with the ElizaOS Integration Service for character and agent management
- The Agent Manager Service handles the deployment and lifecycle of agent containers
- Both services interact with the PostgreSQL database for data persistence
- The ElizaOS Integration Service manages the ElizaOS runtime
- The Agent Manager Service creates and manages ElizaOS agent containers

### API Integration

The ElizaOS Integration Service exposes endpoints that the AgentLaunchpad frontend can use to:

1. Manage the ElizaOS runtime
2. Create and manage characters
3. Deploy characters as agents
4. Start, stop, and delete agents
5. Integrate with Twitter for posting content

See [api-integration.md](api-integration.md) for detailed API documentation.

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  # PostgreSQL database (local alternative to Supabase)
  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: paradyze
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d

  # ElizaOS Integration Service
  eliza-integration:
    build: ./backend/eliza-integration
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/paradyze
      - ELIZA_RUNTIME_PATH=/app/eliza-main
      - INTEGRATION_PORT=3001
    volumes:
      - ./backend/eliza-main:/app/eliza-main
      - ./backend/eliza-integration:/app
    depends_on:
      - postgres

  # Agent Manager Service
  agent-manager:
    build: ./agent-manager
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/paradyze
      - INTEGRATION_URL=http://eliza-integration:3001
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./agent-manager:/app
    depends_on:
      - postgres
      - eliza-integration

volumes:
  postgres_data:
```

## Agent Manager Service

The Agent Manager service is responsible for creating and managing ElizaOS agent instances:

```javascript
// agent-manager/src/index.js
const express = require('express');
const { Pool } = require('pg');
const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Connect to PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Connect to Docker
const docker = new Docker();

// Create a new agent
app.post('/agents', async (req, res) => {
  const { userId, name, configuration } = req.body;
  
  try {
    // Generate unique ID for the agent
    const agentId = generateUniqueId();
    
    // Save to database
    const result = await pool.query(
      'INSERT INTO characters (id, user_id, name, configuration) VALUES ($1, $2, $3, $4) RETURNING *',
      [agentId, userId, name, configuration]
    );
    
    // Save character file
    const characterFilePath = path.join(
      process.env.CHARACTER_FILES_DIR,
      `${agentId}.character.json`
    );
    
    fs.writeFileSync(characterFilePath, JSON.stringify(configuration));
    
    // Update database with file path
    await pool.query(
      'UPDATE characters SET file_path = $1 WHERE id = $2',
      [characterFilePath, agentId]
    );
    
    // Create and start Docker container for the agent
    const container = await docker.createContainer({
      Image: 'elizaos/agent:latest',
      name: `agent-${agentId}`,
      Env: [
        `OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY}`,
        `OPENROUTER_MODEL=openai/gpt-4o-mini`,
        `DEFAULT_MODEL_PROVIDER=openrouter`
      ],
      HostConfig: {
        Binds: [`${characterFilePath}:/app/characters/default.character.json`],
        PortBindings: {
          '3000/tcp': [{ HostPort: `0` }] // Dynamically assign port
        }
      }
    });
    
    await container.start();
    
    // Get container info to determine assigned port
    const containerInfo = await container.inspect();
    const hostPort = containerInfo.NetworkSettings.Ports['3000/tcp'][0].HostPort;
    
    // Save deployment info
    await pool.query(
      'INSERT INTO agent_deployments (character_id, container_id, service_url, status) VALUES ($1, $2, $3, $4)',
      [agentId, container.id, `http://localhost:${hostPort}`, 'running']
    );
    
    res.status(201).json({
      agentId,
      name,
      status: 'running',
      url: `http://localhost:${hostPort}`
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Agent Manager running on port ${PORT}`);
});
```

## Cloud Migration Path

### Step 1: Update Environment Configuration
- Replace local PostgreSQL connection strings with Supabase
- Update storage paths to use Supabase Storage
- Set up Google Cloud Run environment variables

### Step 2: Modify Agent Manager
- Replace Docker container creation with Google Cloud Run API calls
- Update storage to use Supabase Storage for character files

### Step 3: Deploy Services
- Deploy Agent Manager to Google Cloud Run
- Deploy Web Frontend to Google Cloud Run or static hosting

### Step 4: Set Up Monitoring and Logging
- Implement Google Cloud Monitoring
- Set up logging for all services
- Create dashboards for system health

## Cost Considerations

### Local Development
- No cloud costs during development
- Only local resources used

### Cloud Deployment (MVP - 100 Agents)
- **Google Cloud Run**: $45-120/month
- **Supabase**: $25-50/month
- **Total Estimated Cost**: $70-170/month

## Security Considerations

- Store API keys in environment variables
- Use service accounts for Google Cloud Run
- Implement row-level security in Supabase
- Use HTTPS for all endpoints
- Implement proper authentication and authorization

## Next Steps

1. Set up local development environment
2. Implement core services (ElizaOS Integration Service, Agent Manager)
3. Create web frontend for agent management
4. Test the system end-to-end locally
5. Prepare cloud deployment configuration
6. Deploy to Google Cloud Run and Supabase

## Advanced Deployment Considerations

### 1. Monitoring and Observability

**Optimal Solution**: **Google Cloud Operations Suite + Custom Metrics**

- **Implementation**:
  - Use Google Cloud Operations (formerly Stackdriver) for basic infrastructure monitoring
  - Implement custom metrics for agent-specific monitoring:
    ```javascript
    // Example of sending custom metrics
    const monitoring = require('@google-cloud/monitoring');
    const metricsClient = new monitoring.MetricServiceClient();
    
    async function recordAgentActivity(agentId, metricType, value) {
      const projectId = 'paradyze-project';
      const metricPath = metricsClient.projectMetricDescriptorPath(
        projectId, 
        `custom.googleapis.com/agent/${metricType}`
      );
      
      const dataPoint = {
        interval: {
          endTime: {
            seconds: Date.now() / 1000
          }
        },
        value: {
          doubleValue: value
        }
      };
      
      const timeSeries = {
        metric: {
          type: metricPath,
          labels: {
            agent_id: agentId
          }
        },
        resource: {
          type: 'global',
          labels: {
            project_id: projectId
          }
        },
        points: [dataPoint]
      };
      
      await metricsClient.createTimeSeries({
        name: metricsClient.projectPath(projectId),
        timeSeries: [timeSeries]
      });
    }
    ```
  - Create a dedicated dashboard in Google Cloud Console for agent metrics
  - Set up alerts for critical thresholds (high error rates, low response rates)

### 2. Backup and Disaster Recovery

**Optimal Solution**: **Automated Supabase Backups + Versioned Character Files**

- **Implementation**:
  - Enable Supabase's point-in-time recovery (available on paid plans)
  - Implement versioning for character files:
    ```javascript
    // Store versioned character files
    async function storeCharacterVersion(userId, characterId, version, config) {
      const fileName = `${characterId}/v${version}.character.json`;
      
      await supabase
        .storage
        .from('character-files')
        .upload(fileName, JSON.stringify(config), {
          contentType: 'application/json',
          upsert: false // Never overwrite versions
        });
        
      // Update character record with current version
      await supabase
        .from('characters')
        .update({ current_version: version })
        .eq('id', characterId);
    }
    ```
  - Create a weekly export job that backs up all character configurations to Google Cloud Storage
  - Implement a restore function in your management API

### 3. CI/CD Pipeline

**Optimal Solution**: **GitHub Actions + Google Cloud Build**

- **Implementation**:
  - Use GitHub Actions for testing and validation:
    ```yaml
    # .github/workflows/ci.yml
    name: CI
    on: [push, pull_request]
    jobs:
      test:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
            with:
              node-version: '18'
          - run: npm ci
          - run: npm test
          
      lint:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
            with:
              node-version: '18'
          - run: npm ci
          - run: npm run lint
    ```
  - Use Google Cloud Build for deployment:
    ```yaml
    # cloudbuild.yaml
    steps:
    - name: 'gcr.io/cloud-builders/docker'
      args: ['build', '-t', 'gcr.io/$PROJECT_ID/agent-manager:$COMMIT_SHA', './agent-manager']
    - name: 'gcr.io/cloud-builders/docker'
      args: ['push', 'gcr.io/$PROJECT_ID/agent-manager:$COMMIT_SHA']
    - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
      entrypoint: gcloud
      args:
      - 'run'
      - 'deploy'
      - 'agent-manager'
      - '--image=gcr.io/$PROJECT_ID/agent-manager:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
    ```
  - Implement automatic rollback on failed deployments
  - Create separate environments (dev, staging, production)

### 4. Cost Optimization

**Optimal Solution**: **Scheduled Scaling + Idle Agent Hibernation**

- **Implementation**:
  - Implement scheduled scaling for predictable usage patterns:
    ```javascript
    // Schedule agent hibernation during off-hours
    const { CloudSchedulerClient } = require('@google-cloud/scheduler');
    const scheduler = new CloudSchedulerClient();
    
    async function scheduleAgentHibernation(agentId) {
      // Create a job to hibernate the agent at night
      const name = `hibernate-${agentId}`;
      const job = {
        name: scheduler.jobPath(projectId, 'us-central1', name),
        schedule: '0 0 * * *', // Midnight every day
        timeZone: 'America/New_York',
        httpTarget: {
          uri: `https://agent-manager-url/agents/${agentId}/hibernate`,
          httpMethod: 'POST'
        }
      };
      
      await scheduler.createJob({
        parent: scheduler.locationPath(projectId, 'us-central1'),
        job
      });
      
      // Create a job to wake the agent in the morning
      const wakeJob = {
        name: scheduler.jobPath(projectId, 'us-central1', `wake-${agentId}`),
        schedule: '0 8 * * *', // 8 AM every day
        timeZone: 'America/New_York',
        httpTarget: {
          uri: `https://agent-manager-url/agents/${agentId}/wake`,
          httpMethod: 'POST'
        }
      };
      
      await scheduler.createJob({
        parent: scheduler.locationPath(projectId, 'us-central1'),
        job: wakeJob
      });
    }
    ```
  - Implement activity-based hibernation:
    - Monitor agent activity
    - Automatically hibernate agents after 1 hour of inactivity
    - Use Cloud Run's scale-to-zero feature for management services
  - Use Cloud Run's CPU allocation settings to optimize for cost vs. performance

### 5. Security Hardening

**Optimal Solution**: **Zero-Trust Security Model + Least Privilege Access**

- **Implementation**:
  - Implement Identity-Aware Proxy (IAP) for accessing management interfaces
  - Use Secret Manager for all sensitive credentials:
    ```javascript
    // Access secrets securely
    const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
    const secretManager = new SecretManagerServiceClient();
    
    async function getApiKey(secretName) {
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await secretManager.accessSecretVersion({ name });
      return version.payload.data.toString('utf8');
    }
    
    // Usage
    const apiKey = await getApiKey('openrouter-api-key');
    ```
  - Implement row-level security in Supabase:
    ```sql
    -- Enable RLS
    ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can only see their own characters" 
    ON characters FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can only update their own characters" 
    ON characters FOR UPDATE 
    USING (auth.uid() = user_id);
    ```
  - Set up VPC Service Controls for Google Cloud resources
  - Implement regular security scanning of agent containers

### 6. Agent Lifecycle Management

**Optimal Solution**: **Semantic Versioning + Blue/Green Deployments**

- **Implementation**:
  - Implement semantic versioning for agent configurations:
    ```javascript
    // Agent versioning system
    function calculateNewVersion(currentVersion, changeType) {
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      
      switch (changeType) {
        case 'MAJOR': // Breaking changes
          return `${major + 1}.0.0`;
        case 'MINOR': // New features, backwards compatible
          return `${major}.${minor + 1}.0`;
        case 'PATCH': // Bug fixes
          return `${major}.${minor}.${patch + 1}`;
        default:
          return currentVersion;
      }
    }
    ```
  - Implement blue/green deployments for agent updates:
    - Create a new agent instance with updated configuration
    - Test the new instance
    - Gradually shift traffic from old to new instance
    - Remove old instance after successful transition
  - Create an agent status dashboard showing version information
  - Implement automated testing for new agent versions

### 7. Multi-region Deployment

**Optimal Solution**: **Active-Passive Multi-region Setup**

- **Implementation**:
  - Primary region: `us-central1` (lowest latency for most users)
  - Backup region: `europe-west1` (geographic redundancy)
  - Use Cloud DNS for automatic failover:
    ```javascript
    // Example of region failover logic
    async function checkPrimaryRegionHealth() {
      try {
        const response = await fetch('https://us-central1-paradyze.cloudfunctions.net/health');
        if (response.ok) {
          return true;
        }
      } catch (error) {
        console.error('Primary region health check failed:', error);
      }
      return false;
    }
    
    async function updateDnsForFailover(usePrimary) {
      const dns = new DNS();
      const zone = dns.zone('paradyze-zone');
      const record = zone.record('A', {
        name: 'api.paradyze.com.',
        data: usePrimary 
          ? '34.123.45.67' // Primary region IP
          : '35.189.78.90', // Backup region IP
        ttl: 300
      });
      
      await record.create();
    }
    ```
  - Implement database replication between regions
  - Create a health check system to monitor region availability

### 8. Testing Strategy

**Optimal Solution**: **Multi-layered Testing + Synthetic Agents**

- **Implementation**:
  - Unit tests for core functionality:
    ```javascript
    // Example unit test for character validation
    describe('Character Validation', () => {
      it('should validate a valid character configuration', () => {
        const config = {
          name: 'Trading Assistant',
          bio: 'I help with trading strategies',
          // ... other required fields
        };
        
        const result = validateCharacterConfig(config);
        expect(result.valid).toBe(true);
      });
      
      it('should reject an invalid character configuration', () => {
        const config = {
          // Missing required fields
        };
        
        const result = validateCharacterConfig(config);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('name is required');
      });
    });
    ```
  - Integration tests for agent creation and management
  - Create synthetic agents that simulate user interactions
  - Implement A/B testing for agent configurations:
    ```javascript
    // A/B testing for agent responses
    async function testAgentConfigurations(baseConfig, variants, testCases) {
      const results = {};
      
      // Create an agent for each variant
      for (const [variantName, variantConfig] of Object.entries(variants)) {
        const config = { ...baseConfig, ...variantConfig };
        const agentId = await createTestAgent(config);
        
        // Run test cases
        const variantResults = [];
        for (const testCase of testCases) {
          const response = await sendMessageToAgent(agentId, testCase.message);
          const score = evaluateResponse(response, testCase.expectedOutcome);
          variantResults.push({ testCase: testCase.name, score });
        }
        
        results[variantName] = {
          averageScore: variantResults.reduce((sum, r) => sum + r.score, 0) / variantResults.length,
          detailedResults: variantResults
        };
        
        // Clean up test agent
        await deleteTestAgent(agentId);
      }
      
      return results;
    }
    ```
  - Implement continuous monitoring in production
