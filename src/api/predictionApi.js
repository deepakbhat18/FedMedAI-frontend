
import API from './axiosConfig';

export const makePrediction = (data) => {
  return API.post('/predictions', data);
};

export const getPredictionById = (id) => {
  return API.get(`/predictions/${id}`);
};

export const getPredictionsByPatient = (patientId) => {
  return API.get(`/predictions/patient/${patientId}`);
};

export const getPredictionsByHospital = (hospitalId) => {
  return API.get(`/predictions/hospital/${hospitalId}`);
};

export const getPredictionAnalytics = () => {
  return API.get('/predictions/analytics');
};

export const downloadPDFReport = async (patientId, reportData) => {
  const response = await API.post(
    `/predictions/report/${patientId}`,
    reportData,
    { responseType: 'blob' }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `medical_report_${patientId}.pdf`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getPatientTimeline = (patientId) => {
  return API.get(`/predictions/patient/${patientId}/timeline`);
};