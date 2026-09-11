import type { Configuration, RedirectRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'e8530b7c-5661-410c-a217-49c518f371ca',
    authority: 'https://login.microsoftonline.com/organizations',
    redirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
    postLogoutRedirectUri: window.location.origin + '/login',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true, 
  },
};

export const loginRequest: RedirectRequest = {
  scopes: ['User.Read'],
  prompt: 'select_account',
  extraQueryParameters: {
    domain_hint: 'organizations',
  },
};