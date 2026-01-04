import api from './client';
import { Role } from '../context/AuthContext';

export type LoginResponse = {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: Role;
  };
};

export const loginRequest = async (email: string, password: string) => {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
};

export const forgotPasswordRequest = async (email: string) => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPasswordRequest = async (email: string, code: string, password: string) => {
  await api.post('/auth/reset-password', { email, code, password });
};

export type InvitationValidation = {
  email: string;
  role: Role;
  jobRoleName: string;
};

export const validateInvitationRequest = async (token: string) => {
  const { data } = await api.get<InvitationValidation>('/auth/invitations/validate', { params: { token } });
  return data;
};

export const acceptInvitationRequest = async (payload: {
  token: string;
  password: string;
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  fechaIngreso: string;
  area: string;
}) => {
  const { data } = await api.post('/auth/invitations/accept', payload);
  return data;
};
