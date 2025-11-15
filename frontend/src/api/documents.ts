import api from './client';

export type DocumentItem = {
  id: string;
  tipoDocumento: string;
  periodo?: string | null;
  nombreArchivoOriginal: string;
  urlArchivo: string;
  fechaSubida: string;
};

export const fetchMyDocuments = async (filters?: { tipoDocumento?: string; periodo?: string }) => {
  const { data } = await api.get<DocumentItem[]>('/documentos/mios', { params: filters });
  return data;
};
