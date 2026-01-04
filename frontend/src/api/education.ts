import api from './client';

export type EducationItem = {
  id: string;
  tipo: string;
  institucion: string;
  nombre: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  estado: string;
  descripcion?: string | null;
  documentoId?: string | null;
};

export const fetchMyEducation = async () => {
  const { data } = await api.get<EducationItem[]>('/educacion/me');
  return data;
};

export const createEducation = async (payload: Omit<EducationItem, 'id'>) => {
  const { data } = await api.post('/educacion/me', payload);
  return data;
};

export const updateEducation = async (id: string, payload: Partial<Omit<EducationItem, 'id'>>) => {
  const { data } = await api.put(`/educacion/me/${id}`, payload);
  return data;
};

export const deleteEducation = async (id: string) => {
  const { data } = await api.delete(`/educacion/me/${id}`);
  return data;
};
