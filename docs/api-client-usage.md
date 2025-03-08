# Paradyze v2 Type-Safe API Client Usage

The Paradyze v2 API Client Library provides a type-safe, consistent way to interact with various backend services. This document outlines how to use the API client in your components and services.

## Basic Usage

### Importing the API Client

```typescript
// Import the specific client you need
import { chatClient } from '../api';

// Or import specific types and clients
import { chatClient, Message, ChatOptions } from '../api';

// For advanced use cases, import the core client
import { ApiClient } from '../api';
```

### Making a Simple Chat Request

```typescript
import { chatClient, Message } from '../api';

async function sendMessage() {
  const messages: Message[] = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, who are you?' }
  ];
  
  try {
    const response = await chatClient.sendChatRequest(messages);
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error calling chat API:', error);
  }
}
```

### Using Streaming Responses

```typescript
import { chatClient, Message, ChatCompletionChunk } from '../api';

function streamConversation() {
  const messages: Message[] = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Write a short poem about AI.' }
  ];
  
  let responseText = '';
  
  chatClient.streamChatRequest(
    messages,
    { temperature: 0.7 },
    // Handle chunks as they arrive
    (chunk: ChatCompletionChunk) => {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        responseText += content;
        // Update UI with partial response
        updateUI(responseText);
      }
    },
    // Handle errors
    (error) => {
      console.error('Streaming error:', error);
    },
    // Handle completion
    () => {
      console.log('Stream completed');
      finishUI(responseText);
    }
  );
}
```

## Advanced Usage

### Customizing API Options

```typescript
import { chatClient, Message } from '../api';

async function customRequest() {
  const messages: Message[] = [
    { role: 'system', content: 'You are a creative assistant.' },
    { role: 'user', content: 'Generate 5 product name ideas for a new smart watch.' }
  ];
  
  const response = await chatClient.sendChatRequest(messages, {
    temperature: 0.9,       // Higher creativity
    max_tokens: 200,        // Shorter response
    model: 'openai/gpt-4o', // Specific model
    top_p: 0.95,            // Control diversity
    frequency_penalty: 0.5  // Reduce repetition
  });
  
  return response.choices[0].message.content;
}
```

### Using a Different Chat Model

```typescript
import { chatClient } from '../api';

// Temporarily use a different model for a specific request
async function useAlternativeModel() {
  // Save original default model
  const originalModel = chatClient.getDefaultModel();
  
  try {
    // Set a new default model for all subsequent requests
    chatClient.setDefaultModel('anthropic/claude-3-opus');
    
    // This request will use the new model
    const response = await chatClient.sendChatRequest([
      { role: 'user', content: 'Explain quantum computing simply.' }
    ]);
    
    return response;
  } finally {
    // Restore the original model
    chatClient.setDefaultModel(originalModel);
  }
}
```

## Creating Custom API Clients

For other API endpoints beyond chat, you can create custom API clients using the core `ApiClient` class:

```typescript
import { ApiClient } from '../api';

// Create a client for a specific API endpoint
const userApiClient = new ApiClient({
  baseUrl: '/api/users'
});

// Example usage
async function getUsers() {
  const response = await userApiClient.get('/list');
  return response.data;
}

async function createUser(userData) {
  const response = await userApiClient.post('/create', {
    data: userData
  });
  return response.data;
}
```

## Error Handling

The API client provides detailed error information through the `ApiError` class:

```typescript
import { chatClient } from '../api';

async function handleErrorsProperly() {
  try {
    const response = await chatClient.sendChatRequest([
      { role: 'user', content: 'Hello' }
    ]);
    return response;
  } catch (error) {
    if (error.name === 'ApiError') {
      console.error(`API Error ${error.status}: ${error.message}`);
      
      // Handle specific status codes
      if (error.status === 401) {
        // Handle unauthorized
      } else if (error.status === 429) {
        // Handle rate limiting
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}
```

## Best Practices

1. **Type Safety**: Always use the provided types for request and response objects.
2. **Error Handling**: Implement proper error handling for all API calls.
3. **Streaming**: Use streaming for better user experience with long responses.
4. **Authentication**: Let the API client handle authentication tokens.
5. **Environment Variables**: Use environment variables for API keys and model configuration.

For questions or issues with the API client, please refer to the source code or contact the development team.
