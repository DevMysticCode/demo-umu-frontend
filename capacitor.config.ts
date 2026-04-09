import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.umovingu.app',
  appName: 'UMovingU',
  webDir: '.output/public',
  server: {
    // Remove this line if you build locally instead of loading from Vercel
    url: 'https://demo-umu-frontend.vercel.app',
    cleartext: false,
  },
  plugins: {
    GoogleAuth: {
      // iOS Client ID from Google Cloud Console (Credentials → iOS OAuth client)
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
      // Web Client ID (same one you use on the web)
      clientId: '869780740735-rlucf6t174rb3dljniqfj3ri2r0kg9cj.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      serverClientId: '869780740735-rlucf6t174rb3dljniqfj3ri2r0kg9cj.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
}

export default config
