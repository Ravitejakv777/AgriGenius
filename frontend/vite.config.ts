import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

function chromeAccountsPlugin(): Plugin {
  return {
    name: 'vite-plugin-chrome-accounts',
    configureServer(server) {
      server.middlewares.use('/api/auth/google/detected-accounts', (_req, res) => {
        interface Account {
          name: string
          email: string
          role: 'admin' | 'farmer'
          isCurrent: boolean
          avatar?: string
        }

        let currentAccount: Account | null = null

        try {
          const homeDir = os.homedir()
          const chromeDir = path.join(homeDir, 'Library/Application Support/Google/Chrome')
          const localStatePath = path.join(chromeDir, 'Local State')
          
          let lastUsedProfile = 'Default'
          if (fs.existsSync(localStatePath)) {
            const ls = JSON.parse(fs.readFileSync(localStatePath, 'utf8'))
            lastUsedProfile = ls?.profile?.last_used || 'Default'
          }

          // 1. Read the CURRENT active Chrome profile Preferences
          const profPrefPath = path.join(chromeDir, lastUsedProfile, 'Preferences')
          if (fs.existsSync(profPrefPath)) {
            const pref = JSON.parse(fs.readFileSync(profPrefPath, 'utf8'))
            const accs = pref?.account_info || []
            if (accs.length > 0 && accs[0]?.email) {
              const acc = accs[0]
              currentAccount = {
                name: acc.full_name || acc.given_name || 'Raviteja',
                email: acc.email,
                role: acc.email.toLowerCase().includes('admin') ? 'admin' : 'farmer',
                isCurrent: true,
                avatar: ''
              }
            }
          }

          // 2. Fallback to Local State for that specific active profile
          if (!currentAccount && fs.existsSync(localStatePath)) {
            const ls = JSON.parse(fs.readFileSync(localStatePath, 'utf8'))
            const pdata = ls?.profile?.info_cache?.[lastUsedProfile]
            if (pdata?.user_name && pdata.user_name.includes('@')) {
              currentAccount = {
                name: pdata.gaia_name || pdata.name || 'Raviteja',
                email: pdata.user_name,
                role: pdata.user_name.toLowerCase().includes('admin') ? 'admin' : 'farmer',
                isCurrent: true,
                avatar: ''
              }
            }
          }
        } catch (err) {
          console.error('Error fetching current Chrome account:', err)
        }

        if (!currentAccount) {
          currentAccount = {
            name: 'Raviteja',
            email: 'ravitejakv777@gmail.com',
            role: 'farmer',
            isCurrent: true,
            avatar: ''
          }
        }

        // Return strictly the ONE current Chrome account
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(JSON.stringify([currentAccount]))
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    chromeAccountsPlugin()
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
