import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axiosConfig';

export const usePatientsQuery = (hospitalId) => {
  return useQuery({
    queryKey: ['patients', hospitalId],
    queryFn: async () => {
      const url = hospitalId ? `/patients/hospital/${hospitalId}` : '/patients';
      const response = await API.get(url);
      return response.data.data;
    },
    staleTime: 60000,
  });
};

export const usePredictionsQuery = (patientId) => {
  return useQuery({
    queryKey: ['predictions', patientId],
    queryFn: async () => {
      const response = await API.get(`/predictions/patient/${patientId}`);
      return response.data.data;
    },
    enabled: !!patientId,
    staleTime: 30000,
  });
};

export const usePredictMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await API.post('/predictions', payload);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predictions', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
