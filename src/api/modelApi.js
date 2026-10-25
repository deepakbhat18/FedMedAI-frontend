import API from './axiosConfig';

export const getAllModels = () => {
  return API.get('/models');
};

export const getModelById = (id) => {
  return API.get(`/models/${id}`);
};

export const getLatestModel = () => {
  return API.get('/models/latest');
};

export const triggerTraining = (data) => {
  const requestData = {
    hospitalIds: data.hospitalIds || [1, 2, 3],
    epochs: data.epochs || 5,
    learningRate: data.learningRate || 0.01,
    batchSize: data.batchSize || 32,
    engine: data.engine || 'custom',
    numRounds: data.numRounds || 3,
  };

  if (data.dpEpsilon) {
    requestData.dpEpsilon = data.dpEpsilon;
  }

  return API.post('/models/trigger-training', requestData);
};