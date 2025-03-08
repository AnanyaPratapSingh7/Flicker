/**
 * Type-safe OpenRouter Chat API Client
 * 
 * This client leverages the core API client to provide a type-safe
 * interface for interacting with the OpenRouter AI Chat API.
 */
import { ApiClient } from '../core/apiClient';
import { MutationOptions, StreamingOptions } from '../core/types';
import {
  Message,
  ChatOptions,
  ChatRequestPayload,
  ChatCompletionResponse,
  ChunkHandler,
  ErrorHandler,
  CompleteHandler
} from './types';
import env from '../../utils/env';
import serviceDiscovery from '../../utils/service-discovery';

export class ChatApiClient {
  private apiClient: ApiClient;
  private defaultModel: string;
  private _baseUrl: string; // Store the base URL for debugging
  
  constructor(baseUrl: string = env.API_ENDPOINT || '/api/ai-chat') {
    // Correctly store the original base URL
    this._baseUrl = baseUrl;
    
    console.log(`[DEBUG] ChatApiClient: Initial baseUrl=${baseUrl}`);
    
    // Temporarily use a placeholder URL
    // The actual URL will be resolved asynchronously
    let tempBaseUrl = env.OPENROUTER_SERVER_URL || 'http://localhost:3003';
    tempBaseUrl = `${tempBaseUrl}/api/proxy/ai-chat`;
    
    // Create the API client with a temporary URL
    this.apiClient = new ApiClient({
      baseUrl: tempBaseUrl
    });
    
    console.log(`[DEBUG] ChatApiClient.constructor: Created with temporary baseUrl=${tempBaseUrl}`);
    
    // Set the default model from environment variables or use fallback
    this.defaultModel = env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    
    // Update the URL asynchronously using service discovery
    this.updateBaseUrlAsync(baseUrl);
  }
  
  /**
   * Asynchronously update the base URL using service discovery
   */
  private async updateBaseUrlAsync(baseUrl: string): Promise<void> {
    try {
      const resolvedUrl = await this.normalizeBaseUrl(baseUrl);
      
      // Update the API client's base URL
      this.apiClient.setBaseUrl(resolvedUrl);
      
      console.log(`[DEBUG] ChatApiClient: Updated baseUrl to ${resolvedUrl}`);
    } catch (error) {
      console.error('[ERROR] ChatApiClient: Failed to resolve base URL:', error);
    }
  }
  
  /**
   * Normalize the base URL to ensure it works across different environments
   */
  private async normalizeBaseUrl(baseUrl: string): Promise<string> {
    // If we're in a development environment, use service discovery
    if (this.isDevelopmentEnvironment()) {
      try {
        // Try to get service URL from the registry
        const serverUrl = await serviceDiscovery.getServiceUrl('openrouter-proxy');
        console.log(`[DEBUG] ChatApiClient: Using discovered server: ${serverUrl}`);
        return `${serverUrl}/api/proxy/ai-chat`;
      } catch (error) {
        // Fall back to environment variable or default
        const serverUrl = env.OPENROUTER_SERVER_URL || 'http://localhost:3003';
        console.log(`[DEBUG] ChatApiClient: Service discovery failed, using fallback: ${serverUrl}`);
        return `${serverUrl}/api/proxy/ai-chat`;
      }
    }
    
    // For production or other environments, normalize the URL
    let normalizedUrl = baseUrl;
    
    // If URL is relative (starts with /), add the current window location as base
    if (baseUrl.startsWith('/') && typeof window !== 'undefined') {
      normalizedUrl = `${window.location.origin}${baseUrl}`;
    }
    
    // If the URL doesn't have a protocol, assume http/https based on the current window
    if (!normalizedUrl.includes('://') && typeof window !== 'undefined') {
      normalizedUrl = `${window.location.protocol}//${window.location.host}${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`;
    }
    
    console.log(`[DEBUG] ChatApiClient: Normalized URL to: ${normalizedUrl}`);
    return normalizedUrl;
  }
  
  /**
   * Check if we're in a development environment
   */
  private isDevelopmentEnvironment(): boolean {
    const isDev = process.env.NODE_ENV === 'development' || 
                (typeof window !== 'undefined' && 
                 (window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1'));
    
    console.log(`[DEBUG] ChatApiClient: Environment detection - isDev=${isDev}`);
    return isDev;
  }
  
  /**
   * Transform chat options and messages into a standardized request payload
   */
  private createChatPayload(
    messages: Message[],
    options: ChatOptions = {}
  ): ChatRequestPayload {
    const {
      temperature = 0.7,
      max_tokens = 800,
      stream = false,
      model = this.defaultModel,
      frequency_penalty,
      presence_penalty,
      top_p,
      stop
    } = options;
    
    return {
      messages,
      temperature,
      max_tokens,
      stream,
      model,
      ...(frequency_penalty !== undefined && { frequency_penalty }),
      ...(presence_penalty !== undefined && { presence_penalty }),
      ...(top_p !== undefined && { top_p }),
      ...(stop !== undefined && { stop })
    };
  }
  
  /**
   * Send a chat completion request (non-streaming)
   */
  async sendChatRequest(
    messages: Message[],
    options: ChatOptions = {}
  ): Promise<ChatCompletionResponse> {
    const payload = this.createChatPayload(messages, { ...options, stream: false });
    
    console.log('[DEBUG] ChatClient.sendChatRequest: Sending request to endpoint');
    
    try {
      // Send request to the already configured endpoint (empty string for path)
      const response = await this.apiClient.post<ChatCompletionResponse, ChatRequestPayload>(
        '', // Empty string since baseUrl already has the full path
        {
          data: payload
        }
      );
      
      console.log('[DEBUG] ChatClient.sendChatRequest: Response received', response);
      return response.data;
    } catch (error) {
      console.error('[ERROR] ChatClient.sendChatRequest failed:', error);
      throw error;
    }
  }
  
  /**
   * Send a streaming chat completion request
   */
  async streamChatRequest(
    messages: Message[],
    options: ChatOptions = {},
    onChunk: ChunkHandler,
    onError: ErrorHandler,
    onComplete: CompleteHandler
  ): Promise<void> {
    const payload = this.createChatPayload(messages, { ...options, stream: true });
    
    const streamOptions: MutationOptions<ChatRequestPayload> & StreamingOptions = {
      data: payload,
      headers: {
        'Accept': 'text/event-stream'
      },
      onChunk,
      onError,
      onComplete
    };
    
    console.log('[DEBUG] ChatClient.streamChatRequest: Sending stream request');
    
    try {
      // Stream from the already configured endpoint (empty string for path)
      await this.apiClient.stream('', streamOptions);
    } catch (error) {
      console.error('[ERROR] ChatClient.streamChatRequest failed:', error);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Get the default model being used
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }
  
  /**
   * Set a different default model
   */
  setDefaultModel(modelId: string): void {
    this.defaultModel = modelId;
  }
  
  // Getter for debugging purposes
  get baseUrl(): string {
    return this._baseUrl;
  }
}

// Create a singleton instance for easy import
const chatApiClient = new ChatApiClient();

// Export the class and the default instance
export default chatApiClient;
