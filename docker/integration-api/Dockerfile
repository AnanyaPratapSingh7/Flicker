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

# Install dependencies, keeping better-sqlite3 for database operations
RUN npm install

# Copy the rest of the application
COPY backend/eliza-integration ./

# Create data directory
RUN mkdir -p /app/data && chmod 777 /app/data

# Set environment variables for API mode
ENV ELIZAOS_INTEGRATION_MODE=api
ENV INTEGRATION_PORT=3006
ENV ELIZA_API_URL=http://elizaos-main:3000

EXPOSE 3006

# Use standard command for running the application
CMD ["npx", "ts-node", "api.ts"] 