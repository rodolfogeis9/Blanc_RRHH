import api from './client';

export type JobItem = {
  id: string;
  empresa: string;
  cargo: string;
  fechaInicio: string;
  fechaFin?: string | null;
  descripcion?: string | null;
};

export const fetchMyJobs = async () => {
  const { data } = await api.get<JobItem[]>('/antecedentes-laborales/me');
  return data;
};

export const createJob = async (payload: Omit<JobItem, 'id'>) => {
  const { data } = await api.post('/antecedentes-laborales/me', payload);
  return data;
};

export const updateJob = async (id: string, payload: Partial<Omit<JobItem, 'id'>>) => {
  const { data } = await api.put(`/antecedentes-laborales/me/${id}`, payload);
  return data;
};

export const deleteJob = async (id: string) => {
  const { data } = await api.delete(`/antecedentes-laborales/me/${id}`);
  return data;
};
