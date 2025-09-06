// API Configuration
const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Check if we're running locally via npm dev server
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    // Local development via npm run dev
    return 'http://localhost:8000';
  }

  // Environment-based defaults
  const environment = import.meta.env.MODE || 'development';
  
  if (environment === 'production') {
    // Production API URL - Update this with your actual backend URL
    return 'http://ai-evaluator-backend.eastus.azurecontainer.io:8000';
  }
  
  // Development default (when running locally with npm run dev)
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// API utility function for making requests with authentication
export const apiRequest = async (endpoint: string, options: RequestInit = {}, accessToken?: string) => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add authorization header if token is provided
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const defaultOptions: RequestInit = {
    headers,
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