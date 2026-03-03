import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App'
import './styles/global.css'
import './index.css'

// Global fetch patch: on native (Android/iOS), automatically prepend
// the backend IP to all /api/ calls. This fixes all pages that use
// fetch('/api/...') directly without going through api.ts
if (Capacitor.isNativePlatform()) {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  if (API_BASE) {
    const originalFetch = window.fetch.bind(window);
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        input = `${API_BASE}${input}`;
      } else if (input instanceof Request && input.url.startsWith('/api/')) {
        input = new Request(`${API_BASE}${input.url}`, input);
      }
      return originalFetch(input, init);
    };
    console.log('🔧 Global fetch patch active - API base:', API_BASE);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
