import api from './client';
import { Role } from '../context/AuthContext';

export type EmployeeMeResponse = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: Role;
  telefono: string;
  direccion: string;
  area: string;
  cargo: string;
  estadoLaboral: string;
  fechaIngreso?: string;
  fechaNacimiento?: string;
  diasVacacionesAcumulados: number;
  diasVacacionesTomados: number;
  saldoVacaciones: number;
  totalVacaciones: number;
  pendingVacationRequests: number;
  pendingOvertimeRequests: number;
  lastRemuneration?: {
    id: string;
    periodo: string;
    documentoId: string;
    documento: {
      id: string;
      nombreArchivoOriginal: string;
      mimeType: string;
    };
  } | null;
  latestOvertime?: {
    id: string;
    fecha: string;
    horas: number;
    estado: string;
  } | null;
  resumenPerfilProfesional?: string;
  urlFotoPerfil?: string;
};

export const fetchMe = async () => {
  const { data } = await api.get<EmployeeMeResponse>('/empleados/me');
  return data;
};

export const updateProfile = async (payload: Partial<Pick<EmployeeMeResponse, 'telefono' | 'direccion' | 'urlFotoPerfil' | 'resumenPerfilProfesional'>>) => {
  const { data } = await api.put('/empleados/me', payload);
  return data;
};
