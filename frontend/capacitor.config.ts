import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.lumefinance.app',
  appName: 'Lume Finance',
  webDir: 'dist',
  server: {
    androidScheme: 'http',  // Changed from 'https' to allow HTTP backend
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
