/**
 * Service Discovery Client for Paradyze v2
 * 
 * This module provides a client interface to interact with the service registry.
 * It allows services to register themselves and discover other services.
 */

import env from './env';

// Default registry URL with fallback
const REGISTRY_URL = env.SERVICE_REGISTRY_URL || 'http://localhost:3999';

/**
 * Register a service with the registry
 * 
 * @param {string} serviceName - Unique name for the service
 * @param {string} url - URL where the service can be reached
 * @param {Object} metadata - Optional metadata about the service
 * @returns {Promise<Object>} - Registration result
 */
export const registerService = async (serviceName, url, metadata = {}) => {
  try {
    console.log(`Registering service '${serviceName}' at ${url}`);
    
    const response = await fetch(`${REGISTRY_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceName, url, metadata })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Registration failed: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Service '${serviceName}' registered successfully`);
    return result;
  } catch (error) {
    console.error(`Failed to register service '${serviceName}':`, error);
    // Don't throw, as we want to continue even if registration fails
    return { success: false, error: error.message };
  }
};

/**
 * Unregister a service from the registry
 * 
 * @param {string} serviceName - Name of the service to unregister
 * @returns {Promise<Object>} - Unregistration result
 */
export const unregisterService = async (serviceName) => {
  try {
    const response = await fetch(`${REGISTRY_URL}/unregister`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceName })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Unregistration failed: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Service '${serviceName}' unregistered successfully`);
    return result;
  } catch (error) {
    console.error(`Failed to unregister service '${serviceName}':`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get service information from the registry
 * 
 * @param {string} serviceName - Name of the service to look up
 * @returns {Promise<string>} - Service URL
 */
export const getServiceUrl = async (serviceName) => {
  try {
    console.log(`Looking up service '${serviceName}'`);
    
    const response = await fetch(`${REGISTRY_URL}/service/${serviceName}`);
    
    if (!response.ok) {
      // If not found in registry, try environment variables
      const envVarName = `${serviceName.replace(/-/g, '_').toUpperCase()}_URL`;
      const fallbackUrl = env[envVarName];
      
      if (fallbackUrl) {
        console.log(`Service '${serviceName}' not found in registry, using env var ${envVarName}: ${fallbackUrl}`);
        return fallbackUrl;
      }
      
      // Try port-based fallback as last resort
      const portMapping = {
        'frontend': 3000,
        'integration-api': 3001,
        'api': 3002,
        'openrouter-proxy': 3003,
        'elizaos-runtime': 3005
      };
      
      if (portMapping[serviceName]) {
        const fallbackUrl = `http://localhost:${portMapping[serviceName]}`;
        console.log(`Service '${serviceName}' not found in registry, using fallback port: ${fallbackUrl}`);
        return fallbackUrl;
      }
      
      throw new Error(`Service '${serviceName}' not found and no fallback available`);
    }
    
    const service = await response.json();
    console.log(`Found service '${serviceName}' at ${service.url}`);
    return service.url;
  } catch (error) {
    console.error(`Failed to discover service '${serviceName}':`, error);
    throw error;
  }
};

/**
 * List all registered services
 * 
 * @returns {Promise<Object>} - Object with service names as keys and service info as values
 */
export const listServices = async () => {
  try {
    const response = await fetch(`${REGISTRY_URL}/services`);
    
    if (!response.ok) {
      throw new Error(`Failed to list services: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to list services:', error);
    return {};
  }
};

// Export default object for convenient imports
export default {
  registerService,
  unregisterService,
  getServiceUrl,
  listServices
};
