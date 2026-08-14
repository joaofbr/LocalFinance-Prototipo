import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.localfinance.app',
  appName: 'LocalFinance',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
