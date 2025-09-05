// API Configuration
const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Check if we're running in Docker (nginx proxy setup)
  // In Docker, nginx handles API proxying, so we use relative URLs
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    // When running via nginx proxy in Docker, use empty string for relative URLs
    return '';
  }

  // Environment-based defaults
  const environment = import.meta.env.MODE || 'development';
  
  if (environment === 'production') {
    // Production API URL - Update this with your actual backend URL
    return 'https://ai-evaluator-backend.eastus.azurecontainer.io:8000';
  }
  
  // Development default (when running locally with npm run dev)
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// API utility function for making requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Convenience function to replace existing fetch calls
export const apiFetch = (endpoint: string, options?: RequestInit) => {
  return apiRequest(endpoint, options);
};

export default {
  API_BASE_URL,
  apiRequest,
};