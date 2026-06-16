import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import { queryClient } from './lib/queryClient.js'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { WeightUnitProvider } from './context/WeightUnitContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { supabaseConfigured } from './lib/supabase.js'
import './index.css'

if (!supabaseConfigured) {
  document.getElementById('root').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1C1A18;color:#F0EBE3;font-family:system-ui;text-align:center;padding:24px;">
      <div>
        <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:8px;">Brick needs configuration</h1>
        <p style="color:#8C8078;font-size:0.875rem;max-width:360px;margin:0 auto;line-height:1.6;">
          Set <code style="color:#E85D3A;background:#2E2B28;padding:2px 6px;border-radius:4px;">VITE_SUPABASE_URL</code> and
          <code style="color:#E85D3A;background:#2E2B28;padding:2px 6px;border-radius:4px;">VITE_SUPABASE_ANON_KEY</code>
          in your environment, then redeploy.
        </p>
      </div>
    </div>
  `
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <WeightUnitProvider>
                <ToastProvider>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </ToastProvider>
              </WeightUnitProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
