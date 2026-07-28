import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  apiUrl: string;
  responseEncryptionKey: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Minimal UI',
  appVersion: packageJson.version,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  responseEncryptionKey: import.meta.env.VITE_RESPONSE_ENCRYPTION_KEY || 'my-secure-fallback-encryption-key-32-chars!',
};
