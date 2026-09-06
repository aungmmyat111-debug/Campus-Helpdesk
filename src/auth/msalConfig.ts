import type { Configuration, RedirectRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'e8530b7c-5661-410c-a217-49c518f371ca',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
    postLogoutRedirectUri: 'http://localhost:5173/login',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true, 
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['User.Read'],
  prompt: 'select_account', 
};