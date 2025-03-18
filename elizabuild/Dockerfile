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

# Create a tokenizer directory and set permissions for the volume mount
RUN mkdir -p /app/tokenizers /app/node_modules/@anush008/tokenizers

# Copy the ElizaOS v0.1.9 source code
COPY eliza/ /app/

# Install pnpm
RUN npm install -g pnpm@10.6.3

# Disable signature verification for pnpm
ENV NODE_OPTIONS="--no-deprecation --experimental-fetch"
ENV PNPM_REGISTRY_VERIFICATION_ENABLED=false

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm build

# Create necessary environment variables
ENV ELIZAOS_PORT=3000
ENV ELIZAOS_MODE=development
ENV AI_OPENROUTER_API_KEY=
ENV AI_OPENROUTER_MODEL=openai/gpt-4o-mini
ENV DEFAULT_MODEL_PROVIDER=openrouter
ENV DATABASE_URL=sqlite:/data/elizaos.db

# Expose port 3000
EXPOSE 3000

# Set up volume for tokenizers and data persistence
VOLUME ["/app/tokenizers", "/app/node_modules/@anush008/tokenizers", "/data"]

# Create a startup script
RUN echo '#!/bin/bash\n\
echo "Setting up ElizaOS v0.1.9 with tokenizer fix..."\n\
# Copy tokenizers if they exist\n\
if [ -d "/app/tokenizers" ] && [ "$(ls -A /app/tokenizers)" ]; then\n\
  echo "Copying tokenizers to the correct locations..."\n\
  cp -r /app/tokenizers/* /app/node_modules/@anush008/tokenizers/ || echo "Failed to copy tokenizers"\n\
  # Copy to nested pnpm directories if they exist\n\
  find /app/node_modules -path "*/node_modules/@anush008/tokenizers" -type d -exec cp -r /app/tokenizers/* {} \; || echo "No nested tokenizer directories found"\n\
fi\n\
# Start ElizaOS\n\
echo "Starting ElizaOS..."\n\
pnpm start\n\
' > /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

# Set the command to run the start script
CMD ["/app/docker-entrypoint.sh"] 