# Plan de Implementación - Blanc RRHH (Fase 2)

Este plan prioriza convertir las vistas "Placeholder" en funcionalidades reales, consistentes con el resto de la aplicación.

## 1. Actualización de Base de Datos (Prioridad Alta)
Necesitamos soporte para los módulos faltantes.

### Tareas:
- [ ] Crear migración Prisma con nuevos modelos:
    - `Educacion` (institución, titulo, fechas)
    - `AntecedenteLaboral` (empresa, cargo, fechas, descripcion)
    - `Remuneracion` (fecha, montoLiquido, montoBruto, archivo?)
    - `HoraExtra` (fecha, cantidadHoras, motivo, estado)
- [ ] Ejecutar `prisma migrate` y regenerar cliente.

## 2. Backend: Endpoints CRUD (Prioridad Alta)
Implementar lógica de negocio para las nuevas entidades.

### Tareas:
- [ ] **Módulo Empleados (Extensión):**
    - `POST /employees/:id/education`
    - `DELETE /employees/:id/education/:eduId`
    - `POST /employees/:id/jobs` (Antecedentes)
- [ ] **Módulo Remuneraciones:**
    - `GET /remunerations/me` (Solo propias)
    - `POST /remunerations/:employeeId` (Solo Admin)
- [ ] **Módulo Horas Extras:**
    - `POST /overtime` (Solicitud empleado)
    - `PUT /overtime/:id/status` (Aprobación admin)

## 3. Frontend: Implementación de Placeholder (Prioridad Media)
Reemplazar `PlaceholderPage.tsx` con componentes reales.

### Tareas:
- [ ] **Mis Estudios:** Tabla con botón "Agregar". Formulario modal.
- [ ] **Antecedentes Laborales:** Timeline o lista de experiencias previas.
- [ ] **Remuneraciones:** Tabla histórica de sueldos con gráfico simple.
- [ ] **Horas Extras:** Formulario de solicitud y tabla de estado.

## 4. Infraestructura: Manejo de Archivos (Prioridad Media)
El sistema actual guarda en `./tmp` pero no hay ruta para servir esos archivos estáticamente en dev.

### Tareas:
- [ ] Configurar `express.static` en `server.ts` apuntando a la carpeta de uploads local.
- [ ] Asegurar que `StorageService` devuelva la URL pública correcta (localhost:4000/uploads/...) en modo dev.

## 5. Auditoría y Permisos (Transversal)
- [ ] Asegurar que cada escritura en los nuevos módulos genere un `EventoAuditoria`.
- [ ] Verificar que un empleado no pueda ver/editar datos de otro (guards en backend).

## Orden de Ejecución Sugerido:
1. Migración BD (`schema.prisma`)
2. Backend Services & Routes
3. Frontend UI (uno por uno: Estudios -> Antecedentes -> Horas Extra -> Remuneraciones)
4. Fix de Archivos
