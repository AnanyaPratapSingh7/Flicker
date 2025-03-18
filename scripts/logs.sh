#!/bin/bash

# Check which docker compose command is available
DOCKER_COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif command -v docker &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "Error: Neither docker-compose nor docker compose commands are available."
    echo "Please install Docker and Docker Compose to continue."
    exit 1
fi

if [ -z "$1" ]; then
  echo "Showing logs for all services. Press Ctrl+C to exit."
  $DOCKER_COMPOSE_CMD logs -f
else
  echo "Showing logs for $1. Press Ctrl+C to exit."
  $DOCKER_COMPOSE_CMD logs -f $1
fi 