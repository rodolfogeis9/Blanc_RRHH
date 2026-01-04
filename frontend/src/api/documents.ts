import api from './client';

export type DocumentItem = {
  id: string;
  tipoDocumento: string;
  visibilidad: string;
  periodo?: string | null;
  nombreArchivoOriginal: string;
  mimeType: string;
  fechaSubida: string;
};

export const fetchMyDocuments = async (filters?: { tipoDocumento?: string; periodo?: string }) => {
  const { data } = await api.get<DocumentItem[]>('/documentos/me', { params: filters });
  return data;
};

export const fetchEmployeeDocuments = async (employeeId: string, filters?: { tipoDocumento?: string; periodo?: string }) => {
  const { data } = await api.get<DocumentItem[]>(`/documentos/empleados/${employeeId}`, { params: filters });
  return data;
};

export const uploadEmployeeDocument = async (
  employeeId: string,
  payload: { tipoDocumento: string; periodo?: string; visibilidad?: string; archivo: File }
) => {
  const formData = new FormData();
  formData.append('tipoDocumento', payload.tipoDocumento);
  if (payload.periodo) formData.append('periodo', payload.periodo);
  if (payload.visibilidad) formData.append('visibilidad', payload.visibilidad);
  formData.append('archivo', payload.archivo);
  const { data } = await api.post(`/documentos/empleados/${employeeId}`, formData);
  return data;
};

export const deleteDocument = async (documentId: string) => {
  const { data } = await api.delete(`/documentos/${documentId}`);
  return data;
};

export const downloadDocumentBlob = async (documentId: string) => {
  const { data } = await api.get(`/documentos/${documentId}/download`, { responseType: 'blob' });
  return data as Blob;
};
