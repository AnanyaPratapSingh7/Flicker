# Paradyze V2 Development Guide

This guide explains how to set up and run the Paradyze V2 development environment efficiently.

## Service Architecture

Paradyze V2 consists of several interconnected services that work together:

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React application |
| Eliza Integration | 3001 | Integration API |
| API Server | 3002 | Backend API services |
| OpenRouter Proxy | 3003 | AI chat proxy |
| Eliza Main | 3005 | Eliza core runtime |

## Environment Setup

We've created scripts to simplify the setup and management of your development environment.

1. First, set up your environment variables:

```bash
node setup-environment.js
```

This will:
- Create all necessary `.env` files with proper configurations
- Ensure consistent port allocations across all services
- Install any missing dependencies

## Starting the Development Environment

### Using the Development Manager

The easiest way to manage your development environment is to use the included manager:

```bash
npm run dev:manager
```

This starts an interactive console where you can:
- Start and stop individual services
- Start and stop all services
- Check the status and health of running services
- See logs from all services in one console

### Starting All Services

To start all services at once in the correct order (except ElizaOS):

```bash
npm run dev:all
```

### Manually Starting ElizaOS Runtime

The ElizaOS Runtime must be started manually due to its complex setup requirements:

```bash
cd backend/eliza-main

# Ensure the environment variables are correct
cat .env

# Make sure ELIZAOS_PORT=3005 is set, if not, add it to .env
echo "ELIZAOS_PORT=3005" >> .env

# Start the service using pnpm
pnpm start
```

This will start ElizaOS Runtime on port 3005 which is the expected port that other services will connect to.

### Starting Individual Services

You can also start services individually:

```bash
npm run dev:frontend    # Start just the frontend
npm run dev:openrouter  # Start just the OpenRouter proxy
npm run dev:integration # Start just the Eliza integration
```

Remember that ElizaOS Runtime must be started manually as described above.

## Troubleshooting

### Port Conflicts

If you experience port conflicts:

1. The dev manager will automatically attempt to free ports in use
2. You can manually free ports with these commands:

```bash
# macOS/Linux
lsof -i :PORT_NUMBER
kill -9 PID

# Windows
netstat -ano | findstr :PORT_NUMBER
taskkill /PID PID /F
```

### API Key Not Configured

If you see "OpenRouter API key is not configured" error:

1. Ensure you've run the `setup-environment.js` script
2. Verify the API key is correctly set in the `.env` file
3. Restart the OpenRouter proxy service

## Development Workflow Best Practices

1. **Always use the development manager** - This ensures services start in the correct order
   
2. **Check service dependencies** - Before starting a service, ensure its dependencies are running
   
3. **Use a consistent port configuration** - Don't change the port numbers unless absolutely necessary
   
4. **Monitor logs from all services** - The development manager gives you a unified view of all logs

5. **Graceful shutdown** - Always use the manager to stop services gracefully

## Adding New Services

If you need to add a new service to the architecture:

1. Update the `SERVICES` object in `paradyze-dev.js`
2. Add the new port to the root `.env` file
3. Update the `setup-environment.js` script if needed
4. Add any new dependencies to the service configuration

## Environment Variables

Key environment variables used across the system:

- `OPENROUTER_API_KEY` - API key for OpenRouter
- `OPENROUTER_MODEL` - Default AI model (default: openai/gpt-4o-mini)
- `FRONTEND_PORT` - Port for frontend app
- `INTEGRATION_PORT` - Port for integration service
- `API_PORT` - Port for API server
- `OPENROUTER_PORT` - Port for OpenRouter proxy
- `ELIZA_PORT` - Port for Eliza main service
- `APP_URL` - URL for the frontend app
- `SW_DEV` - Service Worker development mode
