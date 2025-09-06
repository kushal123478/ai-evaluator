import { useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { apiRequest } from '../config/api';

interface UseApiReturn {
  authenticatedRequest: (endpoint: string, options?: RequestInit) => Promise<Response>;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useApi = (): UseApiReturn => {
  const { getAccessToken, isAuthenticated, loading } = useAuth();

  const authenticatedRequest = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    try {
      const accessToken = await getAccessToken();
      return await apiRequest(endpoint, options, accessToken || undefined);
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  }, [getAccessToken]);

  return {
    authenticatedRequest,
    isAuthenticated,
    loading
  };
};