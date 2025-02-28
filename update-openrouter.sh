#!/bin/bash

# Set the OpenRouter API key and model
export OPENROUTER_API_KEY="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"
export OPENROUTER_MODEL="openai/gpt-4o-mini"
export SMALL_OPENROUTER_MODEL="openai/gpt-4o-mini"
export MEDIUM_OPENROUTER_MODEL="openai/gpt-4o-mini"
export LARGE_OPENROUTER_MODEL="openai/gpt-4o-mini"
export DEFAULT_MODEL_PROVIDER="openrouter"

# Start the agent with the trading agent character
cd /Users/dennis/Desktop/projects/paradyzev2/backend/eliza-main && pnpm start --character=characters/trading-agent.character.json
