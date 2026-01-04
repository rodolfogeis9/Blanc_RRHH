import api from './client';

export type RemunerationItem = {
  id: string;
  periodo: string;
  fechaPago?: string | null;
  montoLiquido?: number | null;
  montoBruto?: number | null;
  estado: string;
  documentoId: string;
  documento: {
    id: string;
    nombreArchivoOriginal: string;
    mimeType: string;
  };
};

export const fetchMyRemunerations = async () => {
  const { data } = await api.get<RemunerationItem[]>('/remuneraciones/me');
  return data;
};

export const fetchRemunerationsAdmin = async (filters?: { empleadoId?: string; periodo?: string }) => {
  const { data } = await api.get<RemunerationItem[]>('/remuneraciones', {
    params: { employeeId: filters?.empleadoId, periodo: filters?.periodo },
  });
  return data;
};

export const publishRemuneration = async (
  employeeId: string,
  payload: {
    periodo: string;
    fechaPago?: string;
    montoLiquido?: number;
    montoBruto?: number;
    documentoId?: string;
    archivo?: File;
  }
) => {
  const formData = new FormData();
  formData.append('periodo', payload.periodo);
  if (payload.fechaPago) formData.append('fechaPago', payload.fechaPago);
  if (payload.montoLiquido !== undefined) formData.append('montoLiquido', String(payload.montoLiquido));
  if (payload.montoBruto !== undefined) formData.append('montoBruto', String(payload.montoBruto));
  if (payload.documentoId) formData.append('documentoId', payload.documentoId);
  if (payload.archivo) formData.append('archivo', payload.archivo);
  const { data } = await api.post(`/remuneraciones/${employeeId}`, formData);
  return data;
};

export const annulRemuneration = async (id: string) => {
  const { data } = await api.patch(`/remuneraciones/${id}/anular`);
  return data;
};
