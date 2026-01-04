# Blanc RRHH · Worldclass

## Objetivo
Transformar el portal Blanc RRHH en una plataforma operativa end-to-end, con módulos completos, persistencia, permisos y auditoría.

## Decisiones clave

### Archivos
- Carpeta local por defecto: `backend/uploads` (configurable con `LOCAL_UPLOADS_PATH`).
- Los documentos se guardan con rutas internas (`storagePath`) y se entregan mediante `GET /documentos/:id/download` con validación JWT + ownership.
- Se registran eventos de auditoría por carga y descarga de documentos.

### Permisos
- **EMPLEADO**: puede gestionar su propia educación, antecedentes laborales, solicitudes de vacaciones, horas extra y ver documentos con visibilidad `ADMIN_Y_EMPLEADO`.
- **ADMIN_RRHH**: gestiona empleados, documentos y solicitudes. No tiene acceso a auditoría completa ni ajustes sensibles de fecha de ingreso o saldo inicial.
- **ADMIN_DIRECCION**: permisos totales, incluyendo auditoría y ajustes manuales de fecha de ingreso y saldo inicial de vacaciones.

### Auditoría
Eventos críticos registrados en `EventoAuditoria`:
- Educación, antecedentes laborales, documentos, remuneraciones, vacaciones y horas extra.
- Ajustes de saldo inicial y cambios de fecha de ingreso.

### Vacaciones
- Saldo = saldo inicial + acumulado manual + cálculo automático - días tomados.
- Al aprobar una solicitud, se registra movimiento en `MovimientoVacaciones`.
- Dirección puede aprobar solicitudes incluso con saldo negativo.

## Flujos principales

### Educación
1. Empleado crea/edita/elimina registros en `/educacion/me`.
2. Puede asociar certificados existentes (tipo `CERTIFICADO`).
3. Auditoría automática en cada acción.

### Remuneraciones
1. Admin publica liquidación con PDF (endpoint `/remuneraciones/:employeeId`).
2. Se genera documento categoría `LIQUIDACION` y registro `Remuneracion`.
3. Empleado consulta y descarga desde `/remuneraciones/me`.

### Horas extra
1. Empleado solicita horas extra en `/horas-extras/me`.
2. RRHH/Dirección aprueba o rechaza en `/horas-extras/:id/approve|reject`.
3. Auditoría registra cada decisión.

### Documentos
- Admin sube con categoría y visibilidad desde `/documentos/empleados/:id`.
- Empleado lista solo documentos visibles y descarga por endpoint seguro.

## UX
- Formularios con validación (React Hook Form + Zod).
- Estados de carga, feedback de éxito/error y confirmaciones en acciones destructivas.
- Dashboard con KPIs reales de vacaciones, horas extra y última liquidación.
