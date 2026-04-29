import API from './axiosConfig';

export const loginUser = (credentials) => {
  return API.post('/auth/login', credentials);
};

export const registerUser = (userData) => {
  return API.post('/auth/register', userData);
};

export const getCurrentUser = () => {
  return API.get('/auth/me');
};