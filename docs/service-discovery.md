# Service Discovery in Paradyze V2

## Overview

Paradyze V2 implements a service discovery mechanism to enable flexible deployment and dynamic service resolution across its microservices architecture. This document explains how the system works, how to use it, and how to integrate it with new services.

## Key Components

### Service Registry

The Service Registry (`service-registry.js`) is a centralized service that maintains information about all running services in the system. It provides endpoints for:

- Registering services with their metadata
- Unregistering services when they shut down
- Retrieving service information by service name
- Listing all available services

**Default Port:** 3999

The registry persists its state to a JSON file to maintain service information across restarts.

### Service Discovery Client

The Service Discovery Client (`src/utils/service-discovery.js`) is a utility module that provides methods for:

- `registerService()`: Register a service with the registry
- `unregisterService()`: Remove a service from the registry
- `getServiceUrl()`: Resolve a service URL dynamically
- `listServices()`: Get a list of all available services

The client includes fallback mechanisms that check:
1. Service registry for service information
2. Environment variables with the format `{SERVICE_NAME}_URL`
3. Local development defaults based on known ports

## Service Registry API

### Register a Service

```
POST /register
```

Request body:
```json
{
  "serviceName": "service-name",
  "url": "http://hostname:port",
  "health": "http://hostname:port/health",
  "metadata": {
    "version": "1.0.0",
    "endpoints": {
      "endpoint1": "/path/to/endpoint1",
      "endpoint2": "/path/to/endpoint2"
    }
  }
}
```

### Unregister a Service

```
POST /unregister
```

Request body:
```json
{
  "serviceName": "service-name"
}
```

### Get Service Information

```
GET /services/:serviceName
```

### List All Services

```
GET /services
```

## Integration Guide

### 1. Register Your Service

When your service starts up, it should register itself with the service registry:

```javascript
const { registerService } = require('./src/utils/service-discovery');

// Register this service
registerService('my-service', `http://localhost:${PORT}`, {
  version: '1.0.0',
  endpoints: {
    api: '/api/v1',
    health: '/health'
  }
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await unregisterService('my-service');
  process.exit(0);
});
```

### 2. Resolve Service URLs

When your service needs to communicate with another service:

```javascript
const { getServiceUrl } = require('./src/utils/service-discovery');

async function callOtherService() {
  try {
    // Dynamically resolve the service URL
    const serviceUrl = await getServiceUrl('other-service');
    
    // Make your API call
    const response = await fetch(`${serviceUrl}/api/endpoint`);
    return response.json();
  } catch (error) {
    console.error('Failed to communicate with other-service:', error);
  }
}
```

## Local Development

For local development, the service registry is started automatically when you run:

```
npm run dev:registry
```

Or as part of the full development environment:

```
npm run dev:all
```

## Environment Variables

- `SERVICE_REGISTRY_URL`: URL for the service registry (default: `http://localhost:3999`)
- `SERVICE_REGISTRY_PORT`: Port for the service registry (default: `3999`)
- Individual service URLs can be specified with `{SERVICE_NAME}_URL` variables

## Future Improvements

- Health checking and automatic service deregistration
- Service versioning and compatibility
- Load balancing across multiple instances
- Authentication for service registry API

## Troubleshooting

If service discovery isn't working as expected:

1. Check if the service registry is running (`curl http://localhost:3999/health`)
2. Verify your service is registered (`curl http://localhost:3999/services`)
3. Check if environment variables are correctly configured
4. Look for connection errors in service logs
