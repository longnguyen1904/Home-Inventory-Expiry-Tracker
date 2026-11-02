import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const PUBLIC_API_URL = 'https://wfh-ta8-longmoi-8081.exp.direct/api/v1';

// In-memory token storage
let currentAuthToken = null;

// Automatically detect the Expo Dev Server host (Tunnel or LAN) so mobile always reaches Backend via port 8081 proxy
const getAutoDetectedBaseUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    if (window.location.port === '8081' || window.location.hostname.includes('exp.direct')) {
      return `${window.location.origin}/api/v1`;
    }
    return `http://${window.location.hostname}:5000/api/v1`;
  }

  // On Native (Expo Go iOS/Android), read hostUri from Expo Constants
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const cleanHost = hostUri.replace(/^(https?:\/\/|exp:\/\/)/, '').split('/')[0];
    const protocol = cleanHost.includes('exp.direct') || cleanHost.includes('ngrok') ? 'https' : 'http';
    return `${protocol}://${cleanHost}/api/v1`;
  }

  return PUBLIC_API_URL;
};

const DEFAULT_BASE_URL = getAutoDetectedBaseUrl();
let currentBaseUrl = DEFAULT_BASE_URL;

const apiClient = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Always attach the Bearer token
apiClient.interceptors.request.use(
  (config) => {
    if (currentAuthToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Treat non-JSON (HTML) responses as errors instead of silently "succeeding"
apiClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      const err = new Error('Máy chủ trả về HTML thay vì JSON – không kết nối được Backend API.');
      err.response = { status: 502, data: { success: false, message: err.message } };
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API 401 Unauthorized]:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  currentAuthToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => currentAuthToken;

export const setApiBaseUrl = (newUrl) => {
  currentBaseUrl = newUrl;
  apiClient.defaults.baseURL = newUrl;
};

export const getApiBaseUrl = () => currentBaseUrl;

export default apiClient;
