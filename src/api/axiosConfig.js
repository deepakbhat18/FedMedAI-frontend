import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
  console.warn('Unauthorized - token invalid or missing');

  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}
    return Promise.reject(error);
  }
);

export default API;