import { RolUsuario } from '@prisma/client';

export type AuthUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
};
