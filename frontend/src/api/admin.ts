import api from './client';
import { Role } from '../context/AuthContext';

export type EmployeeListItem = {
  id: string;
  nombre: string;
  apellido: string;
  area: string;
  cargo: string;
  estadoLaboral: string;
  fechaIngreso: string;
  saldoVacaciones: number;
};

export const fetchEmployees = async (params?: { nombre?: string; area?: string; estadoLaboral?: string }) => {
  const { data } = await api.get<EmployeeListItem[]>('/empleados', { params });
  return data;
};

export type VacationAdminRequest = {
  id: string;
  empleado: {
    id: string;
    nombre: string;
    apellido: string;
    area: string;
    cargo: string;
  };
  tipoSolicitud: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadDias: number;
  comentarioEmpleado?: string | null;
  comentarioAprobador?: string | null;
};

export const fetchVacationRequestsAdmin = async (params?: { estado?: string; empleadoId?: string; desde?: string; hasta?: string }) => {
  const { data } = await api.get<VacationAdminRequest[]>('/solicitudes-vacaciones', { params });
  return data;
};

export const approveVacationRequest = async (id: string, comentario?: string) => {
  const { data } = await api.put(`/solicitudes-vacaciones/${id}/aprobar`, { comentario });
  return data;
};

export const rejectVacationRequest = async (id: string, comentario?: string) => {
  const { data } = await api.put(`/solicitudes-vacaciones/${id}/rechazar`, { comentario });
  return data;
};

export type AuditEvent = {
  id: string;
  tipoEvento: string;
  entidadAfectada: string;
  entidadId: string;
  detalle: string;
  fechaEvento: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    rol: Role;
  };
};

export const fetchAuditEvents = async (params?: { usuarioId?: string; tipoEvento?: string; desde?: string; hasta?: string; page?: number; pageSize?: number }) => {
  const { data } = await api.get<{ total: number; page: number; pageSize: number; eventos: AuditEvent[] }>('/auditoria', { params });
  return data;
};
