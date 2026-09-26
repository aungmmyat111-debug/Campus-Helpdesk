import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

// Reads Azure Key Vault URL or defaults to a placeholder name
const keyVaultName = process.env.KEY_VAULT_NAME || "campus-helpdesk-kv";
const KVUri = `https://${keyVaultName}.vault.azure.net`;

// Initialize identity credential and Key Vault secret client
const credential = new DefaultAzureCredential();
const client = new SecretClient(KVUri, credential);

/**
 * Retrieves a secret from Azure Key Vault by name.
 * Falls back safely to local environment variables if Azure Key Vault is unreachable.
 */
export async function getSecret(secretName: string): Promise<string | undefined> {
  try {
    const secret = await client.getSecret(secretName);
    console.log(`[Azure Key Vault] Successfully retrieved secret: ${secretName}`);
    return secret.value;
  } catch (error) {
    console.warn(`[Azure Key Vault] Fallback to .env for: ${secretName}`, error);
    return process.env[secretName];
  }
}