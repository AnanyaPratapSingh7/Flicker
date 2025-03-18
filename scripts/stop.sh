#!/bin/bash
echo "Stopping Paradyze services..."

# Check if docker-compose is available as a standalone command
if command -v docker-compose &> /dev/null; then
    docker-compose down
# Otherwise try using the docker compose plugin
elif command -v docker &> /dev/null; then
    docker compose down
else
    echo "Error: Neither docker-compose nor docker compose commands are available."
    echo "Please install Docker and Docker Compose to continue."
    exit 1
fi

echo "All services stopped." 