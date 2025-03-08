/**
 * Core API Types for Paradyze v2
 * Contains all shared type definitions for the API client library
 */

// HTTP Methods supported by the API client
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Basic headers interface
export interface Headers {
  [key: string]: string;
}

// Base request options
export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Headers;
  signal?: AbortSignal;
}

// Options for GET requests
export interface GetOptions extends RequestOptions {}

// Options for POST/PUT/PATCH requests
export interface MutationOptions<T = unknown> extends RequestOptions {
  data: T;
}

// API Error response
export interface ApiErrorResponse {
  status: number;
  statusText: string;
  data?: any;
  message?: string;
}

// API Error class
export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;

  constructor(response: ApiErrorResponse) {
    super(response.message || `API Error: ${response.status} ${response.statusText}`);
    this.name = 'ApiError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = response.data;
  }
}

// Generic API response structure
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

// StreamingOptions for endpoints that support streaming
export interface StreamingOptions extends RequestOptions {
  onChunk: (chunk: any) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}
