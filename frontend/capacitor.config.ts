import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.lumefinance.app',
  appName: 'Lume Finance',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow HTTP connections (needed for local IP testing)
    cleartext: true,
    // Optional: for development with live reload
    // Uncomment and set your local IP when testing
    // url: 'http://192.168.1.10:3000',
  },
  android: {
    // Allow mixed content (HTTP API calls from HTTPS app)
    allowMixedContent: true,
  },
};

export default config;
