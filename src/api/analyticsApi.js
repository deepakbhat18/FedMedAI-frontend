import API from './axiosConfig';

export const getDashboardAnalytics = () => {
  return API.get('/analytics/dashboard');
};

export const getMLServiceHealth = () => {
  return API.get('/analytics/ml-service/health');
};

export const getAllTrainingLogs = () => {
  return API.get('/training-logs');
};

export const getTrainingLogsByRound = (round) => {
  return API.get(`/training-logs/round/${round}`);
};

export const getTrainingLogsByHospital = (hospitalId) => {
  return API.get(`/training-logs/hospital/${hospitalId}`);
};

export const getTrainingAnalytics = () => {
  return API.get('/training-logs/analytics');
};
export const getMLMetrics = () => {
  return API.get('/analytics/ml-metrics'); 
};