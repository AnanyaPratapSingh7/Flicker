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
  endpoint?: string;
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
    model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    endpoint = '/api/chat/ai-chat'
  } = options;

  const response = await fetch(endpoint, {
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
    model = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    endpoint = '/api/chat/ai-chat'
  } = options;

  try {
    console.log('Initiating streaming request with:', { 
      messageCount: messages.length, 
      model,
      endpoint
    });
    
    // Use the fetch API with no timeout to prevent early disconnection
    const controller = new AbortController();
    
    // Create a request with proper headers for streaming
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        messages,
        temperature,
        max_tokens,
        stream: true,
        model
      }),
      // Don't set a timeout on the request
      signal: controller.signal
    });

    if (!response.ok) {
      console.error(`Stream response error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    // Check if response is actually a stream
    const contentType = response.headers.get('Content-Type');
    console.log('Response content type:', contentType);
    
    if (!contentType || !contentType.includes('text/event-stream')) {
      console.warn(`Expected event stream but got ${contentType}`);
      // Try to read as JSON in case the server returned a regular response
      try {
        const data = await response.json();
        console.log('Received non-streaming response:', data);
        if (data.choices && data.choices[0] && data.choices[0].message) {
          // Simulate a chunk from the regular response
          onChunk({
            choices: [{
              delta: { content: data.choices[0].message.content }
            }]
          });
          onComplete();
          return;
        } else if (data.error) {
          throw new Error(`Server error: ${data.error}`);
        }
      } catch (e) {
        console.error('Failed to parse non-streaming response:', e);
        throw new Error(`Failed to parse response: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    console.log('Stream connection established, content-type:', contentType);
    
    // Get reader for streaming - we're not using EventSource because it only supports GET requests
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported or response body is null');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let chunkCount = 0;
    let contentReceived = false;

    // Process stream
    while (true) {
      try {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream reader reported done');
          break;
        }

        // Decode the chunk and add it to the buffer
        const text = decoder.decode(value, { stream: true });
        buffer += text;
        
        // Debug received data
        console.log(`Received chunk #${chunkCount + 1}: ${value.length} bytes, text: "${text}"`);
        
        // Process complete events from the buffer
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep the last incomplete chunk in the buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          // Remove the "data: " prefix
          const dataMatch = line.match(/^data: (.*)/);
          if (!dataMatch) {
            console.warn('Received non-data line:', line);
            continue;
          }
          
          const data = dataMatch[1].trim();
          
          if (data === '[DONE]') {
            console.log('Received [DONE] marker');
            onComplete();
            return;
          }
          
          try {
            const parsedData = JSON.parse(data);
            chunkCount++;
            
            // Check for content in this chunk
            const content = parsedData.choices?.[0]?.delta?.content;
            if (content) {
              contentReceived = true;
              console.log(`Chunk #${chunkCount} content: "${content}"`);
            } else {
              console.log(`Chunk #${chunkCount} has no content`);
            }
            
            onChunk(parsedData);
          } catch (e) {
            console.warn('Error parsing SSE chunk:', data, e);
          }
        }
      } catch (streamError) {
        console.error('Error reading from stream:', streamError);
        // Try to continue reading if possible
        if (chunkCount > 0) {
          continue;
        } else {
          throw streamError;
        }
      }
    }
    
    console.log(`Stream complete, processed ${chunkCount} chunks`);
    
    // Check if we received any content
    if (!contentReceived && chunkCount === 0) {
      console.warn('No content received from stream');
      onError(new Error('No content received from the streaming response'));
      return;
    }
    
    onComplete();
  } catch (error) {
    console.error('Fatal streaming error:', error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export default {
  sendChatRequest,
  streamChatRequest
};
