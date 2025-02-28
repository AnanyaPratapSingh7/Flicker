<!-- Source: https://elizaos.github.io/eliza/docs/core/overview/ -->
Overview | eliza (https://elizaos.github.io/eliza/docs/core/overview/)
  
URL: https://elizaos.github.io/eliza/docs/core/overview/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Overview 

On this page 

# Overview

Eliza is a framework for creating AI agents that can interact across multiple platforms.

Features

  * Modular Design: Plugins and services allow for flexible customization.
  * Scalable Knowledge: Supports both RAG-based and direct knowledge processing.
  * Stateful Interactions: Maintains context across conversations.
  * Multi-Agent Support: Supports running multiple agents with distinct configurations.
  * Multi-Platform Support: Integrates with various clients (e.g., Discord, Telegram).

This document provides a high-level overview of the system architecture and how components work together.

* * *

##  

The Brain

The Runtime (`src/runtime.ts`) acts as the control tower for your AI agents. Think of it as a conductor leading an orchestra - it ensures all parts work together harmoniously. It serves as the central coordination layer for message processing, memory management, state composition, action execution, and integration with AI models and external services.

  * Core Functions:
    * Coordinates message processing
    * Manages the agent's lifecycle
    * Handles integration with AI models
    * Orchestrates plugins and services

##  

The Personality

  (`src/types.ts`) define agent personalities and capabilities including biographical information, interaction styles, plugin configurations, and platform integrations.

The character file defines who your agent is - like a script for an actor. It includes:

  * Biographical information and backstory
  * Topics the agent can discuss
  * Writing style and tone
  * Which AI models to use
  * Which plugins to load
  * Which platforms to connect to

##  

The Interface

Clients connect your agent to different platforms (Discord, Twitter, Slack, Farcaster, etc.) while maintaining consistent behavior across all interfaces. Each client can handle different types of interactions:

  * Chat messages
  * Social media posts
  * Voice conversations
  * Platform-specific features

##  

What Agents Can Do

Actions (`src/actions.ts`) are like tools in a toolbox. They define how agents respond and interact with messages, enabling custom behaviors, external system interactions, media processing, and platform-specific features.

##  

Quality Control

Evaluators (`src/evaluators.ts`) act like referees, making sure the agent follows rules and guidelines. They monitor conversations and help improve agent responses over time by assessing conversations and maintaining agent knowledge through fact extraction, goal tracking, memory building, and relationship management.

##  

Information Flow

Providers (`src/providers.ts`) are the agent's eyes and ears, like a newsroom keeping them informed about the world. They supply real-time information to agents by integrating external APIs, managing temporal awareness, and providing system status updates to help agents make better decisions.

## Memory & Knowledge Systems

The framework implements specialized memory systems through:

### Memory Manager

The Memory Manager (`src/memory.ts`) acts like a personal diary and helps agents remember:

  * Recent conversations
  * Important facts
  * User interactions
  * Immediate context for current discussions

### Knowledge Systems

Think of this as the agent's library (`src/knowledge.ts`, `src/ragknowledge.ts`), where information is:

  * Organized into searchable chunks
  * Converted into vector embeddings
  * Retrieved based on relevance
  * Used to enhance responses

## Data Management

The data layer provides robust storage and caching through:

### Database System

The database (`src/database.ts`) acts as a filing cabinet, storing:

  * Conversation histories
  * User interactions
  * Transaction management
  * Vector storage
  * Relationship tracking
  * Embedded knowledge
  * Agent state

See also:  

## Cache System

Performance Optimization

The Cache System (`src/cache.ts`) creates shortcuts for frequently accessed information, making agents respond faster and more efficiently.

## System Flow

When someone interacts with your agent, the Client receives the message and forwards it to the Runtime which processes it with the characterfile configuration. The Runtime loads relevant memories and knowledge, uses actions and evaluators to determine how to response, gets additional context through providers. Then the Runtime generates a response using the AI model, stores new memories, and sends the response back through the client.

* * *

## Common Patterns

### Memory Usage (`src/memory.ts`)

    // Store conversation data   
    await messageManager.createMemory({  
        id: messageId,  
        content: { text: "Message content" },  
        userId: userId,  
        roomId: roomId  
    });  

    // Retrieve context   
    const recentMessages = await messageManager.getMemories({  
        roomId: roomId,  
        count: 10  
    });  

### Action Implementation (`src/actions.ts`)

    const customAction: Action = {  
        name: "CUSTOM_ACTION",  
        similes: ["ALTERNATE_NAME"],  
        description: "Action description",  
        validate: async (runtime, message) => {  
            // Validation logic  
            return true;  
        },  
        handler: async (runtime, message) => {  
            // Implementation logic  
            return true;  
        }  
    };  

### Provider Integration (`src/providers.ts`)

    const dataProvider: Provider = {  
        get: async (runtime: IAgentRuntime, message: Memory) => {  
            // Fetch and format data  
            return "Formatted context string";  
        }  
    };  

* * *

## FAQ

### What's the difference between Actions, Evaluators, and Providers?

Actions define what an agent can do, Evaluators analyze what happened, and Providers supply information to help make decisions.

### Can I use multiple AI models with one agent?

Yes, agents can be configured to use different models for different tasks (chat, image generation, embeddings) through the modelProvider settings.

### How does memory persistence work?

Memory is stored through database adapters which can use SQLite, PostgreSQL, or other backends, with each type (messages, facts, knowledge) managed separately.

### What's the difference between Lore and Knowledge?

Lore defines the character's background and history, while Knowledge represents factual information the agent can reference and use.

### How do I add custom functionality?

Create plugins that implement the Action, Provider, or Evaluator interfaces and register them with the runtime.

### Do I need to implement all components?

No, each component is optional. Start with basic Actions and add Evaluators and Providers as needed.

### How does RAG integration work?

Documents are chunked, embedded, and stored in the knowledge base for semantic search during conversations via the RAGKnowledgeManager.

### What's the recommended database for production?

PostgreSQL with vector extensions is recommended for production, though SQLite works well for development and testing.

 

Last updated on Feb 26, 2025 by jin

  

  * Agent Runtime 
  * Character Files 
  * Clients 
  * Actions 
  * Evaluators 
  * Providers
  *  
    *  
    *  
  *  
    *  
  *  
  *  
  *  
    *  
    *  
    *  
  *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  

Docs

  *  

Community

  *  
  *  

More

  *  


<!-- Source: https://elizaos.github.io/eliza/docs/core/characterfile/ -->
Character Files | eliza (https://elizaos.github.io/eliza/docs/core/characterfile/)
  
URL: https://elizaos.github.io/eliza/docs/core/characterfile/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Character Files 

On this page

#  Character Files

Character files are JSON-formatted configurations that define AI agent personas, combining personality traits, knowledge bases, and interaction patterns to create consistent and effective AI agents. For a full list of capabilities check the `character` type  . You can also view and contribute to open sourced example characterfiles here:  .

> For making characters, check out the open source elizagen!:    

* * *

## Required Fields

    {  
        "name": "character_name",           // Character's display name for identification and in conversations  
        "modelProvider": "openai",          // AI model provider (e.g., anthropic, openai, groq, mistral, google)  
        "clients": ["discord", "direct"],   // Supported client types  
        "plugins": [],                      // Array of plugins to use  
        "settings": {                       // Configuration settings  
            "ragKnowledge": false,          // Enable RAG for knowledge (default: false)  
            "secrets": {},                  // API keys and sensitive data  
            "voice": {},                    // Voice configuration  
            "model": "string",              // Optional model override  
            "modelConfig": {}               // Optional model configuration  
        },  
        "bio": [],                         // Character background as a string or array of statements  
        "style": {                         // Interaction style guide  
            "all": [],                     // General style rules  
            "chat": [],                    // Chat-specific style  
            "post": []                     // Post-specific style  
        }  
    }  

### modelProvider

Supported providers:  
`openai`, `eternalai`, `anthropic`, `grok`, `groq`, `llama_cloud`, `together`, `llama_local`, `lmstudio`, `google`, `mistral`, `claude_vertex`, `redpill`, `openrouter`, `ollama`, `heurist`, `galadriel`, `falai`, `gaianet`, `ali_bailian`, `volengine`, `nanogpt`, `hyperbolic`, `venice`, `nvidia`, `nineteen_ai`, `akash_chat_api`, `livepeer`, `letzai`, `deepseek`, `infera`, `bedrock`, `atoma`.

See the full list of models in  .

### Client Types

Supported client integrations in `clients` array:

  * `discord`: Discord bot integration
  * `telegram`: Telegram bot
  * `twitter`: Twitter/X bot
  * `slack`: Slack integration
  * `direct`: Direct chat interface
  * `simsai`: SimsAI platform integration

### Plugins

See all the available plugins for Eliza here:  

### Settings Configuration

The `settings` object supports:

    {  
        "settings": {  
            "ragKnowledge": false,         // Enable RAG knowledge mode  
            "voice": {  
                "model": "string",         // Voice synthesis model  
                "url": "string"           // Optional voice API URL  
            },  
            "secrets": {                  // API keys (use env vars in production)  
                "API_KEY": "string"  
            },  
            "model": "string",           // Optional model override  
            "modelConfig": {             // Optional model parameters  
                "temperature": 0.7,  
                "maxInputTokens": 4096,  
                "maxOutputTokens": 1024,  
                "frequency_penalty": 0.0,  
                "presence_penalty": 0.0  
            },  
            "imageSettings": {          // Optional image generation settings  
                "steps": 20,  
                "width": 1024,  
                "height": 1024,  
                "cfgScale": 7.5,  
                "negativePrompt": "string"  
            }  
        }  
    }  

### Bio & Lore

  * Bio = Core identity, character biography
  * Lore = Character background lore elements

    {  
        "bio": [  
            "Expert in blockchain development",  
            "Specializes in DeFi protocols"  
        ],  
        "lore": [  
            "Created first DeFi protocol in 2020",  
            "Helped launch multiple DAOs"  
        ]  
    }  

Bio & Lore Tips

  * Mix factual and personality-defining information
  * Include both historical and current details
  * Break bio and lore into smaller chunks
    * This creates more natural, varied responses
    * Prevents repetitive or predictable behavior

### Style Guidelines

Define interaction patterns:

    {  
        "style": {  
            "all": [                     // Applied to all interactions  
                "Keep responses clear",  
                "Maintain professional tone"  
            ],  
            "chat": [                    // Chat-specific style  
                "Engage with curiosity",  
                "Provide explanations"  
            ],  
            "post": [                    // Social post style  
                "Keep posts informative",  
                "Focus on key points"  
            ]  
        }  
    }  

Style Tips

  * Be specific about tone and mannerisms
  * Include platform-specific guidance
  * Define clear boundaries and limitations

### Optional but Recommended Fields

    {  
        "username": "handle",              // Character's username/handle  
        "system": "System prompt text",    // Custom system prompt  
        "lore": [],                       // Additional background/history  
        "knowledge": [                     // Knowledge base entries  
            "Direct string knowledge",  
            { "path": "file/path.md", "shared": false },  
            { "directory": "knowledge/path", "shared": false }  
        ],  
        "messageExamples": [],           // Example conversations  
        "postExamples": [],             // Example social posts  
        "topics": [],                  // Areas of expertise  
        "adjectives": []              // Character traits  
    }  

* * *

#### Topics

  * List of subjects the character is interested in or knowledgeable about
  * Used to guide conversations and generate relevant content
  * Helps maintain character consistency

#### Adjectives

  * Words that describe the character's traits and personality
  * Used for generating responses with a consistent tone
  * Can be used in "Mad Libs" style content generation

* * *

## Knowledge Management

The character system supports two knowledge modes:

### Classic Mode (Default)

  * Direct string knowledge added to character's context
  * No chunking or semantic search
  * Enabled by default (`settings.ragKnowledge: false`)
  * Only processes string knowledge entries
  * Simpler but less sophisticated

### RAG Mode

  * Advanced knowledge processing with semantic search
  * Chunks content and uses embeddings
  * Must be explicitly enabled (`settings.ragKnowledge: true`)
  * Supports three knowledge types:
    1. Direct string knowledge
    2. Single file references: `{ "path": "path/to/file.md", "shared": false }`
    3. Directory references: `{ "directory": "knowledge/dir", "shared": false }`
  * Supported file types: .md, .txt, .pdf
  * Optional `shared` flag for knowledge reuse across characters

### Knowledge Path Configuration

  * Knowledge files are relative to the `characters/knowledge` directory
  * Paths should not contain `../` (sanitized for security)
  * Both shared and private knowledge supported
  * Files automatically reloaded if content changes

Knowledge Tips

  * Focus on relevant information
  * Organize in digestible chunks
  * Update regularly to maintain relevance

Use the provided tools to convert documents into knowledge:

  *  
  *  
  *  

Example:

    npx folder2knowledge <path/to/folder>  
    npx knowledge2character <character-file> <knowledge-file>  

* * *

## Character Definition Components

## Example Character File:

    {  
        "name": "Tech Helper",  
        "modelProvider": "anthropic",  
        "clients": ["discord"],  
        "plugins": [],  
        "settings": {  
            "ragKnowledge": true,  
            "voice": {  
                "model": "en_US-male-medium"  
            }  
        },  
        "bio": [  
            "Friendly technical assistant",  
            "Specializes in explaining complex topics simply"  
        ],  
        "lore": [  
            "Pioneer in open-source AI development",  
            "Advocate for AI accessibility"  
        ],  
        "messageExamples": [  
            [  
                {  
                    "user": "{{user1}}",  
                    "content": { "text": "Can you explain how AI models work?" }  
                },  
                {  
                    "user": "TechAI",  
                    "content": {  
                        "text": "Think of AI models like pattern recognition systems."  
                    }  
                }  
            ]  
        ],  
        "postExamples": [  
            "Understanding AI doesn't require a PhD - let's break it down simply",  
            "The best AI solutions focus on real human needs"  
        ],  
        "topics": [  
            "artificial intelligence",  
            "machine learning",  
            "technology education"  
        ],  
        "knowledge": [  
            {  
                "directory": "tech_guides",  
                "shared": true  
            }  
        ],  
        "adjectives": ["knowledgeable", "approachable", "practical"],  
        "style": {  
            "all": ["Clear", "Patient", "Educational"],  
            "chat": ["Interactive", "Supportive"],  
            "post": ["Concise", "Informative"]  
        }  
    }  

 

Last updated on Feb 26, 2025 by jin

  

  *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  
    *  
    *  
    *  
  *  
  *  

Docs

  *  

Community

  *  
  *  

More

  *  


<!-- Source: https://elizaos.github.io/eliza/docs/core/clients/ -->
Clients | eliza (https://elizaos.github.io/eliza/docs/core/clients/)
  
URL: https://elizaos.github.io/eliza/docs/core/clients/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Clients 

On this page

#  Clients

Clients are core components in Eliza that enable AI agents to interact with external platforms and services. Each client provides a specialized interface for communication while maintaining consistent agent behavior across different platforms.

* * *

## Supported Clients

Client Type Key Features Use Cases  
 Communication• Voice channels • Server management • Moderation tools • Channel management• Community management • Gaming servers • Event coordination  
 Social Media• Post scheduling • Timeline monitoring • Engagement analytics • Content automation• Brand management • Content creation • Social engagement  
 Messaging• Bot API • Group chat • Media handling • Command system• Customer support • Community engagement • Broadcast messaging  
 API• REST endpoints • Web integration • Custom applications • Real-time communication• Backend integration • Web apps • Custom interfaces  
 Development• Repository management • Issue tracking • Pull requests • Code review• Development workflow • Project management • Team collaboration  
 Enterprise• Channel management • Conversation analysis • Workspace tools • Integration hooks• Team collaboration • Process automation • Internal tools  
 Web3• Decentralized networking • Content publishing • Memory management • Web3 integration• Web3 social networking • Content distribution • Decentralized apps  
 Web3• Decentralized social • Content publishing • Community engagement• Web3 communities • Content creation • Social networking  
 Automation• Workload management • Task scheduling • Process automation• Background jobs • Automated tasks • System maintenance  

*Additional clients:

  * Instagram: Social media content and engagement
  * XMTP: Web3 messaging and communications
  * Alexa: Voice interface and smart device control
  * Home Assistant: Home automation OS
  * Devai.me: AI first social client
  * Simsai: Jeeter / Social media platform for AI

* * *

## System Overview

Clients serve as bridges between Eliza agents and various platforms, providing core capabilities:

  1. Message Processing

     * Platform-specific message formatting and delivery
     * Media handling and attachments via   objects
     * Reply threading and context management
     * Support for different content types
  2. State & Memory Management

     * Each client maintains independent state to prevent cross-platform contamination
     * Integrates with runtime memory managers for different types of content:
     * Messages processed by one client don't automatically appear in other clients' contexts
     *   persists across agent restarts through the database adapter
  3. Platform Integration

     * Authentication and API compliance
     * Event processing and webhooks
     * Rate limiting and cache management
     * Platform-specific feature support

## Client Configuration

Clients are configured through the   configuration's   property:

    export type Character = {  
        // ... other properties ...  
        clientConfig?: {  
            discord?: {  
                shouldIgnoreBotMessages?: boolean;  
                shouldIgnoreDirectMessages?: boolean;  
                shouldRespondOnlyToMentions?: boolean;  
                messageSimilarityThreshold?: number;  
                isPartOfTeam?: boolean;  
                teamAgentIds?: string[];  
                teamLeaderId?: string;  
                teamMemberInterestKeywords?: string[];  
                allowedChannelIds?: string[];  
                autoPost?: {  
                    enabled?: boolean;  
                    monitorTime?: number;  
                    inactivityThreshold?: number;  
                    mainChannelId?: string;  
                    announcementChannelIds?: string[];  
                    minTimeBetweenPosts?: number;  
                };  
            };  
            telegram?: {  
                shouldIgnoreBotMessages?: boolean;  
                shouldIgnoreDirectMessages?: boolean;  
                shouldRespondOnlyToMentions?: boolean;  
                shouldOnlyJoinInAllowedGroups?: boolean;  
                allowedGroupIds?: string[];  
                messageSimilarityThreshold?: number;  
                // ... other telegram-specific settings  
            };  
            slack?: {  
                shouldIgnoreBotMessages?: boolean;  
                shouldIgnoreDirectMessages?: boolean;  
            };  
            // ... other client configs  
        };  
    };  

## Client Implementation

Each client manages its own:

  * Platform-specific message formatting and delivery
  * Event processing and webhooks
  * Authentication and API integration
  * Message queueing and rate limiting
  * Media handling and attachments
  * State management and persistence

Example of a basic client implementation:

    import { Client, IAgentRuntime, ClientInstance } from "@elizaos/core";  

    export class CustomClient implements Client {  
        name = "custom";  

        async start(runtime: IAgentRuntime): Promise<ClientInstance> {  
            // Initialize platform connection  
            // Set up event handlers  
            // Configure message processing  

            return {  
                stop: async () => {  
                    // Cleanup resources  
                    // Close connections  
                }  
            };  
        }  
    }  

### Runtime Integration

Clients interact with the agent runtime through the   interface, which provides:

  * Memory managers for different types of data storage
  * Service access for capabilities like transcription or image generation
  * State management and composition
  * Message processing and action handling

### Memory System Integration

Clients use the runtime's memory managers to persist conversation data (source:  ).

  * `messageManager` Chat messages
  * `documentsManager` File attachments
  * `descriptionManager` Media descriptions

See example

    // Store a new message   
    await runtime.messageManager.createMemory({  
        id: messageId,  
        content: { text: message.content },  
        userId: userId,  
        roomId: roomId,  
        agentId: runtime.agentId  
    });  

    // Retrieve recent messages   
    const recentMessages = await runtime.messageManager.getMemories({  
        roomId: roomId,  
        count: 10  
    });  

* * *

## Direct Client Example

The   provides message processing, webhook integration, and a REST API interface for Eliza agents. It's the primary client used for testing and development.

Key features of the Direct client:

  * Express.js server for HTTP endpoints
  * Agent runtime management
  * File upload handling
  * Memory system integration
  * WebSocket support for real-time communication

### Direct Client API Endpoints

Endpoint Method Description Params Input Response  
`/:agentId/whisper `POST Audio transcription (Whisper)`agentId `Audio file Transcription  
`/:agentId/message `POST Main message handler `agentId `Text, optional file Agent response  
`/agents/:agentIdOrName/hyperfi/v1 `POST Hyperfi game integration `agentIdOrName `Objects, emotes, history JSON (`lookAt`, `emote`, `say`, actions)  
`/:agentId/image `POST Image generation `agentId `Generation params Image(s) with captions  
`/fine-tune `POST Proxy for BagelDB fine-tuning None Fine-tuning data BagelDB API response  
`/fine-tune/:assetId `GET Download fine-tuned assets `assetId `None File download  
`/:agentId/speak `POST Text-to-speech (ElevenLabs)`agentId `Text Audio stream  
`/:agentId/tts `POST Direct text-to-speech `agentId `Text Audio stream  

### Static Routes

Endpoint Method Description  
`/media/uploads/`GET Serves uploaded files  
`/media/generated/`GET Serves generated images  

### Common Parameters

Most endpoints accept:

  * `roomId` (defaults to agent-specific room)
  * `userId` (defaults to `"user"`)
  * `userName` (for identity management)

* * *

## FAQ

### What can clients actually do?

Clients handle platform-specific communication (like Discord messages or Twitter posts), manage memories and state, and execute actions like processing media or handling commands. Each client adapts these capabilities to its platform while maintaining consistent agent behavior.

### Can multiple clients be used simultaneously?

Yes, Eliza supports running multiple clients concurrently while maintaining consistent agent behavior across platforms.

### How are client-specific features handled?

Each client implements platform-specific features through its capabilities system, while maintaining a consistent interface for the agent.

### How co clients handle rate limits?

Clients implement platform-specific rate limiting with backoff strategies and queue management.

### How is client state managed?

Clients maintain their own connection state while integrating with the agent's runtime database adapter and memory / state management system.

### How do clients handle messages?

Clients translate platform messages into Eliza's internal format, process any attachments (images, audio, etc.), maintain conversation context, and manage response queuing and rate limits.

### How are messages processed across clients?

Each client processes messages independently in its platform-specific format, while maintaining conversation context through the shared memory system. V2 improves upon this architecture.

### How is state managed between clients?

Each client maintains separate state to prevent cross-contamination, but can access shared agent state through the runtime.

### How do clients integrate with platforms?

Each client implements platform-specific authentication, API compliance, webhook handling, and follows the platform's rules for rate limiting and content formatting.

### How do clients manage memory?

Clients use Eliza's memory system to track conversations, user relationships, and state, enabling context-aware responses and persistent interactions across sessions.

 

Last updated on Feb 26, 2025 by jin

  

  *  
  *  
  *  
  *  
    *  
    *  
  *  
    *  
    *  
    *  
  *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  

Docs

  *  

Community

  *  
  *  

More

  *  


<!-- Source: https://elizaos.github.io/eliza/docs/core/agents/ -->
Agent Runtime | eliza (https://elizaos.github.io/eliza/docs/core/agents/)
  
URL: https://elizaos.github.io/eliza/docs/core/agents/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Agent Runtime 

On this page

#  Agent Runtime

The `AgentRuntime` is the core runtime environment for Eliza agents. It handles message processing, state management, plugin integration, and interaction with external services. You can think of it as the brains that provide the high-level orchestration layer for Eliza agents.

 

The runtime follows this general flow:

  1. Agent loads character config, plugins, and services
     * Processes knowledge sources (e.g., documents, directories)
  2. Receives a message, composes the state
  3. Processes actions and then evaluates
     * Retrieves relevant knowledge fragments using RAG
  4. Generates and executes responses, then evaluates
  5. Updates memory and state

* * *

## Overview

The   class is the primary implementation of the   interface, which manages the agent's core functions, including:

Component Description API Reference Related Files   
Clients Supports multiple communication platforms for seamless interaction.  ,  ,  ,  ,  ,  ,  ,  ,    
State Maintains context for coherent cross-platform interactions, updates dynamically. Also tracks goals, knowledge, and recent interactions    
Plugins Dynamic extensions of agent functionalities using custom actions, evaluators, providers, and adapters  ,  ,  ,    
Services Connects with external services for `IMAGE_DESCRIPTION`, `TRANSCRIPTION`, `TEXT_GENERATION`, `SPEECH_GENERATION`, `VIDEO`, `PDF`, `BROWSER`, `WEB_SEARCH`, `EMAIL_AUTOMATION`, and more    
Memory Systems Creates, retrieves, and embeds memories and manages conversation history.    
Database Adapters Persistent storage and retrieval for memories and knowledge  ,  ,  ,  ,  ,  ,    
Cache Management Provides flexible storage and retrieval via various caching methods.    
Advanced: IAgentRuntime Interface 

    interface IAgentRuntime {  
        // Core identification  
        agentId: UUID;  
        token: string;  
        serverUrl: string;  

        // Configuration  
        character: Character;                          // Personality and behavior settings  
        modelProvider: ModelProviderName;              // AI model to use  
        imageModelProvider: ModelProviderName;  
        imageVisionModelProvider: ModelProviderName;  

        // Components  
        plugins: Plugin[];                             // Additional capabilities  
        clients: Record<string, Client>;               // Platform connections  
        providers: Provider[];                         // Real-time data sources  
        actions: Action[];                             // Available behaviors  
        evaluators: Evaluator[];                       // Analysis & learning  

        // Memory Management  
        messageManager: IMemoryManager;                // Conversation history  
        descriptionManager: IMemoryManager;  
        documentsManager: IMemoryManager;              // Large documents  
        knowledgeManager: IMemoryManager;              // Search & retrieval  
        ragKnowledgeManager: IRAGKnowledgeManager;     // RAG integration  
        loreManager: IMemoryManager;                   // Character background  

        // Storage & Caching  
        databaseAdapter: IDatabaseAdapter;            // Data persistence  
        cacheManager: ICacheManager;                  // Performance optimization  

        // Services  
        services: Map<ServiceType, Service>;          // External integrations  

        // Networking  
        fetch: (url: string, options: any) => Promise<Response>;  
    }  

Source:  

* * *

### Key Methods

  * `initialize()`: Sets up the agent's runtime environment, including services, plugins, and knowledge processing.
  * `processActions()`: Executes actions based on message content and state.
  * `evaluate()`: Assesses messages and state using registered evaluators.
  * `composeState()`: Constructs the agent's state object for response generation.
  * `updateRecentMessageState()`: Updates the state with recent messages and attachments.
  * `registerService()`: Adds a service to the runtime.
  * `registerMemoryManager()`: Registers a memory manager for specific types of memories.
  * `ensureRoomExists()` / `ensureUserExists()`: Ensures the existence of rooms and users in the database.

WIP

* * *

## Service System

Services provide specialized functionality with standardized interfaces that can be accessed cross-platform:

See Example

    // Speech Generation   
    const speechService = runtime.getService<ISpeechService>(  
        ServiceType.SPEECH_GENERATION  
    );  
    const audioStream = await speechService.generate(runtime, text);  

    // PDF Processing   
    const pdfService = runtime.getService<IPdfService>(ServiceType.PDF);  
    const textContent = await pdfService.convertPdfToText(pdfBuffer);  

* * *

## State Management

The runtime maintains comprehensive state through the State interface:

    interface State {  
        // Core identifiers  
        userId?: UUID;  
        agentId?: UUID;  
        roomId: UUID;  

        // Character information  
        bio: string;  
        lore: string;  
        messageDirections: string;  
        postDirections: string;  

        // Conversation context  
        actors: string;  
        actorsData?: Actor[];  
        recentMessages: string;  
        recentMessagesData: Memory[];  

        // Goals and knowledge  
        goals?: string;  
        goalsData?: Goal[];  
        knowledge?: string;  
        knowledgeData?: KnowledgeItem[];  
        ragKnowledgeData?: RAGKnowledgeItem[];  
    }  

    // State management methods   
    async function manageState() {  
        // Initial state composition  
        const state = await runtime.composeState(message, {  
            additionalContext: "custom context"  
        });  

        // Update state with new messages  
        const updatedState = await runtime.updateRecentMessageState(state);  
    }  

* * *

## Plugin System

Plugins extend agent functionality through a modular interface. The runtime supports various types of plugins including clients, services, adapters, and more:

    interface Plugin {  
        name: string;  
        description: string;  
        actions?: Action[];        // Custom behaviors  
        providers?: Provider[];    // Data providers  
        evaluators?: Evaluator[]; // Response assessment  
        services?: Service[];     // Background processes  
        clients?: Client[];       // Platform integrations  
        adapters?: Adapter[];    // Database/cache adapters  
    }  

Plugins can be configured through   settings:

    {  
      "name": "MyAgent",  
      "plugins": [  
        "@elizaos/plugin-solana",  
        "@elizaos/plugin-twitter"  
      ]  
    }  

For detailed information about plugin development and usage, see the  .

* * *

## Running Multiple Agents

To run multiple agents:

    pnpm start --characters="characters/agent1.json,characters/agent2.json"  

Or use environment variables:

    REMOTE_CHARACTER_URLS=https://example.com/characters.json  

* * *

## FAQ

### What's the difference between an agent and a character?

A character defines personality and knowledge, while an agent provides the runtime environment and capabilities to bring that character to life.

### How do I choose the right database adapter?

Choose based on your needs:

  * MongoDB: For scalable, document-based storage
  * PostgreSQL: For relational data with complex queries
  * SQLite: For simple, file-based storage
  * Qdrant: For vector search capabilities

### How do I implement custom plugins?

Create a plugin that follows the plugin interface and register it with the runtime. See the plugin documentation for detailed examples.

### Do agents share memory across platforms?

By default, agents maintain separate memory contexts for different platforms to avoid mixing conversations. Use the memory management system and database adapters to persist and retrieve state information.

### How do I handle multiple authentication methods?

Use the character configuration to specify different authentication methods for different services. The runtime will handle the appropriate authentication flow.

### How do I manage environment variables?

Use a combination of:

  * `.env` files for local development
  * Character-specific settings for per-agent configuration
  * Environment variables for production deployment

### Can agents communicate with each other?

Yes, through the message system and shared memory spaces when configured appropriately.

 

Last updated on Feb 26, 2025 by Woolfgm

  


<!-- Source: https://elizaos.github.io/eliza/docs/core/plugins/ -->
ElizaOS Plugins | eliza (https://elizaos.github.io/eliza/docs/core/plugins/)
  
URL: https://elizaos.github.io/eliza/docs/core/plugins/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Plugins 

On this page 

# ElizaOS Plugins

ElizaOS plugins are modular extensions that enhance the capabilities of ElizaOS agents. They provide a flexible way to add new functionality, integrate external services, and customize agent behavior across different platforms.

## Overview

Plugins in ElizaOS can provide various components:

  * Actions: Custom behaviors and responses
  * Providers: Data sources and context providers
  * Evaluators: Analysis and learning systems
  * Services: Background processes and integrations
  * Clients: Platform-specific communication interfaces
  * Adapters: Database and storage implementations

## Using Plugins

### Installation

  1. Add the plugin to your project's dependencies:

    {  
      "dependencies": {  
        "@elizaos/plugin-example": "github:elizaos-plugins/plugin-example"  
      }  
    }  

  2. Configure the plugin in your character file:

    {  
      "name": "MyAgent",  
      "plugins": [  
        "@elizaos/plugin-example"  
      ],  
      "settings": {  
        "example-plugin": {  
          // Plugin-specific configuration  
        }  
      }  
    }  

### Available Plugins

ElizaOS maintains an official plugin registry at  . Some key categories include:

#### Database Adapters

  * `@elizaos-plugins/adapter-mongodb`: MongoDB integration
  * `@elizaos-plugins/adapter-postgres`: PostgreSQL with vector support
  * `@elizaos-plugins/adapter-sqlite`: Lightweight SQLite storage
  * `@elizaos-plugins/adapter-qdrant`: Vector-focused storage
  * `@elizaos-plugins/adapter-supabase`: Cloud-hosted vector database

#### Platform Clients

  * `@elizaos-plugins/client-discord`: Discord bot integration
  * `@elizaos-plugins/client-twitter`: Twitter/X integration
  * `@elizaos-plugins/client-telegram`: Telegram messaging
  * `@elizaos-plugins/client-slack`: Slack workspace integration
  * `@elizaos-plugins/client-farcaster`: Web3 social networking

#### Utility Plugins

  * `@elizaos-plugins/plugin-browser`: Web scraping capabilities
  * `@elizaos-plugins/plugin-pdf`: PDF processing
  * `@elizaos-plugins/plugin-image`: Image analysis and generation
  * `@elizaos-plugins/plugin-video`: Video processing
  * `@elizaos-plugins/plugin-llama`: Local LLaMA model integration

## Creating Plugins

### Project Structure

    plugin-name/  
    ├── package.json  
    ├── tsconfig.json  
    ├── src/  
    │   ├── index.ts        # Main plugin entry  
    │   ├── actions/        # Custom actions  
    │   ├── providers/      # Data providers  
    │   ├── types.ts        # Type definitions  
    │   └── environment.ts  # Configuration  
    ├── README.md  
    └── LICENSE  

### Basic Plugin Implementation

    import { Plugin, Action, Provider } from "@elizaos/core";  

    const exampleAction: Action = {  
        name: "EXAMPLE_ACTION",  
        similes: ["ALTERNATE_NAME"],  
        description: "Description of what this action does",  
        validate: async (runtime, message) => {  
            // Validation logic  
            return true;  
        },  
        handler: async (runtime, message) => {  
            // Implementation logic  
            return true;  
        }  
    };  

    const exampleProvider: Provider = {  
        get: async (runtime, message) => {  
            // Provider implementation  
            return "Context string";  
        }  
    };  

    export const examplePlugin: Plugin = {  
        name: "example-plugin",  
        description: "Plugin description",  
        actions: [exampleAction],  
        providers: [exampleProvider]  
    };  

### Package Configuration

Your `package.json` must include:

    {  
      "name": "@elizaos/plugin-example",  
      "version": "1.0.0",  
      "agentConfig": {  
        "pluginType": "elizaos:plugin:1.0.0",  
        "pluginParameters": {  
          "API_KEY": {  
            "type": "string",  
            "description": "API key for the service"  
          }  
        }  
      }  
    }  

## Best Practices

  1. Minimal Dependencies

     * Only include necessary dependencies
     * Use peer dependencies when possible
     * Document all required dependencies
  2. Error Handling

     * Validate configuration before use
     * Provide meaningful error messages
     * Implement proper error recovery
  3. Type Safety

     * Use TypeScript throughout
     * Define clear interfaces
     * Document type constraints
  4. Documentation

     * Include clear README
     * Document all configuration options
     * Provide usage examples
  5. Testing

     * Include unit tests
     * Provide integration tests
     * Document testing procedures

## FAQ

### What exactly is a plugin in ElizaOS?

A plugin is a modular extension that adds new capabilities to ElizaOS agents, such as API integrations, custom actions, or platform connections. Plugins allow you to expand agent functionality and share reusable components with other developers.

### When should I create a plugin versus using existing ones?

Create a plugin when you need custom functionality not available in existing plugins, want to integrate with external services, or plan to share reusable agent capabilities with the community.

### What are the main types of plugin components?

Actions handle specific tasks, Providers supply data, Evaluators analyze responses, Services run background processes, Clients manage platform connections, and Adapters handle storage solutions.

### How do I test a plugin during development?

Use the mock client with `pnpm mock-eliza --characters=./characters/test.character.json` for rapid testing, then progress to platform-specific testing like web interface or Twitter integration.

### Why isn't my plugin being recognized?

Most commonly this occurs due to missing dependencies, incorrect registration in your character file, or build configuration issues. Ensure you've run `pnpm build` and properly imported the plugin.

### Can I monetize my plugin?

Yes, plugins can be monetized through the ElizaOS marketplace or by offering premium features/API access, making them an effective distribution mechanism for software products.

### How do I debug plugin issues?

Enable debug logging, use the mock client for isolated testing, and check the runtime logs for detailed error messages about plugin initialization and execution.

### What's the difference between Actions and Services?

Actions handle specific agent responses or behaviors, while Services provide ongoing background functionality or external API integrations that multiple actions might use.

## Additional Resources

  *  
  *  

 

Last updated on Feb 26, 2025 by jin

  


<!-- Source: https://elizaos.github.io/eliza/docs/core/providers/ -->
Providers | eliza (https://elizaos.github.io/eliza/docs/core/providers/)
  
URL: https://elizaos.github.io/eliza/docs/core/providers/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Providers 

On this page

#  Providers

  are the sources of information for the agent. They provide data or state while acting as the agent's "senses", injecting real-time information into the agent's context. They serve as the eyes, ears, and other sensory inputs that allow the agent to perceive and interact with its environment, like a bridge between the agent and various external systems such as market data, wallet information, sentiment analysis, and temporal context. Anything that the agent knows is either coming from like the built-in context or from a provider. For more info, see the  .

Here's an example of how providers work within ElizaOS:

  * A news provider could fetch and format news.
  * A computer terminal provider in a game could feed the agent information when the player is near a terminal.
  * A wallet provider can provide the agent with the current assets in a wallet.
  * A time provider injects the current date and time into the context.

* * *

## Overview

A provider's primary purpose is to supply dynamic contextual information that integrates with the agent's runtime. They format information for conversation templates and maintain consistent data access. For example:

  * Function: Providers run during or before an action is executed.
  * Purpose: They allow for fetching information from other APIs or services to provide different context or ways for an action to be performed.
  * Example: Before a "Mars rover action" is executed, a provider could fetch information from another API. This fetched information can then be used to enrich the context of the Mars rover action.

The provider interface is defined in  :

    interface Provider {  
        get: (  
            runtime: IAgentRuntime, // Which agent is calling the provider  
            message: Memory,        // Last message received   
            state?: State          // Current conversation state  
        ) => Promise<string>;      // Returns info to inject into context  
    }  

The `get` function takes:

  * `runtime`: The agent instance calling the provider
  * `message`: The last message received
  * `state`: Current conversation state (optional)

It returns a string that gets injected into the agent's context. The function can return null if there is no reason to validate.

* * *

## Examples

ElizaOS providers typically fall into these categories, with examples from the ecosystem:

### System & Integration

  * Time Provider: Injects current date/time for temporal awareness
  * Giphy Provider: Provides GIF responses using Giphy API
  * GitBook Provider: Supplies documentation context from GitBook
  * Topics Provider: Caches and serves Allora Network topic information

### Blockchain & DeFi

  * Wallet Provider: Portfolio data from Zerion, balances and prices
  * DePIN Provider: Network metrics via DePINScan API
  * Chain Providers: Data from Abstract, Fuel, ICP, EVM networks
  * Market Provider: Token data from DexScreener, Birdeye APIs

### Knowledge & Data

  * DKG Provider: OriginTrail decentralized knowledge integration
  * News Provider: Current events via NewsAPI
  * Trust Provider: Calculates and injects trust scores

Visit the   for a complete list of available plugins and providers.

### Time Provider

 

Provides temporal awareness by injecting current date/time information:

    const timeProvider: Provider = {  
        get: async (_runtime: IAgentRuntime, _message: Memory) => {  
            const currentDate = new Date();  
            const options = {  
                timeZone: "UTC",  
                dateStyle: "full" as const,  
                timeStyle: "long" as const  
            };  
            const humanReadable = new Intl.DateTimeFormat("en-US", options)  
                .format(currentDate);  
            return `The current date and time is ${humanReadable}. Please use this as your reference for any time-based operations or responses.`;  
        }  
    };  

### Facts Provider

 

Manages and serves conversation facts and knowledge:

    const factsProvider: Provider = {  
        get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {  
            // Get recent messages  
            const recentMessagesData = state?.recentMessagesData?.slice(-10);  
            const recentMessages = formatMessages({  
                messages: recentMessagesData,  
                actors: state?.actorsData  
            });  

            // Generate embedding for semantic search  
            const embedding = await embed(runtime, recentMessages);  

            const memoryManager = new MemoryManager({  
                runtime,  
                tableName: "facts"  
            });  

            // Retrieve relevant facts  
            const facts = await memoryManager.getMemories({  
                roomId: message.roomId,  
                count: 10,  
                agentId: runtime.agentId  
            });  

            if (facts.length === 0) return "";  

            const formattedFacts = formatFacts(facts);  
            return `Key facts that ${runtime.character.name} knows:\n${formattedFacts}`;  
        }  
    };  

### Boredom Provider

 

Manages conversation dynamics and engagement by calculating a "boredom score". The provider helps agents maintain appropriate conversation engagement levels by analyzing recent messages (last 15 minutes) and tracking conversational dynamics through keywords and pattern detection that then generates status messages reflecting interaction quality.

#### Scoring Mechanisms

Increases Boredom:

  * Excessive punctuation
  * Negative or dismissive language
  * Repetitive conversation patterns

Decreases Boredom:

  * Substantive discussion topics
  * Engaging questions
  * Research-related keywords

    // Sample scoring logic   
    if (interestWords.some((word) => messageText.includes(word))) {  
        boredomScore -= 1;  
    }  

* * *

## FAQ

### What's a good caching strategy for providers?

Cache expensive operations with an appropriate TTL based on data freshness requirements - for example, the Topics Provider uses 30-minute caching.

### How should providers handle missing data?

Return an empty string for missing or invalid data rather than null or undefined.

### What's the best way to format provider output?

Keep context strings concise and consistently formatted, using clear templates when possible.

### When should I use a provider vs a service?

Use a provider when you need to inject information into the agent's context, and a service when the functionality doesn't need to be part of the conversation.

### Can providers access service functionality?

Yes, providers can use services through the runtime. For example, a wallet provider might use a blockchain service to fetch data.

### How should providers handle failures?

Providers should handle failures gracefully and return an empty string or implement retries for external API calls. Never throw errors that would break the agent's context composition.

### Can providers maintain state?

While providers can maintain internal state, it's better to use the runtime's state management facilities for persistence.

* * *

## Further Reading

  *  
  *  
  *  

 

Last updated on Feb 18, 2025 by jin

  


<!-- Source: https://elizaos.github.io/eliza/docs/core/actions/ -->
⚡ Actions | eliza (https://elizaos.github.io/eliza/docs/core/actions/)
  
URL: https://elizaos.github.io/eliza/docs/core/actions/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Actions 

On this page

# ⚡ Actions

Actions define how agents respond to and interact with messages. They enable agents to perform tasks beyond simple message responses by integrating with external systems and modifying behavior.

## Overview

  1. Structure:

An Action consists of:

  * `name`: Unique identifier
  * `similes`: Alternative names/triggers
  * `description`: Purpose and usage explanation
  * `validate`: Function to check if action is appropriate
  * `handler`: Core implementation logic
  * `examples`: Sample usage patterns
  * `suppressInitialMessage`: Optional flag to suppress initial response

  2. Validation:

  * Checks if the action can be executed
  * Consider conversation state
  * Validate required

* * *

## Implementation

    interface Action {  
        name: string;  
        similes: string[];  
        description: string;  
        examples: ActionExample[][];  
        handler: Handler;  
        validate: Validator;  
        suppressInitialMessage?: boolean;  
    }  

Source:  

### Basic Action Template

    const customAction: Action = {  
        name: "CUSTOM_ACTION",  
        similes: ["ALTERNATE_NAME", "OTHER_TRIGGER"],  
        description: "Detailed description of when and how to use this action",  
        validate: async (runtime: IAgentRuntime, message: Memory) => {  
            // Validation logic  
            return true;  
        },  
        handler: async (runtime: IAgentRuntime, message: Memory) => {  
            // Implementation logic  
            return true;  
        },  
        examples: [  
            [  
                {  
                    user: "{{user1}}",  
                    content: { text: "Trigger message" },  
                },  
                {  
                    user: "{{user2}}",  
                    content: { text: "Response", action: "CUSTOM_ACTION" },  
                },  
            ],  
        ],  
    };  

#### Character File Example

Actions can be used in character files as well. Here's an example from:  

        "messageExamples": [  
            [  
                {  
                    "user": "{{user1}}",  
                    "content": {  
                        "text": "Can you help transfer some SOL?"  
                    }  
                },  
                {  
                    "user": "SBF",  
                    "content": {  
                        "text": "yeah yeah for sure, sending SOL is pretty straightforward. just need the recipient and amount. everything else is basically fine, trust me.",  
                        "action": "SEND_SOL"  
                    }  
                }  
            ],  

* * *

## Example Implementations

Actions can be found across various plugins in the Eliza ecosystem, with a comprehensive collection available at  . Here are some notable examples:

### Blockchain and Token Actions

  * Transfers: `SEND_TOKEN`, `SEND_SOL`, `SEND_NEAR`, `SEND_AVAIL`, `SEND_TON`, `SEND_TOKENS`, `COSMOS_TRANSFER`, `CROSS_CHAIN_TRANSFER`
  * Token Management: `CREATE_TOKEN`, `GET_TOKEN_INFO`, `GET_BALANCE`, `GET_TOKEN_PRICE`, `TOKEN_SWAP`, `SWAP_TOKEN`, `EXECUTE_SPOT_TRADE`
  * Blockchain Interactions: `READ_CONTRACT`, `WRITE_CONTRACT`, `DEPLOY_CONTRACT`, `DEPLOY_TOKEN`, `GET_TRANSACTION`, `GET_CURRENT_NONCE`, `GET_CONTRACT_SCHEMA`

### Cryptographic and Security Actions

  * Signature and Authentication: `ECDSA_SIGN`, `LIT_ACTION`, `REMOTE_ATTESTATION`, `AUTHENTICATE`
  * Wallet and Key Management: `ERC20_TRANSFER`, `WALLET_TRANSFER`, `BRIDGE_OPERATIONS`

### Staking and Governance

  * Staking Actions: `STAKE`, `DELEGATE_TOKEN`, `UNDELEGATE_TOKEN`, `GET_STAKE_BALANCE`, `TOKENS_REDELEGATE`
  * Governance Actions: `VOTE_ON_PROPOSAL`, `PROPOSE`, `EXECUTE_PROPOSAL`, `QUEUE_PROPOSAL`

### AI and Agent Management

  * Agent Creation: `LAUNCH_AGENT`, `START_SESSION`, `CREATE_AND_REGISTER_AGENT`
  * AI-Specific Actions: `GENERATE_IMAGE`, `DESCRIBE_IMAGE`, `GENERATE_VIDEO`, `GENERATE_MUSIC`, `GET_INFERENCE`, `GENERATE_MEME`

### Media and Content Generation

  * Image and Multimedia: `SEND_GIF`, `GENERATE_3D`, `GENERATE_COLLECTION`, `MINT_NFT`, `LIST_NFT`, `SWEEP_FLOOR_NFT`
  * Audio and Voice: `EXTEND_AUDIO`, `CREATE_TTS`

### Decentralized Infrastructure (DePIN)

  * Project Interactions: `DEPIN_TOKENS`, `DEPIN_ON_CHAIN`, `ANALYZE_DEPIN_PROJECTS`

### Search and Information Retrieval

  * Data Search: `WEB_SEARCH`, `GET_TOKEN_PRICE_BY_ADDRESS`, `GET_TRENDING_POOLS`, `GET_NEW_COINS`, `GET_MARKETS`

### Blockchain and Trading

  * Specialized Actions: `GET_QUOTE_0X`, `EXECUTE_SWAP_0X`, `CANCEL_ORDERS`, `GET_INDICATIVE_PRICE`

### Social and Communication

  * Platform Interactions: `TWEET`, `POST_TWEET`, `QUOTE`, `JOIN_VOICE`, `LEAVE_VOICE`, `TRANSCRIBE_MEDIA`, `SUMMARIZE_CONVERSATION`

### Utility Actions

  * General Utilities: `FAUCET`, `SUBMIT_DATA`, `PRICE_CHECK`, `WEATHER`, `NEWS`

Check out the   on GitHub if interested in studying or using any of these.

### Image Generation Action

Here's a comprehensive example of an image generation action:

    import { Action, IAgentRuntime, Memory, State } from "@elizaos/core";  

    // Example image generation action   
    const generateImageAction: Action = {  
        name: "GENERATE_IMAGE",   
        similes: ["CREATE_IMAGE", "MAKE_IMAGE", "DRAW"],  
        description: "Generates an image based on the user's description",  
        suppressInitialMessage: true, // Suppress initial response since we'll generate our own  

        // Validate if this action should be used  
        validate: async (runtime: IAgentRuntime, message: Memory) => {  
            const text = message.content.text.toLowerCase();  
            // Check if message contains image generation triggers  
            return (  
                text.includes("generate") ||  
                text.includes("create") ||  
                text.includes("draw") ||  
                text.includes("make an image")  
            );  
        },  

        // Handle the action execution  
        handler: async (runtime: IAgentRuntime, message: Memory, state?: State) => {  
            try {  
                // Get image service  
                const imageService = runtime.getService(ServiceType.IMAGE_GENERATION);  

                // Generate image  
                const imageUrl = await imageService.generateImage(message.content.text);  

                // Create response with generated image  
                await runtime.messageManager.createMemory({  
                    id: generateId(),  
                    content: {  
                        text: "Here's the image I generated:",  
                        attachments: [{  
                            type: "image",  
                            url: imageUrl  
                        }]  
                    },  
                    userId: runtime.agentId,  
                    roomId: message.roomId,  
                });  

                return true;  
            } catch (error) {  
                console.error("Image generation failed:", error);  
                return false;  
            }  
        },  

        // Example usage patterns  
        examples: [  
            [  
                {  
                    user: "{{user1}}",  
                    content: {   
                        text: "Can you generate an image of a sunset?"   
                    }  
                },  
                {  
                    user: "{{user2}}",  
                    content: {  
                        text: "I'll create that image for you",  
                        action: "GENERATE_IMAGE"  
                    }  
                }  
            ]  
        ]  
    };  

### Basic Conversation Actions

You can find these samples in the plugin-bootstrap package:  

#### CONTINUE

For continuing conversations:

    const continueAction: Action = {  
        name: "CONTINUE",  
        similes: ["ELABORATE", "GO_ON"],  
        description: "Continues the conversation when appropriate",  

        validate: async (runtime: IAgentRuntime, message: Memory) => {  
            // Check if message warrants continuation  
            const text = message.content.text.toLowerCase();  
            return (  
                text.includes("tell me more") ||  
                text.includes("what else") ||  
                text.includes("continue") ||  
                text.endsWith("?")  
            );  
        },  

        handler: async (runtime: IAgentRuntime, message: Memory, state?: State) => {  
            // Get recent conversation context  
            const recentMessages = await runtime.messageManager.getMemories({  
                roomId: message.roomId,  
                count: 5  
            });  

            // Generate contextual response  
            const response = await runtime.generateResponse(  
                message,  
                recentMessages,  
                state  
            );  

            // Store response  
            await runtime.messageManager.createMemory({  
                id: generateId(),  
                content: response,  
                userId: runtime.agentId,  
                roomId: message.roomId  
            });  

            return true;  
        },  

        examples: [  
            [  
                {  
                    user: "{{user1}}",  
                    content: { text: "Tell me more about that" }  
                },  
                {  
                    user: "{{user2}}",  
                    content: {  
                        text: "I'll continue explaining...",  
                        action: "CONTINUE"  
                    }  
                }  
            ]  
        ]  
    };  

#### IGNORE

For ending conversations:

    const ignoreAction: Action = {  
        name: "IGNORE",  
        similes: ["STOP_TALKING", "END_CONVERSATION"],  
        description: "Stops responding when conversation is complete or irrelevant",  

        validate: async (runtime: IAgentRuntime, message: Memory) => {  
            const text = message.content.text.toLowerCase();  
            return (  
                text.includes("goodbye") ||  
                text.includes("bye") ||  
                text.includes("thanks") ||  
                text.length < 2  
            );  
        },  

        handler: async (runtime: IAgentRuntime, message: Memory) => {  
            // No response needed  
            return true;  
        },  

        examples: [  
            [  
                {  
                    user: "{{user1}}",  
                    content: { text: "Thanks, goodbye!" }  
                },  
                {  
                    user: "{{user2}}",  
                    content: {  
                        text: "",  
                        action: "IGNORE"  
                    }  
                }  
            ]  
        ]  
    };  

* * *

## FAQ

### What are Actions in Eliza?

Actions are core building blocks that define how agents interact with messages and perform tasks beyond simple text responses.

### How do Actions work?

Actions consist of a name, description, validation function, and handler function that determine when and how an agent can perform a specific task.

### What can Actions do?

Actions enable agents to interact with external systems, modify behavior, process complex workflows, and extend capabilities beyond conversational responses.

### What are some example Actions?

Common actions include CONTINUE (extend dialogue), IGNORE (end conversation), GENERATE_IMAGE (create images), TRANSFER (move tokens), and READ_CONTRACT (retrieve blockchain data).

### How do I create a custom Action?

Define an action with a unique name, validation function to check eligibility, handler function to implement the logic, and provide usage examples.

### What makes a good Action?

A good action has a clear, single purpose, robust input validation, comprehensive error handling, and provides meaningful interactions.

### Can Actions be chained together?

Yes, actions can be composed and chained to create complex workflows and multi-step interactions.

### How are Actions different from tools?

Actions are more comprehensive, ensuring the entire process happens, while tools are typically more focused on specific, discrete operations.

### Where are Actions defined?

Actions can be defined in character files, plugins, or directly in agent configurations.

* * *

## Further Reading

  *  
  *  

 

Last updated on Feb 20, 2025 by jin

  


<!-- Source: https://elizaos.github.io/eliza/docs/core/evaluators/ -->
Evaluators | eliza (https://elizaos.github.io/eliza/docs/core/evaluators/)
  
URL: https://elizaos.github.io/eliza/docs/core/evaluators/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Evaluators 

On this page

#  Evaluators

  are core components that assess and extract information from conversations. Agents use evaluators to automatically process conversations after they happen to help build up their knowledge and understanding over time.

They integrate with the   evaluation system to enable reflection, fact-gathering, and behavioral adaptation and run after each agent action to help maintain contextural awareness. Enabling agents to reflect on their actions and world state is crucial for improving coherence and problem-solving abilities. For example, by reflecting on its performance, an agent can refine its strategies and improve its interactions over time.

* * *

## How They Work

Evaluators run automatically after each agent action (responses, messages, activities, or API calls) to analyze what happened and update the agent's understanding. They extract important information (like facts about users), track progress on goals, and learn from interactions.

Let's say you're at a party and meet someone new. During the conversation:

  * You learn their name is Sarah
  * They mention living in Seattle
  * They work as a software engineer

After the conversation, your brain:

  * Stores these facts for later
  * Updates your understanding of who Sarah is
  * Might note "I should connect Sarah with Bob who's also in tech"

This is exactly how evaluators work for agents - they run in the background to extract insights, track progress, and build up the agent's knowledge over time. However there are some limitations, such as evaluators only process current interactions (can't modify past data), they run after actions complete (not during). Therefore evaluators are best for analysis rather than critical operations.

The key thing to remember is: evaluators are your agent's way of learning and growing from each interaction, just like how we naturally process and learn from our conversations.

### Common Uses

  *  : Learns and remembers facts about users
  *  : Tracks progress on objectives
  * Trust Evaluator: Builds understanding of relationships
  * Sentiment Evaluator: Tracks emotional tone of conversations

* * *

## Implementation

Here's a basic example of an evaluator implementation:

    const evaluator = {  
        // Should this evaluator run right now?  
        validate: async (runtime, message) => {  
            // Return true to run, false to skip  
            return shouldRunThisTime;  
        },  

        // What to do when it runs  
        handler: async (runtime, message) => {  
            // Extract info, update memory, etc  
            const newInfo = extractFromMessage(message);  
            await storeInMemory(newInfo);  
        }  
    };  

### Core Interface

    interface Evaluator {  
        name: string;                // Unique identifier  
        similes: string[];          // Similar evaluator descriptions  
        description: string;        // Purpose and functionality  
        validate: (runtime: IAgentRuntime, message: Memory) => Promise<boolean>;  
        handler: (runtime: IAgentRuntime, message: Memory) => Promise<any>;  
        examples: EvaluatorExample[];  
    }  

For full type definitions, see the   interface documentation.

### Validation Function

The `validate` function is critical for determining when an evaluator should run. For peak performance, proper validation ensures evaluators run only when necessary. For instance, a customer service agent might check if all required user data has been collected and only run if data is still missing.

    validate: async (runtime: IAgentRuntime, message: Memory) => boolean  

Determines if evaluator should run for current message. Returns true to execute handler, false to skip. Should be efficient and quick to check.

### Handler Function

The handler function contains the evaluator's code. It is where the logic for analyzing data, extracting information, and triggering actions resides.

    handler: async (runtime: IAgentRuntime, message: Memory) => any  

Contains main evaluation logic and runs when validate() returns true. Can access   services and  .

tip 

Ensure Evaluators are unique and lightweight 

Avoid complex operations or lengthy computations within the evaluator's handler function and ensure that evaluators have clear and distinct responsibilities not already handled by other components for peak performance.

### Memory Integration

Results are stored using runtime memory managers:

    // Example storing evaluation results   
    const memory = await runtime.memoryManager.addEmbeddingToMemory({  
        userId: user?.id,  
        content: { text: evaluationResult },  
        roomId: roomId,  
        embedding: await embed(runtime, evaluationResult)  
    });  

    await runtime.memoryManager.createMemory(memory);  

* * *

## Fact Evaluator

Deep Dive 

For a comprehensive guide on how the fact evaluator system works, including implementation details and best practices, check out our  .

The Fact Evaluator is one of the most powerful built-in evaluators. It processes convos to:

  * Extract meaningful facts and opinions about users and the world
  * Distinguish between permanent facts, opinions, and status
  * Track what information is already known vs new information
  * Build up the agent's understanding over time through embeddings and memory storage

Facts are stored with the following structure:

    interface Fact {  
        claim: string;      // The actual information extracted  
        type: "fact" | "opinion" | "status";  // Classification of the information  
        in_bio: boolean;    // Whether this info is already in the agent's knowledge  
        already_known: boolean;  // Whether this was previously extracted  
    }  

#### Example Facts

Here's an example of extracted facts from a conversation:

    User: I finally finished my marathon training program!  
    Agent: That's a huge accomplishment! How do you feel about it?  
    User: I'm really proud of what I achieved. It was tough but worth it.  
    Agent: What's next for you?  
    User: I'm actually training for a triathlon now. It's a whole new challenge.  

    const extractedFacts = [  
        {  
            "claim": "User completed marathon training",  
            "type": "fact",          // Permanent info / achievement  
            "in_bio": false,  
            "already_known": false   // Prevents duplicate storage  
        },  
        {  
            "claim": "User feels proud of their achievement",  
            "type": "opinion",       // Subjective views or feelings  
            "in_bio": false,  
            "already_known": false  
        },  
        {  
            "claim": "User is currently training for a triathlon",  
            "type": "status",        // Ongoing activity, changeable  
            "in_bio": false,  
            "already_known": false  
        }  
    ];  

View Full Fact Evaluator Implementation 

    import { composeContext } from "@elizaos/core";  
    import { generateObjectArray } from "@elizaos/core";  
    import { MemoryManager } from "@elizaos/core";  
    import {  
        type ActionExample,  
        type IAgentRuntime,  
        type Memory,  
        ModelClass,  
        type Evaluator,  
    } from "@elizaos/core";  

    export const formatFacts = (facts: Memory[]) => {  
        const messageStrings = facts  
            .reverse()  
            .map((fact: Memory) => fact.content.text);  
        const finalMessageStrings = messageStrings.join("\n");  
        return finalMessageStrings;  
    };  

    const factsTemplate =  
        // {{actors}}  
        `TASK: Extract Claims from the conversation as an array of claims in JSON format.  

    # START OF EXAMPLES   
    These are examples of the expected output of this task:  
    {{evaluationExamples}}  
    # END OF EXAMPLES  

    # INSTRUCTIONS   

    Extract any claims from the conversation that are not already present in the list of known facts above:  
    - Try not to include already-known facts. If you think a fact is already known, but you're not sure, respond with already_known: true.  
    - If the fact is already in the user's description, set in_bio to true  
    - If we've already extracted this fact, set already_known to true  
    - Set the claim type to 'status', 'fact' or 'opinion'  
    - For true facts about the world or the character that do not change, set the claim type to 'fact'  
    - For facts that are true but change over time, set the claim type to 'status'  
    - For non-facts, set the type to 'opinion'  
    - Include any factual detail, including where the user lives, works, or goes to school, what they do for a living, their hobbies, and any other relevant information   

    Recent Messages:  
    {{recentMessages}}  

    Response should be a JSON object array inside a JSON markdown block. Correct response format:  
    \`\`\`json  
    [  
      {"claim": string, "type": enum<fact|opinion|status>, in_bio: boolean, already_known: boolean },  
      {"claim": string, "type": enum<fact|opinion|status>, in_bio: boolean, already_known: boolean },  
      ...  
    ]  
    \`\`\``;  

    async function handler(runtime: IAgentRuntime, message: Memory) {  
        const state = await runtime.composeState(message);  

        const { agentId, roomId } = state;  

        const context = composeContext({  
            state,  
            template: runtime.character.templates?.factsTemplate || factsTemplate,  
        });  

        const facts = await generateObjectArray({  
            runtime,  
            context,  
            modelClass: ModelClass.LARGE,  
        });  

        const factsManager = new MemoryManager({  
            runtime,  
            tableName: "facts",  
        });  

        if (!facts) {  
            return [];  
        }  

        // If the fact is known or corrupted, remove it  
        const filteredFacts = facts  
            .filter((fact) => {  
                return (  
                    !fact.already_known &&  
                    fact.type === "fact" &&  
                    !fact.in_bio &&  
                    fact.claim &&  
                    fact.claim.trim() !== ""  
                );  
            })  
            .map((fact) => fact.claim);  

        for (const fact of filteredFacts) {  
            const factMemory = await factsManager.addEmbeddingToMemory({  
                userId: agentId!,  
                agentId,  
                content: { text: fact },  
                roomId,  
                createdAt: Date.now(),  
            });  

            await factsManager.createMemory(factMemory, true);  

            await new Promise((resolve) => setTimeout(resolve, 250));  
        }  
        return filteredFacts;  
    }  

    export const factEvaluator: Evaluator = {  
        name: "GET_FACTS",  
        similes: [  
            "GET_CLAIMS",  
            "EXTRACT_CLAIMS",  
            "EXTRACT_FACTS",  
            "EXTRACT_CLAIM",  
            "EXTRACT_INFORMATION",  
        ],  
        validate: async (  
            runtime: IAgentRuntime,  

            message: Memory  
        ): Promise<boolean> => {  
            const messageCount = (await runtime.messageManager.countMemories(  
                message.roomId  
            )) as number;  

            const reflectionCount = Math.ceil(runtime.getConversationLength() / 2);  

            return messageCount % reflectionCount === 0;  
        },  
        description:  
            "Extract factual information about the people in the conversation, the current events in the world, and anything else that might be important to remember.",  
        handler,  
        examples: [  
            {  
                context: `Actors in the scene:  
    {{user1}}: Programmer and moderator of the local story club.  
    {{user2}}: New member of the club. Likes to write and read.  

    Facts about the actors:  
    None`,  
                messages: [  
                    {  
                        user: "{{user1}}",  
                        content: { text: "So where are you from" },  
                    },  
                    {  
                        user: "{{user2}}",  
                        content: { text: "I'm from the city" },  
                    },  
                    {  
                        user: "{{user1}}",  
                        content: { text: "Which city?" },  
                    },  
                    {  
                        user: "{{user2}}",  
                        content: { text: "Oakland" },  
                    },  
                    {  
                        user: "{{user1}}",  
                        content: {  
                            text: "Oh, I've never been there, but I know it's in California",  
                        },  
                    },  
                ] as ActionExample[],  
                outcome: `{ "claim": "{{user2}} is from Oakland", "type": "fact", "in_bio": false, "already_known": false },`,  
            },  
            {  
                context: `Actors in the scene:  
    {{user1}}: Athelete and cyclist. Worked out every day for a year to prepare for a marathon.  
    {{user2}}: Likes to go to the beach and shop.  

    Facts about the actors:  
    {{user1}} and {{user2}} are talking about the marathon  
    {{user1}} and {{user2}} have just started dating`,  
                messages: [  
                    {  
                        user: "{{user1}}",  
                        content: {  
                            text: "I finally completed the marathon this year!",  
                        },  
                    },  
                    {  
                        user: "{{user2}}",  
                        content: { text: "Wow! How long did it take?" },  
                    },  
                    {  
                        user: "{{user1}}",  
                        content: { text: "A little over three hours." },  
                    },  
                    {  
                        user: "{{user1}}",  
                        content: { text: "I'm so proud of myself." },  
                    },  
                ] as ActionExample[],  
                outcome: `Claims:  
    json\`\`\`  
    [  
      { "claim": "Alex just completed a marathon in just under 4 hours.", "type": "fact", "in_bio": false, "already_known": false },  
      { "claim": "Alex worked out 2 hours a day at the gym for a year.", "type": "fact", "in_bio": true, "already_known": false },  
      { "claim": "Alex is really proud of himself.", "type": "opinion", "in_bio": false, "already_known": false }  
    ]  
    \`\`\`  
    `,  
            },  
            {  
                context: `Actors in the scene:  
    {{user1}}: Likes to play poker and go to the park. Friends with Eva.  
    {{user2}}: Also likes to play poker. Likes to write and read.  

    Facts about the actors:  
    Mike and Eva won a regional poker tournament about six months ago   
    Mike is married to Alex   
    Eva studied Philosophy before switching to Computer Science`,  
                messages: [  
                    {  
                        user: "{{user1}}",  
                        content: {  
                            text: "Remember when we won the regional poker tournament last spring",  
                        },  
                    },  
                    {  
                        user: "{{user2}}",  
                        content: {  
                            text: "That was one of the best days of my life",  
                        },  
                    },  
                    {  
                        user: "{{user1}}",  
                        content: {  
                            text: "It really put our poker club on the map",  
                        },  
                    },  
                ] as ActionExample[],  
                outcome: `Claims:  
    json\`\`\`  
    [  
      { "claim": "Mike and Eva won the regional poker tournament last spring", "type": "fact", "in_bio": false, "already_known": true },  
      { "claim": "Winning the regional poker tournament put the poker club on the map", "type": "opinion", "in_bio": false, "already_known": false }  
    ]  
    \`\`\``,  
            },  
        ],  
    };  

Source:  


<!-- Source: https://elizaos.github.io/eliza/docs/core/database/ -->
Database Adapters | eliza (https://elizaos.github.io/eliza/docs/core/database/)
 [oai_citation_attribution:0‡elizaos.github.io](https://elizaos.github.io/eliza/docs/core/database/)  
URL: https://elizaos.github.io/eliza/docs/core/database/
Skip to main content

     

 

  *  
  *  

    *  
    *  
    *  
    *  

  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

    *  
    *  
    *  
    *  

  *   * Core Concepts 
  * Database Adapters 

On this page

#  Database Adapters

Database adapters provide persistent storage capabilities for ElizaOS agents. They handle memory storage, relationship tracking, and knowledge management across different database backends.

## Overview

Database adapters implement the   interface to provide consistent data access across different storage solutions. Each adapter optimizes for specific use cases:

Adapter Best For Key Features  
 Production deployments Sharding, vector search, real-time participant management  
 Enterprise & vector search Dynamic vector dimensions, fuzzy matching, comprehensive logging  
 Development & embedded Lightweight, file-based, vector BLOB support  
 Cloud-hosted vector DB Multiple embedding sizes, real-time subscriptions, row-level security  
 Browser environments Lightweight PostgreSQL implementation, HNSW indexing  
 Vector-focused deployments Optimized for RAG applications, sophisticated preprocessing  
 Browser environments Full SQLite functionality in browser, complex queries  

## Core Functionality

All adapters extend the   base class and implement the   interface. Here's a comprehensive overview of available methods:

Category Method Description Parameters   
Database Lifecycle   
`init()`Initialize database connection-  
`close()`Close database connection-  
Memory Management   
`createMemory()`Store new memory `memory: Memory, tableName: string, unique?: boolean `  
`getMemoryById()`Retrieve specific memory `id: UUID `  
`getMemories()`Get memories matching criteria`{ roomId: UUID, count?: number, unique?: boolean, tableName: string, agentId: UUID, start?: number, end?: number }`  
`getMemoriesByIds()`Get multiple memories by IDs `memoryIds: UUID[], tableName?: string `  
`getMemoriesByRoomIds()`Get memories from multiple rooms`{ agentId: UUID, roomIds: UUID[], tableName: string, limit?: number }`  
`searchMemories()`Search with vector similarity`{ tableName: string, agentId: UUID, roomId: UUID, embedding: number[], match_threshold: number, match_count: number, unique: boolean }`  
`searchMemoriesByEmbedding()`Search memories by embedding vector `embedding: number[], { match_threshold?: number, count?: number, roomId?: UUID, agentId?: UUID, unique?: boolean, tableName: string }`  
`removeMemory()`Remove specific memory `memoryId: UUID, tableName: string `  
`removeAllMemories()`Remove all memories in room `roomId: UUID, tableName: string `  
`countMemories()`Count memories in room `roomId: UUID, unique?: boolean, tableName?: string `  
Knowledge Management   
`createKnowledge()`Store new knowledge item `knowledge: RAGKnowledgeItem `  
`getKnowledge()`Retrieve knowledge`{ id?: UUID, agentId: UUID, limit?: number, query?: string, conversationContext?: string }`  
`searchKnowledge()`Semantic knowledge search`{ agentId: UUID, embedding: Float32Array, match_threshold: number, match_count: number, searchText?: string }`  
`removeKnowledge()`Remove knowledge item `id: UUID `  
`clearKnowledge()`Remove all knowledge `agentId: UUID, shared?: boolean `  
Room & Participants   
`createRoom()`Create new conversation room `roomId?: UUID `  
`getRoom()`Get room by ID `roomId: UUID `  
`removeRoom()`Remove room `roomId: UUID `  
`addParticipant()`Add user to room `userId: UUID, roomId: UUID `  
`removeParticipant()`Remove user from room `userId: UUID, roomId: UUID `  
`getParticipantsForRoom()`List room participants `roomId: UUID `  
`getParticipantsForAccount()`Get user's room participations `userId: UUID `  
`getRoomsForParticipant()`Get rooms for user `userId: UUID `  
`getRoomsForParticipants()`Get shared rooms for users `userIds: UUID[]`  
`getParticipantUserState()`Get participant's state `roomId: UUID, userId: UUID `  
`setParticipantUserState()`Update participant state`roomId: UUID, userId: UUID, state: "FOLLOWED"  
Account Management   
`createAccount()`Create new user account `account: Account `  
`getAccountById()`Retrieve user account `userId: UUID `  
`getActorDetails()`Get actor information`{ roomId: UUID }`  
Relationships   
`createRelationship()`Create user connection`{ userA: UUID, userB: UUID }`  
`getRelationship()`Get relationship details`{ userA: UUID, userB: UUID }`  
`getRelationships()`Get all relationships`{ userId: UUID }`  
Goals   
`createGoal()`Create new goal `goal: Goal `  
`updateGoal()`Update goal `goal: Goal `  
`updateGoalStatus()`Update goal status`{ goalId: UUID, status: GoalStatus }`  
`getGoals()`Get goals matching criteria`{ agentId: UUID, roomId: UUID, userId?: UUID, onlyInProgress?: boolean, count?: number }`  
`removeGoal()`Remove specific goal `goalId: UUID `  
`removeAllGoals()`Remove all goals in room `roomId: UUID `  
Caching & Embedding   
`getCachedEmbeddings()`Retrieve cached embeddings`{ query_table_name: string, query_threshold: number, query_input: string, query_field_name: string, query_field_sub_name: string, query_match_count: number }`  
Logging   
`log()`Log event or action`{ body: { [key: string]: unknown }, userId: UUID, roomId: UUID, type: string }`  

### Implementation Notes

Each adapter optimizes these methods for their specific database backend:

  * MongoDB: Uses aggregation pipelines for vector operations
  * PostgreSQL: Leverages pgvector extension
  * SQLite: Implements BLOB storage for vectors
  * Qdrant: Optimizes with HNSW indexing
  * Supabase: Adds real-time capabilities

> Note: For detailed implementation examples, see each adapter's source repository ( )

All adapters provide:

    interface IDatabaseAdapter {  
        // Memory Management  
        createMemory(memory: Memory, tableName: string): Promise<void>;  
        getMemories(params: { roomId: UUID; count?: number }): Promise<Memory[]>;  
        searchMemories(params: SearchParams): Promise<Memory[]>;  
        removeMemory(memoryId: UUID): Promise<void>;  

        // Account & Room Management  
        createAccount(account: Account): Promise<boolean>;  
        getAccountById(userId: UUID): Promise<Account>;  
        createRoom(roomId?: UUID): Promise<UUID>;  
        getRoom(roomId: UUID): Promise<UUID>;  

        // Participant Management  
        addParticipant(userId: UUID, roomId: UUID): Promise<boolean>;  
        getParticipantsForRoom(roomId: UUID): Promise<UUID[]>;  

        // Knowledge Management  
        createKnowledge(knowledge: RAGKnowledgeItem): Promise<void>;  
        searchKnowledge(params: SearchParams): Promise<RAGKnowledgeItem[]>;  

        // Goal Management  
        createGoal(goal: Goal): Promise<void>;  
        updateGoalStatus(params: { goalId: UUID; status: GoalStatus }): Promise<void>;  
    }  

Relationship Management 

    interface IDatabaseAdapter {  
        // Room Management  
        createRoom(roomId?: UUID): Promise<UUID>;  
        getRoom(roomId: UUID): Promise<UUID | null>;  
        getRoomsForParticipant(userId: UUID): Promise<UUID[]>;  

        // Participant Management  
        addParticipant(userId: UUID, roomId: UUID): Promise<boolean>;  
        getParticipantsForRoom(roomId: UUID): Promise<UUID[]>;  
        getParticipantUserState(roomId: UUID, userId: UUID): Promise<"FOLLOWED" | "MUTED" | null>;  

        // Relationship Tracking  
        createRelationship(params: { userA: UUID; userB: UUID }): Promise<boolean>;  
        getRelationship(params: { userA: UUID; userB: UUID }): Promise<Relationship | null>;  
    }  

Cache & Goal Management 

    interface IDatabaseCacheAdapter {  
        getCache(params: {  
            agentId: UUID;  
            key: string;  
        }): Promise<string | undefined>;  

        setCache(params: {  
            agentId: UUID;  
            key: string;  
            value: string;  
        }): Promise<boolean>;  
    }  

    interface IDatabaseAdapter {  
        // Goal Management  
        createGoal(goal: Goal): Promise<void>;  
        updateGoal(goal: Goal): Promise<void>;  
        getGoals(params: {  
            agentId: UUID;  
            roomId: UUID;  
            userId?: UUID | null;  
            onlyInProgress?: boolean;  
            count?: number;  
        }): Promise<Goal[]>;  
    }  

* * *

## Adapter Implementations

### Quick Start

    // MongoDB   
    import { MongoDBAdapter } from '@elizaos/adapter-mongodb';  
    const mongoAdapter = new MongoDBAdapter({  
        uri: process.env.MONGODB_URI,  
        dbName: process.env.MONGODB_DB_NAME  
    });  

    // PostgreSQL   
    import { PostgresAdapter } from '@elizaos/adapter-postgres';  
    const pgAdapter = new PostgresAdapter({  
        connectionString: process.env.POSTGRES_URI  
    });  

    // SQLite   
    import { SqliteDatabaseAdapter } from '@elizaos/adapter-sqlite';  
    const sqliteAdapter = new SqliteDatabaseAdapter('path/to/database.db');  

    // Supabase   
    import { SupabaseAdapter } from '@elizaos/adapter-supabase';  
    const supabaseAdapter = new SupabaseAdapter({  
        url: process.env.SUPABASE_URL,  
        apiKey: process.env.SUPABASE_API_KEY  
    });  

## Adapter Comparison

Feature MongoDB PostgreSQL SQLite Supabase   
Best For Production deployments Enterprise & vector search Development & embedded Cloud-hosted vector DB   
Vector Support Native sharding Multiple dimensions (384d-1536d)BLOB storage Multi-dimension tables   
Key Features Auto-sharding, Real-time tracking, Auto-reconnection Fuzzy matching, UUID keys, Comprehensive logging JSON validation, FK constraints, Built-in caching Real-time subs, Row-level security, Type-safe queries   
Setup Requirements None pgvector extension None None   
Collections/Tables rooms, participants, accounts, memories, knowledge Same as MongoDB + vector extensions Same as MongoDB + metadata JSON Same as PostgreSQL + dimension-specific tables  

## Implementation Details

### PostgreSQL Requirements

    CREATE EXTENSION IF NOT EXISTS vector;  
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;  

### SQLite Schema

    CREATE TABLE memories (  
        id TEXT PRIMARY KEY,  
        type TEXT,  
        content TEXT,  
        embedding BLOB,  
        userId TEXT FK,  
        roomId TEXT FK,  
        agentId TEXT FK  
    );  

    CREATE TABLE knowledge (  
        id TEXT PRIMARY KEY,  
        content TEXT NOT NULL,  
        embedding BLOB,  
        metadata JSON  
    );  

### Supabase Vector Tables

    CREATE TABLE memories_1536 (id UUID PRIMARY KEY, embedding vector(1536));  
    CREATE TABLE memories_1024 (id UUID PRIMARY KEY, embedding vector(1024));  

## Embedding Support

Adapter Supported Dimensions   
MongoDB All (as arrays)  
PostgreSQL OpenAI (1536d), Ollama (1024d), GAIANET (768d), BGE (384d)  
SQLite All (as BLOB)  
Supabase Configurable (384d-1536d)  

Source code:  

* * *

## Transaction & Error Handling

All adapters extend the   base class which provides built-in transaction support and error handling through the   pattern. See   for implementation details, as well as the   or   for detailed examples.

    // Transaction handling   
    const result = await adapter.withTransaction(async (client) => {  
        await client.query("BEGIN");  
        // Perform multiple operations  
        await client.query("COMMIT");  
        return result;  
    });  

    // Error handling with circuit breaker   
    protected async withCircuitBreaker<T>(  
        operation: () => Promise<T>,  
        context: string  
    ): Promise<T> {  
        try {  
            return await this.circuitBreaker.execute(operation);  
        } catch (error) {  
            // Circuit breaker prevents cascading failures  
            elizaLogger.error(`Circuit breaker error in ${context}:`, error);  
            throw error;  
        }  
    }  

Implemented features include:

  * Automatic rollback on errors
  * Circuit breaker pattern to prevent cascading failures ( )
  * Connection pool management
  * Error type classification

* * *

## FAQ

### How do I choose the right adapter?

Select based on your deployment needs. Use MongoDB/PostgreSQL for production, SQLite for development, SQL.js/PGLite for browser environments, and Qdrant/Supabase for vector-focused applications.

### Can I switch adapters later?

Yes, all adapters implement the   interface. Data migration between adapters is possible but requires additional steps.

### How are vector embeddings handled?

Each adapter implements vector storage based on its native capabilities - PostgreSQL/Supabase use native vector types, MongoDB uses array fields with indexes, SQLite uses BLOB storage, and Qdrant uses optimized vector stores.

### What about data migration?

Use the adapter's export/import methods defined in the   base class.

### How do I handle schema updates?

Run migrations using the adapter-specific CLI tools. Each adapter provides its own migration system - check the adapter's README in the   repository.

### How do I fix database connection issues?

Check your connection string format, verify the database exists and is accessible, ensure proper adapter configuration, and consider using environment variables for credentials.

### How do I resolve embedding dimension mismatch errors?

Set USE_OPENAI_EMBEDDING=TRUE in your .env file. Different models use different vector dimensions (e.g., OpenAI uses 1536, some local models use 384). Clear your database when switching embedding models.

### How do I clear/reset my database?

Delete the db.sqlite file in your data directory and restart the agent. For production databases, use proper database management tools for cleanup.

### Which database should I use in production?

PostgreSQL with vector extensions is recommended for production deployments. SQLite works well for development but may not scale as effectively for production loads.

### How do I migrate between different database adapters?

Use the export/import methods provided by the DatabaseAdapter base class. Each adapter implements these methods for data migration, though you may need to handle schema differences manually.

## Further Reading

  *  
  *  

 

Last updated on Feb 20, 2025 by jin

  

  *  
  *  
    *  
  *  
    *  
  *  
  *  
    *  
    *  
    *  
  *  
  *  
  *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
    *  
  *  

Docs

  *  

Community

  *  
  *  

More

  *  