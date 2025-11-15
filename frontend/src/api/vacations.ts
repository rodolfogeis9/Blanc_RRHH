import api from './client';

export type VacationRequest = {
  id: string;
  tipoSolicitud: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadDias: number;
  estado: string;
  fechaSolicitud: string;
  comentarioEmpleado?: string | null;
  comentarioAprobador?: string | null;
};

export const fetchMyVacationRequests = async () => {
  const { data } = await api.get<VacationRequest[]>('/solicitudes-vacaciones/mias');
  return data;
};

export const createVacationRequestApi = async (payload: {
  tipoSolicitud: 'VACACIONES' | 'PERMISO_DESCONTADO_DE_VACACIONES';
  fechaInicio: string;
  fechaFin: string;
  comentarioEmpleado?: string;
}) => {
  const { data } = await api.post<VacationRequest>('/solicitudes-vacaciones', payload);
  return data;
};
