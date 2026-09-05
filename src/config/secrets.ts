import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import dotenv from 'dotenv';

dotenv.config();

export interface AppSecrets {
  DATABASE_URL: string;
  JWT_SECRET: string;
  GROQ_API_KEY: string;
  P2P_SECRET: string;
  MY_NODE_ID: string;
  GROUP3_PEER_URL: string;
}

export const loadSecrets = async (): Promise<AppSecrets> => {
  // If running in local dev or without Key Vault URL, use local .env
  if (process.env.NODE_ENV !== 'production' || !process.env.AZURE_KEYVAULT_URL) {
    console.log('⚡ [Config] Running locally: Using local environment variables.');
    return {
      DATABASE_URL: process.env.DATABASE_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret',
      GROQ_API_KEY: process.env.GROQ_API_KEY || '',
      P2P_SECRET: process.env.P2P_SECRET || 'campus-p2p-shared-secret-2026',
      MY_NODE_ID: process.env.MY_NODE_ID || 'group-careaid',
      GROUP3_PEER_URL: process.env.GROUP3_PEER_URL || '',
    };
  }

  // Running on Azure / Linux VPS: Fetch secrets from Azure Key Vault
  try {
    console.log(`🔒 [Key Vault] Connecting to: ${process.env.AZURE_KEYVAULT_URL}`);
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(process.env.AZURE_KEYVAULT_URL, credential);

    const [dbUrl, jwtSec, groqKey, p2pSec] = await Promise.all([
      client.getSecret('DATABASE-URL'),
      client.getSecret('JWT-SECRET'),
      client.getSecret('GROQ-API-KEY'),
      client.getSecret('P2P-SECRET').catch(() => ({ value: 'campus-p2p-shared-secret-2026' })),
    ]);

    return {
      DATABASE_URL: dbUrl.value || '',
      JWT_SECRET: jwtSec.value || '',
      GROQ_API_KEY: groqKey.value || '',
      P2P_SECRET: p2pSec?.value || 'campus-p2p-shared-secret-2026',
      MY_NODE_ID: process.env.MY_NODE_ID || 'group-careaid',
      GROUP3_PEER_URL: process.env.GROUP3_PEER_URL || '',
    };
  } catch (error) {
    console.error('❌ [Key Vault] Failed to load runtime secrets:', error);
    throw error;
  }
};