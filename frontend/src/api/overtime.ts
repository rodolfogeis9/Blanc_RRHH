import api from './client';

export type OvertimeItem = {
  id: string;
  fecha: string;
  horas: number;
  motivo?: string | null;
  estado: string;
  comentarioRevision?: string | null;
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
    area: string;
    cargo: string;
  };
};

export const fetchMyOvertime = async () => {
  const { data } = await api.get<OvertimeItem[]>('/horas-extras/me');
  return data;
};

export const createOvertime = async (payload: { fecha: string; horas: number; motivo?: string }) => {
  const { data } = await api.post('/horas-extras/me', payload);
  return data;
};

export const fetchOvertimeRequests = async (filters?: { estado?: string; empleadoId?: string }) => {
  const { data } = await api.get<OvertimeItem[]>('/horas-extras/requests', { params: filters });
  return data;
};

export const approveOvertime = async (id: string) => {
  const { data } = await api.put(`/horas-extras/${id}/approve`);
  return data;
};

export const rejectOvertime = async (id: string, comentario?: string) => {
  const { data } = await api.put(`/horas-extras/${id}/reject`, { comentario });
  return data;
};
