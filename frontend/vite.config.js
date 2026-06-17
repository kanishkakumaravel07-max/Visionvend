import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import net from 'net'

// Helper to check if the backend port is already in use
const checkPort = (port) => {
  return new Promise((resolve) => {
    const client = net.connect({ port }, () => {
      client.end()
      resolve(true) // Port is in use
    })
    client.on('error', () => {
      resolve(false) // Port is free
    })
  })
}

// Vite plugin to start the Flask backend if not already running
const backendPlugin = () => {
  let pyProcess = null

  return {
    name: 'start-backend',
    async configureServer(server) {
      const backendDir = path.resolve(__dirname, '../backend')
      
      // Determine the backend port from backend/.env if available
      let port = 5000
      try {
        const envPath = path.join(backendDir, '.env')
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8')
          const match = envContent.match(/^PORT\s*=\s*(\d+)/m)
          if (match) {
            port = parseInt(match[1], 10)
          }
        }
      } catch (e) {
        // Fallback to 5000
      }

      const isBackendRunning = await checkPort(port)
      if (isBackendRunning) {
        console.log(`[Backend Sync] Flask backend is already running on port ${port}.`)
        return
      }

      console.log(`[Backend Sync] Flask backend is not running on port ${port}. Starting it automatically...`)
      
      // Determine python executable path (handle virtual environment if it exists)
      let pythonPath = 'python'
      const venvPythonWin = path.join(backendDir, 'venv', 'Scripts', 'python.exe')
      const venvPythonUnix = path.join(backendDir, 'venv', 'bin', 'python')
      
      if (fs.existsSync(venvPythonWin)) {
        pythonPath = venvPythonWin
      } else if (fs.existsSync(venvPythonUnix)) {
        pythonPath = venvPythonUnix
      }
      
      console.log(`[Backend Sync] Using Python executable: ${pythonPath}`)
      
      pyProcess = spawn(pythonPath, ['app.py'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: true
      })

      pyProcess.on('error', (err) => {
        console.error('[Backend Sync] Failed to start Flask backend:', err)
      })

      // Clean up the process when Vite server closes
      server.httpServer?.on('close', () => {
        if (pyProcess) {
          console.log('[Backend Sync] Stopping Flask backend...')
          pyProcess.kill()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), backendPlugin()],
})
