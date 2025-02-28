#!/bin/bash

# Initialize SQLite database for ElizaOS
echo "Initializing SQLite database for ElizaOS..."

# Create data directory if it doesn't exist
mkdir -p data

# Set the database path
DB_PATH="./data/paradyze.db"

# Update .env file to use SQLite
if [ -f .env ]; then
  # Check if DATABASE_URL exists in .env
  if grep -q "DATABASE_URL=" .env; then
    # Replace existing DATABASE_URL
    sed -i '' 's|DATABASE_URL=.*|DATABASE_URL=sqlite:'"$DB_PATH"'|g' .env
  else
    # Add DATABASE_URL
    echo "DATABASE_URL=sqlite:$DB_PATH" >> .env
  fi
  echo "Updated .env file to use SQLite"
else
  # Create .env file
  echo "DATABASE_URL=sqlite:$DB_PATH" > .env
  echo "Created .env file with SQLite configuration"
fi

# Update ElizaOS .env file if it exists
if [ -d backend/eliza-main ]; then
  if [ -f backend/eliza-main/.env ]; then
    # Check if DATABASE_URL exists in ElizaOS .env
    if grep -q "DATABASE_URL=" backend/eliza-main/.env; then
      # Replace existing DATABASE_URL
      sed -i '' 's|DATABASE_URL=.*|DATABASE_URL=sqlite:../..'"$DB_PATH"'|g' backend/eliza-main/.env
    else
      # Add DATABASE_URL
      echo "DATABASE_URL=sqlite:../../$DB_PATH" >> backend/eliza-main/.env
    fi
    echo "Updated ElizaOS .env file to use SQLite"
  fi
fi

echo "SQLite database initialization complete!"
echo "Database path: $DB_PATH" 