import { useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { apiRequest } from '../config/api';

interface UseApiReturn {
  authenticatedRequest: (endpoint: string, options?: RequestInit) => Promise<Response>;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useApi = (): UseApiReturn => {
  const { isAuthenticated, loading } = useAuth();

  const authenticatedRequest = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    try {
      // Skip authentication for development - make unauthenticated requests
      console.log('Making unauthenticated request for development');
      
      // Ensure no Authorization header is present
      const cleanOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
        }
      };
      
      // Remove any Authorization header if it exists
      if (cleanOptions.headers && 'Authorization' in cleanOptions.headers) {
        delete (cleanOptions.headers as any).Authorization;
      }
      
      return await apiRequest(endpoint, cleanOptions);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }, []);

  return {
    authenticatedRequest,
    isAuthenticated,
    loading
  };
};