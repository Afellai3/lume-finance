import { Capacitor } from '@capacitor/core';

// Get API base URL from environment or use relative path for web
const getApiUrl = (): string => {
  // In Capacitor (mobile app), use the configured API URL
  if (Capacitor.isNativePlatform()) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.error('VITE_API_URL not configured in .env file');
      alert('⚠️ Errore di connessione al backend. Verifica che sia avviato su 10.0.0.233:8000');
      return 'http://localhost:8000';
    }
    console.log('🔗 Capacitor API URL:', apiUrl);
    return apiUrl;
  }
  
  // In web browser, use relative paths (proxied by Vite dev server)
  console.log('🌐 Web mode: using relative API paths');
  return '';
};

const API_BASE_URL = getApiUrl();

// Centralized API client
export const api = {
  async get(endpoint: string) {
    try {
      console.log(`📡 API GET: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`✅ API GET success: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API GET ${endpoint} failed:`, error);
      if (Capacitor.isNativePlatform()) {
        alert(`Errore di connessione: ${error instanceof Error ? error.message : 'Verifica backend'}`);
      }
      throw error;
    }
  },

  async post(endpoint: string, data?: any) {
    try {
      console.log(`📡 API POST: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log(`✅ API POST success: ${endpoint}`);
      return result;
    } catch (error) {
      console.error(`❌ API POST ${endpoint} failed:`, error);
      if (Capacitor.isNativePlatform()) {
        alert(`Errore salvando i dati: ${error instanceof Error ? error.message : 'Verifica backend'}`);
      }
      throw error;
    }
  },

  async put(endpoint: string, data?: any) {
    try {
      console.log(`📡 API PUT: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log(`✅ API PUT success: ${endpoint}`);
      return result;
    } catch (error) {
      console.error(`❌ API PUT ${endpoint} failed:`, error);
      if (Capacitor.isNativePlatform()) {
        alert(`Errore aggiornando i dati: ${error instanceof Error ? error.message : 'Verifica backend'}`);
      }
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      console.log(`📡 API DELETE: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      // DELETE might return empty response
      const text = await response.text();
      const result = text ? JSON.parse(text) : {};
      console.log(`✅ API DELETE success: ${endpoint}`);
      return result;
    } catch (error) {
      console.error(`❌ API DELETE ${endpoint} failed:`, error);
      if (Capacitor.isNativePlatform()) {
        alert(`Errore eliminando: ${error instanceof Error ? error.message : 'Verifica backend'}`);
      }
      throw error;
    }
  },

  // Helper to get the base URL (useful for download links, etc.)
  getUrl(): string {
    return API_BASE_URL;
  },
};

export default api;
