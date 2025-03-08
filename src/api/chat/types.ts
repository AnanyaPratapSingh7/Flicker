/**
 * OpenRouter AI Chat API Types
 */

// Types for the OpenRouter API
export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  model?: string;
  frequency_penalty?: number;
  presence_penalty?: number;
  top_p?: number;
  stop?: string[];
}

export interface ChatRequestPayload {
  messages: Message[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
  model: string;
  frequency_penalty?: number;
  presence_penalty?: number;
  top_p?: number;
  stop?: string[];
}

export interface ChatResponseChoice {
  index: number;
  message: Message;
  finish_reason: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: ChatResponseChoice[];
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Streaming response types
export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      content?: string;
      role?: Role;
    };
    finish_reason: string | null;
  }[];
}

// Handler types for streaming
export type ChunkHandler = (chunk: ChatCompletionChunk) => void;
export type ErrorHandler = (error: Error) => void;
export type CompleteHandler = () => void;
