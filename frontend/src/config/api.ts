/**
 * API Configuration
 * Centralizes API URL management for web and mobile
 */

// Detect if running in Capacitor (native mobile app)
const isCapacitor = () => {
  return window.location.protocol === 'capacitor:' || 
         window.location.protocol === 'ionic:';
};

/**
 * Get API base URL based on environment
 * Priority:
 * 1. VITE_API_URL environment variable (for production/staging)
 * 2. If Capacitor: use IP address or deployed backend
 * 3. If web dev: use Vite proxy (/api routes to localhost:8000)
 */
export const getApiUrl = (): string => {
  // Check environment variable first
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // Mobile app: needs explicit URL
  if (isCapacitor()) {
    // Option 1: Use deployed backend (recommended for production)
    // return 'https://your-backend.onrender.com';
    
    // Option 2: Use local IP for development
    // Replace with your actual IP address (find with: ipconfig on Windows)
    // return 'http://192.168.1.10:8000';
    
    // Fallback: assume deployed backend
    return 'https://lume-finance-api.onrender.com';
  }

  // Web development: use relative path (Vite proxy handles it)
  return '';
};

/**
 * Make API request with proper URL handling
 */
export const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Export convenience methods
export const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};
