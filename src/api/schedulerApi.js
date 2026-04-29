import API from './axiosConfig';

export const getSchedulerStatus = () => {
  return API.get('/scheduler/status');
};

export const triggerScheduler = () => {
  return API.post('/scheduler/trigger');
};

export const getSchedulerHistory = () => {
  return API.get('/scheduler/history');
};