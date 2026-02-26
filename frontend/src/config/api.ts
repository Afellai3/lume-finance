import { Capacitor } from '@capacitor/core';

// Get API base URL from environment or use relative path for web
const getApiUrl = (): string => {
  // In Capacitor (mobile app), use the configured API URL
  if (Capacitor.isNativePlatform()) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.error('VITE_API_URL not configured in .env file');
      return 'http://localhost:8000';
    }
    return apiUrl;
  }
  
  // In web browser, use relative paths (proxied by Vite dev server)
  return '';
};

const API_BASE_URL = getApiUrl();

// Centralized API client
export const api = {
  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  async post(endpoint: string, data?: any) {
    try {
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
      return await response.json();
    } catch (error) {
      console.error(`API POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  async put(endpoint: string, data?: any) {
    try {
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
      return await response.json();
    } catch (error) {
      console.error(`API PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      // DELETE might return empty response
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error(`API DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },

  // Helper to get the base URL (useful for download links, etc.)
  getUrl(): string {
    return API_BASE_URL;
  },
};

export default api;
