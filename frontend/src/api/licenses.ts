import api from './client';

export type LicenseItem = {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: string;
  urlArchivoLicencia: string;
  observaciones?: string | null;
};

export const fetchMyLicenses = async () => {
  const { data } = await api.get<LicenseItem[]>('/licencias/mias');
  return data;
};
