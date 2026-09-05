import type { Configuration, RedirectRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: '00000000-0000-0000-0000-000000000000', // Replace with real Azure AD Client ID when provided
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin + '/helpdesk/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['User.Read'],
};