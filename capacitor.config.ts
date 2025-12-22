import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studymi.app',
  appName: 'Studymi',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#F5F5F7',
    preferredContentMode: 'mobile',
  },
  server: {
    iosScheme: 'capacitor',
  },
};

export default config;
