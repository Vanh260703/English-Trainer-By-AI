import axios from 'axios';

// Dev: '/api' → proxied qua Vite đến BE container
// Prod: VITE_API_URL = https://<render-app>.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // gửi kèm cookie khi cross-domain
});

// Attach access token from localStorage-backed memory
api.interceptors.request.use((config) => {
  const token = window.__accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === 'Access token expired' &&
      !original._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          queue.push({ resolve, reject })
        ).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh-token');
        window.__accessToken = data.accessToken;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        window.__accessToken = null;
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
