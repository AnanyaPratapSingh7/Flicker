# Paradyze V2 Database Schema

This document outlines the database structure for Paradyze V2 using Supabase as the database provider.

## Overview

The database schema is designed to support the following key features:

- User profiles and authentication
- AI agent configuration and management
- Conversation tracking and message history
- Twitter integration and tweet management

## Entity Relationship Diagram

```
profiles
  ↑
  |
  +-----> agents <----> conversations <----> messages
  |         |
  +-----> twitter_accounts <----> tweets
```

## Tables

### profiles

Stores user information linked to Supabase Auth.

| Column        | Type      | Description                             |
|---------------|-----------|-----------------------------------------|
| id            | UUID      | Primary key, references auth.users(id)  |
| display_name  | TEXT      | User's display name                     |
| email         | TEXT      | User's email address                    |
| created_at    | TIMESTAMP | Creation timestamp                      |
| updated_at    | TIMESTAMP | Last update timestamp                   |

### agents

Stores ElizaOS agent configurations.

| Column        | Type      | Description                             |
|---------------|-----------|-----------------------------------------|
| id            | UUID      | Primary key                             |
| user_id       | UUID      | References profiles(id)                 |
| eliza_id      | TEXT      | ElizaOS agent identifier                |
| name          | TEXT      | Agent name                              |
| description   | TEXT      | Agent description                       |
| template_id   | TEXT      | Character template identifier           |
| config        | JSONB     | Custom configuration (optional)         |
| created_at    | TIMESTAMP | Creation timestamp                      |
| updated_at    | TIMESTAMP | Last update timestamp                   |

### twitter_accounts

Stores Twitter account credentials linked to users.

| Column          | Type      | Description                           |
|-----------------|-----------|---------------------------------------|
| id              | UUID      | Primary key                           |
| user_id         | UUID      | References profiles(id)               |
| twitter_user_id | TEXT      | Twitter user ID                       |
| username        | TEXT      | Twitter username                      |
| access_token    | TEXT      | OAuth access token                    |
| access_secret   | TEXT      | OAuth access secret                   |
| created_at      | TIMESTAMP | Creation timestamp                    |
| updated_at      | TIMESTAMP | Last update timestamp                 |

### conversations

Tracks conversations between users and agents.

| Column        | Type      | Description                             |
|---------------|-----------|-----------------------------------------|
| id            | UUID      | Primary key                             |
| agent_id      | UUID      | References agents(id)                   |
| user_id       | UUID      | References profiles(id)                 |
| room_id       | TEXT      | ElizaOS room identifier                 |
| created_at    | TIMESTAMP | Creation timestamp                      |
| updated_at    | TIMESTAMP | Last update timestamp                   |

### messages

Stores individual messages within conversations.

| Column          | Type      | Description                           |
|-----------------|-----------|---------------------------------------|
| id              | UUID      | Primary key                           |
| conversation_id | UUID      | References conversations(id)          |
| sender_type     | TEXT      | Either 'user' or 'agent'              |
| content         | TEXT      | Message content                       |
| created_at      | TIMESTAMP | Creation timestamp                    |

### tweets

Tracks tweets posted by agents.

| Column              | Type      | Description                       |
|---------------------|-----------|-----------------------------------|
| id                  | UUID      | Primary key                       |
| agent_id            | UUID      | References agents(id)             |
| twitter_account_id  | UUID      | References twitter_accounts(id)   |
| content             | TEXT      | Tweet content                     |
| twitter_tweet_id    | TEXT      | Twitter-assigned tweet ID         |
| status              | TEXT      | 'pending', 'posted', or 'failed'  |
| created_at          | TIMESTAMP | Creation timestamp                |
| posted_at           | TIMESTAMP | When the tweet was posted         |

## Row Level Security (RLS)

All tables have Row Level Security enabled to ensure that users can only access their own data:

- Users can only view, insert, update, and delete data they own
- Security is enforced at the database level
- Authentication is managed via Supabase Auth

## Indexing Strategy

The following indexes have been created for optimal query performance:

- `agents_user_id_idx`
- `twitter_accounts_user_id_idx`
- `conversations_agent_id_idx`
- `conversations_user_id_idx`
- `messages_conversation_id_idx`
- `tweets_agent_id_idx`
- `tweets_twitter_account_id_idx`

## Triggers and Functions

- `handle_new_user()` function and `on_auth_user_created` trigger: Automatically creates a profile entry when a new user signs up

## Usage

To apply this schema to your Supabase project:

1. Navigate to the SQL Editor in the Supabase dashboard
2. Copy the content of `backend/eliza-integration/db/schema.sql`
3. Run the SQL statements to create the tables and set up security policies

## Migrations

Currently, the project uses manual SQL migrations. Future enhancements will include:

- Version-controlled migrations
- Automated CI/CD integration
- Testing procedures for database changes
