# Mapa del Sistema Blanc RRHH

## 🏗 Arquitectura
- **Frontend:** React + Vite + TypeScript + Chakra UI
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Base de Datos:** PostgreSQL (vía Docker)
- **Autenticación:** JWT (Access Token) + Roles

## 🧩 Módulos del Sistema

### 1. Autenticación (`/auth`)
- **Estado:** ✅ Funcional (Login, Recuperar contraseña)
- **Roles:** `ADMIN_DIRECCION`, `ADMIN_RRHH`, `EMPLEADO`
- **Guards:** `ProtectedRoute` implementado y protegiendo rutas.

### 2. Gestión de Empleados (`/employees`)
- **Backend:** CRUD básico implementado.
- **Frontend:**
  - Lista de empleados (Admin) ✅
  - Perfil personal (Empleado) ✅
  - **Brecha:** Faltan sub-módulos de detalle (Estudios, Antecedentes, etc.).

### 3. Documentos (`/documents`)
- **Backend:** Modelo `Documento` existe. Subida implementada (StorageService híbrido local/fake).
- **Frontend:** Vista de documentos personales y subida por admin.
- **Brecha:** Visualización de archivos locales no servida públicamente (URLs apuntan a `./tmp`).

### 4. Vacaciones (`/vacations`)
- **Backend:** Solicitud, Aprobación/Rechazo y cálculo de días.
- **Frontend:** Formulario de solicitud y tabla de historial. Funcional.

### 5. Licencias Médicas (`/licenses`)
- **Backend:** Registro básico.
- **Frontend:** Listado implementado.

### 6. Auditoría (`/audit`)
- **Backend:** Registro de eventos críticos.
- **Frontend:** Vista de tabla para admins.

## 🚦 Estado de Pantallas y Funcionalidades

| Módulo | Pantalla | Ruta | Estado Actual | Brechas / Pendientes |
|--------|----------|------|---------------|----------------------|
| **Auth** | Login | `/login` | ✅ Funcional | - |
| **Auth** | Reset Password | `/reset-password` | ✅ Funcional | - |
| **Portal** | Dashboard | `/portal` | ✅ Funcional | KPIs/Widgets reales pendientes |
| **Portal** | Perfil Personal | `/portal/mis-datos` | ✅ Funcional | Solo datos básicos. |
| **Portal** | Estudios | `/portal/educacion` | ⚠️ Placeholder | **Falta tabla en BD y CRUD completo** |
| **Portal** | Antecedentes | `/portal/antecedentes-laborales` | ⚠️ Placeholder | **Falta tabla en BD y CRUD completo** |
| **Portal** | Remuneraciones | `/portal/remuneraciones` | ⚠️ Placeholder | **Falta tabla en BD y CRUD completo** |
| **Portal** | Horas Extras | `/portal/horas-extras` | ⚠️ Placeholder | **Falta tabla en BD y CRUD completo** |
| **Portal** | Documentos | `/portal/documentos` | ⚠️ Parcial | La descarga/visor de archivos no funciona en local. |
| **Admin** | Gestión Empleados | `/admin/empleados` | ✅ Funcional | - |
| **Admin** | Solicitudes | `/admin/solicitudes` | ✅ Funcional | Logic de flujo completo ok. |
| **Admin** | Auditoría | `/admin/auditoria` | ✅ Funcional | - |

## 📦 Modelos de Datos (Prisma)
- `Usuario`: Datos personales y laborales base.
- `Documento`: Relación con empleado y archivo.
- `SolicitudVacaciones`: Estado y fechas.
- `LicenciaMedica`: Tipos y fechas.
- `EventoAuditoria`: Log de seguridad.

**Faltantes Críticos en BD:**
- `Educacion`: Para registrar títulos y grados.
- `AntecedenteLaboral`: Experiencia previa.
- `Remuneracion`: Liquidaciones históricas (detalles).
- `HoraExtra`: Registro de horas.
