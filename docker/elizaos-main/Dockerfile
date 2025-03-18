FROM node:23.3.0-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y git python3 && \
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