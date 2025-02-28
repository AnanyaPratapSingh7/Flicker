#!/bin/bash

# Initialize PostgreSQL database for ElizaOS
echo "Initializing PostgreSQL database for ElizaOS..."

# Set the database URL
DB_URL="postgres://postgres:postgres@localhost:5432/paradyze"

# Update .env file to use PostgreSQL
if [ -f .env ]; then
  # Check if DATABASE_URL exists in .env
  if grep -q "DATABASE_URL=" .env; then
    # Replace existing DATABASE_URL
    sed -i '' 's|DATABASE_URL=.*|DATABASE_URL='"$DB_URL"'|g' .env
  else
    # Add DATABASE_URL
    echo "DATABASE_URL=$DB_URL" >> .env
  fi
  echo "Updated .env file to use PostgreSQL"
else
  # Create .env file
  echo "DATABASE_URL=$DB_URL" > .env
  echo "Created .env file with PostgreSQL configuration"
fi

# Update ElizaOS .env file if it exists
if [ -d backend/eliza-main ]; then
  if [ -f backend/eliza-main/.env ]; then
    # Check if DATABASE_URL exists in ElizaOS .env
    if grep -q "DATABASE_URL=" backend/eliza-main/.env; then
      # Replace existing DATABASE_URL
      sed -i '' 's|DATABASE_URL=.*|DATABASE_URL='"$DB_URL"'|g' backend/eliza-main/.env
    else
      # Add DATABASE_URL
      echo "DATABASE_URL=$DB_URL" >> backend/eliza-main/.env
    fi
    echo "Updated ElizaOS .env file to use PostgreSQL"
  fi
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
  echo "PostgreSQL is not installed. Please install PostgreSQL and try again."
  exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
  echo "PostgreSQL is not running. Please start PostgreSQL and try again."
  exit 1
fi

# Create the database if it doesn't exist
if ! psql -h localhost -p 5432 -U postgres -lqt | cut -d \| -f 1 | grep -qw paradyze; then
  echo "Creating database 'paradyze'..."
  psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE paradyze;"
  echo "Database 'paradyze' created successfully"
else
  echo "Database 'paradyze' already exists"
fi

# Check if pgvector extension is available
if ! psql -h localhost -p 5432 -U postgres -c "SELECT * FROM pg_available_extensions WHERE name = 'vector';" | grep -q vector; then
  echo "WARNING: pgvector extension is not available in your PostgreSQL installation."
  echo "ElizaOS requires pgvector for semantic memory features."
  echo "Please install pgvector following instructions at: https://github.com/pgvector/pgvector"
  echo "Continuing without vector support (some features will be limited)..."
else
  # Check if pgvector extension is installed in the database
  if ! psql -h localhost -p 5432 -U postgres -d paradyze -c "SELECT * FROM pg_extension WHERE extname = 'vector';" | grep -q vector; then
    echo "Installing pgvector extension..."
    psql -h localhost -p 5432 -U postgres -d paradyze -c "CREATE EXTENSION IF NOT EXISTS vector;"
    echo "pgvector extension installed successfully"
  else
    echo "pgvector extension is already installed"
  fi
fi

# Run the Node.js initialization script
echo "Running database initialization script..."
if [ -f scripts/init-postgres-db.js ]; then
  node scripts/init-postgres-db.js
else
  echo "Warning: Database initialization script not found at scripts/init-postgres-db.js"
  echo "Please run the initialization script manually"
fi

echo "PostgreSQL database initialization complete!"
echo "Database URL: $DB_URL"
echo ""
echo "IMPORTANT: For full ElizaOS functionality, ensure that:"
echo "1. The pgvector extension is installed"
echo "2. The @elizaos/adapter-postgres package is installed"
echo "3. Your application is configured to use the PostgreSQL database" 