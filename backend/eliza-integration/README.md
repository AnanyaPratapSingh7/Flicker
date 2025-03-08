# ElizaIntegrationService Documentation

## Overview

The ElizaIntegrationService provides a flexible, type-safe integration with ElizaOS using both direct TypeScript module imports and HTTP API calls. This service supports two integration modes:

1. **Direct Mode**: Uses the `@elizaos/client-direct` module for direct integration with ElizaOS
2. **API Mode**: Uses HTTP API calls to interact with ElizaOS

## Configuration

The integration mode can be configured using the `ELIZAOS_INTEGRATION_MODE` environment variable:

```
ELIZAOS_INTEGRATION_MODE=direct  # For direct integration
ELIZAOS_INTEGRATION_MODE=api     # For API integration (default)
```

## Installation

Ensure you have the required dependencies installed:

```bash
npm install @elizaos/client-direct @elizaos/core
```

## Usage

### Initializing the Service

```typescript
import { ElizaIntegrationService } from './ElizaIntegrationService';

// Default initialization
const elizaService = new ElizaIntegrationService();

// With custom configuration
const elizaService = new ElizaIntegrationService({
  elizaRuntimePath: '/custom/path/to/eliza',
  elizaApiBaseUrl: 'http://custom-eliza-api.com',
  characterPath: '/custom/path/to/characters'
});
```

### Starting and Stopping the ElizaOS Runtime

```typescript
// Start the ElizaOS runtime
await elizaService.startElizaRuntime();

// Stop the ElizaOS runtime
await elizaService.stopElizaRuntime();
```

### Agent Management

```typescript
// Create an agent
const agentId = await elizaService.createAgent('default', 'My Agent', 'A description of my agent');

// Get agent details
const agent = await elizaService.getAgent(agentId);

// List all agents
const agents = await elizaService.listAgents();

// Delete an agent
await elizaService.deleteAgent(agentId);

// Get agent status
const status = await elizaService.getAgentStatus(agentId);

// Restart an agent
await elizaService.restartAgent(agentId);
```

### Messaging

```typescript
// Send a message to an agent
const response = await elizaService.sendMessage(agentId, 'Hello, agent!');

// Get conversation history
const history = await elizaService.getConversationHistory(agentId);
```

### Agent Configuration

```typescript
// Update agent character
await elizaService.updateAgentCharacter(agentId, characterData);

// Set agent model provider
await elizaService.setAgentModelProvider(agentId, 'openai', { model: 'gpt-4' });

// Enable Twitter client for an agent
await elizaService.enableTwitterClient(agentId, twitterConfig);
```

## Integration Modes

### Direct Mode

Direct mode uses the `@elizaos/client-direct` module to interact with ElizaOS directly. This mode is recommended for:

- Local development
- Environments where ElizaOS is running on the same machine
- Scenarios requiring direct access to ElizaOS features

### API Mode

API mode uses HTTP API calls to interact with ElizaOS. This mode is recommended for:

- Production environments
- Scenarios where ElizaOS is running on a different machine
- Environments where direct access to ElizaOS is not possible

## Error Handling

The service includes comprehensive error handling for both integration modes. All methods return promises that can be caught to handle errors:

```typescript
try {
  await elizaService.startElizaRuntime();
} catch (error) {
  console.error('Failed to start ElizaOS runtime:', error);
}
```

## Testing

A test script is provided to verify the functionality of the ElizaIntegrationService in both integration modes:

```bash
node test-integration.js
```

## Troubleshooting

If you encounter issues with the ElizaIntegrationService, check the following:

1. Ensure the correct integration mode is set in the environment variables
2. Verify that ElizaOS is running and accessible
3. Check the console for error messages
4. Ensure all required dependencies are installed

## Advanced Configuration

The ElizaIntegrationService supports additional configuration options through environment variables:

- `ELIZAOS_API_BASE_URL`: The base URL for the ElizaOS API
- `ELIZAOS_RUNTIME_PATH`: The path to the ElizaOS runtime
- `ELIZAOS_CHARACTER_PATH`: The path to the ElizaOS character files

## Contributing

If you encounter any issues or have suggestions for improvements, please submit an issue or pull request to the repository.
