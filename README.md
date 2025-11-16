# Blanc RRHH

Plataforma integral de recursos humanos para la clínica estética **Blanc**. El sistema centraliza la gestión de datos personales, contratos y documentos laborales, vacaciones, licencias médicas y eventos de auditoría cumpliendo con los requerimientos de seguridad y usabilidad descritos por la clínica.

## Estructura del repositorio

```
.
├── backend   # API REST construida con Node.js + Express + Prisma
└── frontend  # Single Page Application en React + Chakra UI
```

## Requisitos previos

* Node.js 20+
* npm 9+
* Base de datos PostgreSQL
* Cuenta de Google Cloud Platform con acceso a Cloud Run, Cloud SQL y Cloud Storage (para despliegues)

## Backend (`/backend`)

### Variables de entorno

Copiar `.env.example` a `.env` y ajustar los valores:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL (Cloud SQL o local). |
| `JWT_SECRET` | Clave utilizada para firmar los tokens JWT. |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los JWT (ej. `8h`). |
| `PASSWORD_RESET_TOKEN_MINUTES` | Minutos de validez de los tokens de recuperación. |
| `GCS_BUCKET` | Bucket de Google Cloud Storage para archivos. Si se deja vacío, se utiliza almacenamiento temporal local. |
| `GCS_BASE_FOLDER` | Carpeta base dentro del bucket. |
| `FRONTEND_BASE_URL` | URL pública del frontend (usada en enlaces de recuperación). |
| `PORT` | Puerto de escucha del servidor HTTP. |

### Scripts disponibles

```bash
npm run dev        # Ejecuta la API en modo desarrollo con recarga
npm run build      # Compila a JavaScript (carpeta dist)
npm run start      # Arranca la API usando los archivos compilados
npm run migrate    # Ejecuta las migraciones de Prisma en el entorno actual
npm run prisma:generate # Genera el cliente de Prisma
npm run prisma:studio   # Abre Prisma Studio para inspeccionar datos
```

### Esquema de datos

El archivo [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) define los modelos solicitados: usuarios/empleados, documentos, solicitudes de vacaciones, licencias médicas, eventos de auditoría y tokens de recuperación. El saldo de vacaciones se calcula combinando los días acumulados manualmente (`diasVacacionesAcumulados`) y el cálculo automático basado en fecha de ingreso (`1.25` días por mes completo), restando los días consumidos (`diasVacacionesTomados`).

### Principales módulos

* **Autenticación** (`/auth`): login, recuperación y reseteo de contraseña con JWT y tokens de un solo uso.
* **Empleados** (`/empleados`): perfiles, alta y edición de datos laborales, ajustes manuales de vacaciones.
* **Documentos** (`/documentos`): subida controlada por tipo y periodo, con validación de formatos (PDF/JPG/PNG) y registro en auditoría.
* **Solicitudes de vacaciones** (`/solicitudes-vacaciones`): creación por parte del empleado, aprobación/rechazo con impacto en saldo y auditoría.
* **Licencias médicas** (`/licencias`): registro con subida de archivos, detección de solapamientos con vacaciones y marca de alerta.
* **Auditoría** (`/auditoria`): consulta paginada accesible para RRHH y Dirección.

Todos los endpoints están protegidos con middlewares de autenticación y verificación de roles (`ADMIN_RRHH`, `ADMIN_DIRECCION`, `EMPLEADO`).

### Migraciones y base de datos

Para ejecutar las migraciones iniciales:

```bash
cd backend
npm install          # Instalar dependencias (requerido en el entorno local)
npm run prisma:generate
npm run migrate
```

## Frontend (`/frontend`)

### Variables de entorno

Copiar `.env.example` a `.env` y definir la URL de la API:

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base de la API (ej. `http://localhost:4000`). |

### Scripts disponibles

```bash
npm run dev     # Levanta Vite en modo desarrollo (http://localhost:5173)
npm run build   # Genera el build de producción en dist/
npm run preview # Sirve el build para validación local
```

### Tecnologías y lineamientos de UI

* React + TypeScript + Vite.
* Chakra UI como librería de componentes, con un tema basado en la paleta oficial proporcionada (azul Blanc `#0D3B66`, secundarios clínicos y acentos pastel).
* React Router para ruteo y React Query para manejo de datos remotos y estados de carga.
* Formularios gestionados con React Hook Form y validaciones con Zod.
* Layout responsivo y accesible, con tipografía limpia y espacios generosos. El header incluye un placeholder para el logo; coloca el archivo `logo.png` dentro de `frontend/src/assets/` para reemplazar el marcador.

### Módulos principales del frontend

* **Autenticación**: login, flujo de “olvidé mi contraseña” y reseteo.
* **Portal de empleado**: dashboard, datos personales editables, documentos descargables, solicitudes de vacaciones y licencias médicas.
* **Portal administrativo**: vistas para RRHH/Dirección con listados de empleados, gestión de solicitudes y consulta de auditoría.

Cada vista incluye estados de carga, mensajes claros y acciones visibles en línea con las guías de usabilidad solicitadas.

## Despliegue en Google Cloud Platform

1. **Base de datos**: crear una instancia de Cloud SQL (PostgreSQL) y actualizar `DATABASE_URL` con el string de conexión. Utilizar Cloud SQL Proxy o secretos de GCP para inyectar credenciales en Cloud Run.
2. **Almacenamiento de archivos**: crear un bucket en Cloud Storage. Definir `GCS_BUCKET` y configurar permisos de servicio para que el backend pueda subir archivos.
3. **Backend**: empaquetar la API usando Docker (ver `Dockerfile` sugerido a continuación) y desplegar en Cloud Run. Configurar variables de entorno y habilitar HTTPS.
4. **Frontend**: generar el build (`npm run build`) y publicar los archivos estáticos en un bucket de Cloud Storage o servirlos desde el backend si se prefiere un único servicio.

### Dockerfile sugerido para el backend

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
CMD ["node", "dist/server.js"]
```

Recuerda ejecutar las migraciones (`npm run migrate`) en cada despliegue o integrarlas en un job separado dentro del pipeline.

## Calidad y seguridad

* Los endpoints nunca exponen `passwordHash`.
* Se validan roles antes de cada operación sensible.
* Se limita el tamaño y tipo de archivo permitido en las cargas.
* Los errores se responden con códigos HTTP apropiados y mensajes consistentes.

## Próximos pasos sugeridos

* Integrar un servicio real de envío de correos (SendGrid, Mailgun, etc.).
* Implementar optimización de imágenes y firmas electrónicas.
* Añadir módulos adicionales como turnos o evaluaciones de desempeño.

---

> **Logo**: Utiliza el archivo facilitado en la carpeta de assets. La interfaz está preparada para mostrarlo en el encabezado de todas las vistas.
