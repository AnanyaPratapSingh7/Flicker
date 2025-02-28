#!/bin/bash

# Test script for ElizaOS agent deployment
echo "Testing ElizaOS agent deployment..."

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

# Start ElizaOS runtime
echo "Starting ElizaOS runtime..."
RUNTIME_RESPONSE=$(curl -s -X POST http://localhost:3001/api/eliza/start)
echo "Runtime response: $RUNTIME_RESPONSE"

# Create a character
echo "Creating character..."
CHARACTER_CONFIG=$(cat backend/eliza-main/characters/trading-agent.character.json)
CHARACTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/characters -H "Content-Type: application/json" -d "{\"name\": \"Trading Assistant\", \"description\": \"A trading assistant that helps with market analysis\", \"configuration\": $CHARACTER_CONFIG}")
CHARACTER_ID=$(echo $CHARACTER_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)

echo "Character ID: $CHARACTER_ID"

# Deploy the character as an agent
echo "Deploying agent..."
AGENT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/agents -H "Content-Type: application/json" -d "{\"characterId\": \"$CHARACTER_ID\", \"name\": \"Trading Assistant Instance\"}")
AGENT_ID=$(echo $AGENT_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)
AGENT_URL=$(echo $AGENT_RESPONSE | grep -o '"url":"[^"]*' | sed 's/"url":"//' | head -1)

echo "Agent ID: $AGENT_ID"
echo "Agent URL: $AGENT_URL"

# Test sending a message to the agent
echo "Waiting for agent to start..."
sleep 10

echo "Sending test message to agent..."
MESSAGE_RESPONSE=$(curl -s -X POST $AGENT_URL/api/chat -H "Content-Type: application/json" -d '{"message": "What trading strategies do you recommend for a volatile market?"}')

echo "Agent response:"
echo $MESSAGE_RESPONSE

echo "Test complete!"
