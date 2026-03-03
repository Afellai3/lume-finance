import { Capacitor } from '@capacitor/core';

// Get API base URL from environment or use relative path for web
const getApiUrl = (): string => {
  if (Capacitor.isNativePlatform()) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.error('VITE_API_URL not configured in .env file');
      return 'http://localhost:8000';
    }
    console.log('🔗 Capacitor API URL:', apiUrl);
    return apiUrl;
  }
  console.log('🌐 Web mode: using relative API paths');
  return '';
};

const API_BASE_URL = getApiUrl();
const TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 2;

// Track errors to avoid alert spam
let lastErrorTime = 0;
const ERROR_THROTTLE_MS = 5000; // Max 1 alert every 5 seconds

const showError = (message: string) => {
  const now = Date.now();
  if (Capacitor.isNativePlatform() && now - lastErrorTime > ERROR_THROTTLE_MS) {
    alert(message);
    lastErrorTime = now;
  }
};

// Fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout: richiesta troppo lenta');
    }
    throw error;
  }
};

// Retry logic
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> => {
  try {
    return await fetchWithTimeout(url, options);
  } catch (error) {
    if (retries > 0) {
      console.warn(`🔄 Retry ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} for ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// Centralized API client
export const api = {
  async get(endpoint: string) {
    try {
      console.log(`📡 API GET: ${API_BASE_URL}${endpoint}`);
      const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`✅ API GET success: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API GET ${endpoint} failed:`, error);
      throw error; // Don't show alert for every failed request
    }
  },

  async post(endpoint: string, data?: any) {
    try {
      console.log(`📡 API POST: ${API_BASE_URL}${endpoint}`);
      const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      showError(`Errore salvando: ${error instanceof Error ? error.message : 'Verifica backend'}`);
      throw error;
    }
  },

  async put(endpoint: string, data?: any) {
    try {
      console.log(`📡 API PUT: ${API_BASE_URL}${endpoint}`);
      const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      showError(`Errore aggiornando: ${error instanceof Error ? error.message : 'Verifica backend'}`);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      console.log(`📡 API DELETE: ${API_BASE_URL}${endpoint}`);
      const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      const result = text ? JSON.parse(text) : {};
      console.log(`✅ API DELETE success: ${endpoint}`);
      return result;
    } catch (error) {
      console.error(`❌ API DELETE ${endpoint} failed:`, error);
      showError(`Errore eliminando: ${error instanceof Error ? error.message : 'Verifica backend'}`);
      throw error;
    }
  },

  getUrl(): string {
    return API_BASE_URL;
  },
};

export default api;
