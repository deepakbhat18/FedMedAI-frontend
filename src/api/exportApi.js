import API from './axiosConfig';

export const getExportStats = (hospitalId = null) => {
  const params = hospitalId ? { hospitalId } : {};
  return API.get('/export/stats', { params });
};

export const exportPatientsCsv = async (hospitalId = null) => {
  const params = hospitalId ? { hospitalId } : {};

  const response = await API.get('/export/patients', {
    params,
    responseType: 'blob',
  });

  const contentDisposition =
    response.headers['content-disposition'] || '';
  const filenameMatch =
    contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = filenameMatch
    ? filenameMatch[1].replace(/['"]/g, '')
    : `patients_export_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

  triggerDownload(response.data, filename, 'text/csv');
};

export const exportPredictionsCsv = async (hospitalId = null) => {
  const params = hospitalId ? { hospitalId } : {};

  const response = await API.get('/export/predictions', {
    params,
    responseType: 'blob',
  });

  const contentDisposition =
    response.headers['content-disposition'] || '';
  const filenameMatch =
    contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = filenameMatch
    ? filenameMatch[1].replace(/['"]/g, '')
    : `predictions_export_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

  triggerDownload(response.data, filename, 'text/csv');
};

const triggerDownload = (data, filename, mimeType) => {
  const url = window.URL.createObjectURL(
    new Blob([data], { type: mimeType })
  );
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};