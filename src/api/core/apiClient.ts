/**
 * Core API Client for Paradyze v2
 * 
 * This provides a flexible, type-safe API client that can be used across the application.
 * It handles request/response parsing, error handling, and authentication.
 */
import {
  HttpMethod,
  Headers as ApiHeaders,
  RequestOptions,
  GetOptions,
  MutationOptions,
  ApiError,
  ApiResponse,
  StreamingOptions
} from './types';

export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: ApiHeaders;
  authToken?: string;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: ApiHeaders;
  private corsMode: RequestMode = 'cors'; // Add explicit CORS mode
  private includeCredentials: boolean = true; // Include credentials by default
  
  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders
    };
    
    // Add authorization header if token is provided
    if (config.authToken) {
      this.defaultHeaders['Authorization'] = `Bearer ${config.authToken}`;
    }
    
    console.log(`[DEBUG] ApiClient: Created with baseUrl=${config.baseUrl}`);
  }
  
  /**
   * Set auth token for subsequent requests
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Clear auth token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
  
  /**
   * Internal method to build a URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    try {
      // Check if the endpoint is already a full URL
      let url: URL;
      
      if (endpoint.includes('://')) {
        // Endpoint is already a full URL
        url = new URL(endpoint);
      } else if (this.baseUrl.includes('://')) {
        // Base URL is a full URL, append endpoint
        url = new URL(endpoint, this.baseUrl);
      } else if (typeof window !== 'undefined') {
        // If we're in a browser and don't have a protocol in baseUrl, use current origin
        const baseWithOrigin = `${window.location.origin}${this.baseUrl.startsWith('/') ? this.baseUrl : `/${this.baseUrl}`}`;
        url = new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, baseWithOrigin);
      } else {
        // Fallback for non-browser environments or incomplete URLs
        throw new Error(`Invalid base URL: ${this.baseUrl} - Must include protocol and host (e.g. https://example.com)`);
      }
      
      // Add query parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      const finalUrl = url.toString();
      console.log(`[DEBUG] ApiClient.buildUrl: Built URL: ${finalUrl} from baseUrl=${this.baseUrl} and endpoint=${endpoint}`);
      return finalUrl;
    } catch (error) {
      console.error(`URL construction error with base: ${this.baseUrl} and endpoint: ${endpoint}`, error);
      throw error;
    }
  }
  
  /**
   * Update the base URL for the API client
   * Useful when the URL is resolved asynchronously (e.g., via service discovery)
   */
  setBaseUrl(baseUrl: string): void {
    console.log(`[DEBUG] ApiClient: Updating baseUrl from ${this.baseUrl} to ${baseUrl}`);
    this.baseUrl = baseUrl;
  }
  
  /**
   * Internal method to handle API responses
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      throw new ApiError({
        status: response.status,
        statusText: response.statusText,
        data: errorData,
        message: errorData.message || errorData.error || response.statusText
      });
    }
    
    // Handle empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {
        data: {} as T,
        status: response.status,
        headers: this.responseHeadersToObject(response.headers)
      };
    }
    
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      headers: this.responseHeadersToObject(response.headers)
    };
  }
  
  /**
   * Convert response headers to a simple object
   */
  private responseHeadersToObject(headers: globalThis.Headers): Record<string, string> {
    const result: Record<string, string> = {};
    
    headers.forEach((value: string, key: string) => {
      result[key] = value;
    });
    
    return result;
  }
  
  /**
   * Make a generic request to the API
   */
  async request<T = any, D = any>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions & { data?: D } = {}
  ): Promise<ApiResponse<T>> {
    const { params, headers, signal, data } = options;
    const url = this.buildUrl(endpoint, params);
    
    const requestInit: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...(headers as Record<string, string>)
      },
      signal,
      mode: this.corsMode, // Explicitly set CORS mode
      credentials: this.includeCredentials ? 'include' : 'same-origin' // Include cookies if needed
    };
    
    // Add request body for methods that support it
    if (data !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestInit.body = JSON.stringify(data);
    }
    
    console.log(`[DEBUG] ApiClient.request: ${method} ${url}`);
    
    try {
      const response = await fetch(url, requestInit);
      return this.handleResponse<T>(response);
    } catch (error) {
      // If we get a network error, try again with credentials: 'same-origin'
      if (this.includeCredentials && error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log(`[DEBUG] ApiClient.request: Initial request failed, retrying with credentials: 'same-origin'`);
        requestInit.credentials = 'same-origin';
        const retryResponse = await fetch(url, requestInit);
        return this.handleResponse<T>(retryResponse);
      }
      
      throw error;
    }
  }
  
  /**
   * GET request helper
   */
  async get<T = any>(endpoint: string, options: GetOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, options);
  }
  
  /**
   * POST request helper
   */
  async post<T = any, D = any>(endpoint: string, options: MutationOptions<D>): Promise<ApiResponse<T>> {
    return this.request<T, D>('POST', endpoint, options);
  }
  
  /**
   * PUT request helper
   */
  async put<T = any, D = any>(endpoint: string, options: MutationOptions<D>): Promise<ApiResponse<T>> {
    return this.request<T, D>('PUT', endpoint, options);
  }
  
  /**
   * DELETE request helper
   */
  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }
  
  /**
   * PATCH request helper
   */
  async patch<T = any, D = any>(endpoint: string, options: MutationOptions<D>): Promise<ApiResponse<T>> {
    return this.request<T, D>('PATCH', endpoint, options);
  }
  
  /**
   * Handle streaming responses
   */
  async stream<D = any>(
    endpoint: string,
    options: MutationOptions<D> & StreamingOptions
  ): Promise<void> {
    const { params, headers, data, onChunk, onError, onComplete } = options;
    const url = this.buildUrl(endpoint, params);
    
    console.log(`[DEBUG] ApiClient.stream: Attempting to stream from ${url}`);
    
    try {
      // Prepare the request options
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          ...this.defaultHeaders,
          'Accept': 'text/event-stream',
          ...(headers as Record<string, string>)
        },
        body: JSON.stringify(data),
        mode: 'cors', // Always use CORS mode
        credentials: 'include' // Start with include
      };
      
      console.log(`[DEBUG] ApiClient.stream: Initiating streaming request`);
      
      let response;
      try {
        // First attempt with credentials: 'include'
        response = await fetch(url, fetchOptions);
      } catch (initialError) {
        // If this fails, try with credentials: 'same-origin'
        console.log(`[DEBUG] ApiClient.stream: Initial request failed, trying with credentials: 'same-origin'`);
        fetchOptions.credentials = 'same-origin';
        response = await fetch(url, fetchOptions);
      }
      
      // If response still failed after retry, throw error
      if (!response.ok) {
        console.error(`[ERROR] Stream request failed: ${response.status} ${response.statusText}`);
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          // Try to get more error details from response
          const errorData = await response.text();
          errorMessage += ` - ${errorData}`;
        } catch (e) {
          // Just use the status text if we can't get more details
          errorMessage += ` - ${response.statusText}`;
        }
        
        throw new ApiError({
          status: response.status,
          statusText: response.statusText,
          message: errorMessage
        });
      }
      
      console.log(`[DEBUG] ApiClient.stream: Connection established, processing stream`);
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log(`[DEBUG] ApiClient.stream: Stream completed`);
          break;
        }
        
        // Decode the chunk and add it to the buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete events from the buffer
        console.log(`[DEBUG] ApiClient.stream: Buffer size: ${buffer.length} bytes`);
        
        // Split on double newlines which is the SSE protocol separator
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep the last incomplete chunk in the buffer
        
        console.log(`[DEBUG] ApiClient.stream: Processing ${lines.length} SSE events`);
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          console.log(`[DEBUG] ApiClient.stream: Processing line: ${line.substring(0, 50)}...`);
          
          // Split by newlines in case we get multiple data: lines in one SSE message
          const dataLines = line.split('\n');
          
          // Process each data line
          for (const dataLine of dataLines) {
            // Skip empty lines
            if (dataLine.trim() === '') continue;
            
            // Extract content after "data: " prefix
            const dataContent = dataLine.replace(/^data:\s*/, '').trim();
            
            console.log(`[DEBUG] ApiClient.stream: Data content: ${dataContent.substring(0, 30)}...`);
            
            if (dataContent === '[DONE]') {
              console.log(`[DEBUG] ApiClient.stream: Received [DONE] signal`);
              onComplete();
              return;
            }
            
            try {
              const parsedData = JSON.parse(dataContent);
              console.log(`[DEBUG] ApiClient.stream: Successfully parsed JSON data`);
              onChunk(parsedData);
            } catch (e) {
              console.warn('[WARNING] Error parsing SSE chunk:', dataContent);
              console.error(e);
            }
          }
        }
      }
      
      console.log(`[DEBUG] ApiClient.stream: Completing stream after all chunks processed`);
      onComplete();
    } catch (error: unknown) {
      console.error(`[ERROR] ApiClient.stream: Stream error:`, error);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
