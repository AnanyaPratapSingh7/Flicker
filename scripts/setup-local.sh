#!/bin/bash

# Setup script for local development environment
echo "Setting up Paradyze V2 local development environment..."

# Create necessary directories
mkdir -p backend/eliza-integration
mkdir -p backend/eliza-main
mkdir -p backend/agent-manager
mkdir -p database/init

# Copy the database schema
echo "Copying database schema..."
cp backend/eliza-integration/db/schema.sql database/init/01-schema.sql

# Install dependencies for agent-manager
echo "Installing dependencies for agent-manager..."
cd agent-manager
npm install
cd ..

# Build Docker images
echo "Building Docker images..."
docker-compose build

# Start the services
echo "Starting services..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

echo "Setup complete! Your local development environment is now running."
echo ""
echo "Available endpoints:"
echo "- ElizaOS Integration API: http://localhost:3001"
echo "- Agent Manager: http://localhost:3002"
echo ""
echo "To stop the services, run: docker-compose down"
