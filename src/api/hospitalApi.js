
import API from './axiosConfig';

export const getAllHospitals = () => {
  return API.get('/hospitals');
};

export const getHospitalById = (id) => {
  return API.get(`/hospitals/${id}`);
};

export const createHospital = (data) => {
  return API.post('/hospitals', data);
};

export const updateHospital = (id, data) => {
  return API.put(`/hospitals/${id}`, data);
};

export const deleteHospital = (id) => {
  return API.delete(`/hospitals/${id}`);
};

export const emailPatientReport = (hospitalId, data) => {
  return API.post(`/hospitals/${hospitalId}/email-report`, data);
};