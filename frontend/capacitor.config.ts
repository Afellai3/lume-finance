import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.lumefinance.app',
  appName: 'Lume Finance',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    // Use custom network security config
    resources: ['android-resources'],
  },
};

export default config;
