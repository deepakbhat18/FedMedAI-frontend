import API from './axiosConfig';

export const getAllPatients = () => {
  return API.get('/patients');
};

export const getPatientById = (id) => {
  return API.get(`/patients/${id}`);
};

export const getPatientsByHospital = (hospitalId) => {
  return API.get(`/patients/hospital/${hospitalId}`);
};

export const createPatient = (data) => {
  return API.post('/patients', data);
};

export const updatePatient = (id, data) => {
  return API.put(`/patients/${id}`, data);
};

export const deletePatient = (id) => {
  return API.delete(`/patients/${id}`);
};