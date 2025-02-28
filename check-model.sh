#!/bin/bash

# Check the environment variables
echo "Environment Variables:"
echo "OPENROUTER_API_KEY: $OPENROUTER_API_KEY"
echo "OPENROUTER_MODEL: $OPENROUTER_MODEL"
echo "DEFAULT_MODEL_PROVIDER: $DEFAULT_MODEL_PROVIDER"

# Check the character configuration
echo -e "\nCharacter Configuration:"
cat /Users/dennis/Desktop/projects/paradyzev2/backend/eliza-main/characters/trading-agent.character.json | grep -A 5 "model"
