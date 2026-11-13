import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.poupi.app',
  appName: 'Poupi',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
