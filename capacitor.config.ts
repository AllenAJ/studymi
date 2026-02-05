import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studymi.app',
  appName: 'Studymi',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    backgroundColor: '#F5F5F7',
    preferredContentMode: 'mobile',
  },
  server: {
    iosScheme: 'capacitor',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#F5F5F7",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#0E1A2B",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
