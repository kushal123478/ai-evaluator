import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  PublicClientApplication, 
  AccountInfo, 
  AuthenticationResult,
  SilentRequest,
  EndSessionRequest
} from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest } from './authConfig';

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL (this will be handled in the component)

// Auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Inner provider component (wrapped by MsalProvider)
const AuthProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const user = accounts[0] || null;

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && user) {
          await getAccessToken();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isAuthenticated, user]);

  const login = async () => {
    try {
      setLoading(true);
      const response = await instance.loginRedirect(loginRequest);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const logoutRequest: EndSessionRequest = {
        account: user,
        postLogoutRedirectUri: window.location.origin
      };
      setAccessToken(null);
      await instance.logoutRedirect(logoutRequest);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!user) {
      return null;
    }

    try {
      const silentRequest: SilentRequest = {
        scopes: loginRequest.scopes || [],
        account: user
      };

      const response: AuthenticationResult = await instance.acquireTokenSilent(silentRequest);
      setAccessToken(response.accessToken);
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      // If silent acquisition fails, try interactive
      try {
        const response: AuthenticationResult = await instance.acquireTokenPopup(loginRequest);
        setAccessToken(response.accessToken);
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Interactive token acquisition failed:', interactiveError);
        return null;
      }
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    accessToken,
    login,
    logout,
    getAccessToken,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Main provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </MsalProvider>
  );
};