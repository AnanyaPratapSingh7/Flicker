/**
 * OpenRouter AI Chat Client
 * 
 * This is the client-side implementation for the OpenRouter API.
 * It uses Vite's environment variables format with import.meta.env
 */
import env from '../../utils/env';

type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  model?: string;
}

export interface CompletionResponse {
  id: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a chat completion request through our backend proxy
 */
export async function sendChatRequest(
  messages: Message[],
  options: ChatOptions = {}
): Promise<CompletionResponse> {
  const {
    temperature = 0.7,
    max_tokens = 800,
    stream = false,
    model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
  } = options;

  const response = await fetch('/api/chat/ai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      temperature,
      max_tokens,
      stream,
      model
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API error: ${errorData.error || response.statusText}`);
  }

  return await response.json();
}

/**
 * Send a streaming chat completion request through our backend proxy
 */
export async function streamChatRequest(
  messages: Message[],
  options: ChatOptions = {},
  onChunk: (chunk: any) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): Promise<void> {
  const {
    temperature = 0.7,
    max_tokens = 800,
    model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
  } = options;

  try {
    const response = await fetch('/api/chat/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        messages,
        temperature,
        max_tokens,
        stream: true,
        model
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode the chunk and add it to the buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete events from the buffer
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep the last incomplete chunk in the buffer
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        // Remove the "data: " prefix
        const data = line.replace(/^data: /, '').trim();
        
        if (data === '[DONE]') {
          onComplete();
          return;
        }
        
        try {
          const parsedData = JSON.parse(data);
          onChunk(parsedData);
        } catch (e) {
          console.warn('Error parsing SSE chunk:', data);
        }
      }
    }
    
    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export default {
  sendChatRequest,
  streamChatRequest
};
