import React from 'react';
import ReactDOM from 'react-dom/client';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './auth/msalConfig';
import App from './App';
import './index.css';

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
  
  msalInstance.handleRedirectPromise().then((response) => {
    if (response) {
      msalInstance.setActiveAccount(response.account);
    } else {
      
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }
    }

    // Render the React app ONLY after redirect promise completes
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </React.StrictMode>
    );
  }).catch((error) => {
    console.error('MSAL Redirect Error:', error);
  });
});