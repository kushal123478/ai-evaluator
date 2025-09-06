import { Configuration, PopupRequest, RedirectRequest } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || '',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
};

// Add scopes for your API
export const loginRequest: RedirectRequest = {
  scopes: ['openid', 'profile', 'email', `api://${import.meta.env.VITE_AZURE_CLIENT_ID}/access_as_user`]
};

export const silentRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', `api://${import.meta.env.VITE_AZURE_CLIENT_ID}/access_as_user`],
  prompt: 'none'
};

// Graph API scopes (optional, for additional user info)
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me'
};