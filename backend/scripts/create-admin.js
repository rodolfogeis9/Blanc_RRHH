// backend/scripts/create-admin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'rodolfo.geis@gmail.com';
  const password = 'Blanc2024!';

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.usuario.upsert({
    where: { email },
    update: {}, // si ya existe no lo toca
    create: {
      email,
      passwordHash,

      // 👤 Datos personales
      nombre: 'Rodolfo',
      apellido: 'Geis Saez',
      rut: '17031318-6',
      fechaNacimiento: new Date('1989-04-28'),

      // 📱 Datos de contacto (ajusta si quieres)
      telefono: '+56999999999',
      direccion: 'Sin dirección definida',

      // 💼 Datos laborales básicos
      fechaIngreso: new Date('2024-01-01'),
      cargo: 'Administrador del sistema',
      area: 'Tecnología',
      estadoLaboral: 'ACTIVO',

      // 🌴 Vacaciones
      diasVacacionesAcumulados: 0,
      diasVacacionesTomados: 0,

      // 🖼️ Perfil
      urlFotoPerfil: null,
      resumenPerfilProfesional: 'Administrador inicial del sistema Blanc RRHH',

      // 🔐 Rol
      rol: 'ADMIN_DIRECCION', // o el enum que uses: 'ADMIN', 'EMPLEADO', etc.
    },
  });

  console.log('✅ Usuario creado / existente:', {
    id: user.id,
    email: user.email,
    rol: user.rol,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error creando usuario:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
