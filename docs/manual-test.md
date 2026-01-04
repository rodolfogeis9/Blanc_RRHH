# Manual de pruebas (smoke test)

## Preparación
1. Levanta backend (`npm run dev` en `/backend`).
2. Levanta frontend (`npm run dev` en `/frontend`).
3. Asegura usuarios de prueba:
   - ADMIN_DIRECCION / ADMIN_RRHH con JWT válido.
   - EMPLEADO asignado a esos admins.

## Casos principales

### 1) Educación y antecedentes (Empleado)
1. Inicia sesión como EMPLEADO.
2. Ve a **Mis estudios** y crea un registro.
3. Edita el registro y verifica que aparece en la tabla.
4. Elimina el registro y valida que se removió.
5. Ve a **Mis antecedentes laborales** y repite el flujo.

### 2) Liquidaciones (Admin → Empleado)
1. Inicia sesión como ADMIN.
2. En **Empleados**, selecciona un colaborador y abre **Remuneraciones**.
3. Sube un PDF con periodo `YYYY-MM`.
4. Cambia a EMPLEADO y entra en **Remuneraciones**.
5. Descarga la liquidación y verifica que el archivo se abre.

### 3) Vacaciones (Empleado → Admin)
1. Como EMPLEADO, crea una solicitud de vacaciones.
2. Como ADMIN, entra en **Solicitudes** y aprueba la solicitud.
3. Vuelve al portal del empleado y verifica que el saldo se descuenta.

### 4) Horas extra (Empleado → Admin)
1. Como EMPLEADO, registra horas extra.
2. Como ADMIN, entra en **Solicitudes** → **Horas extra** y aprueba.
3. Vuelve al portal del empleado y valida el estado aprobado.

### 5) Documentos privados
1. Como ADMIN, sube un documento con visibilidad `SOLO_ADMIN`.
2. Como EMPLEADO, verifica que no aparece en **Mis documentos**.
3. Como ADMIN, verifica que sí aparece en la lista del colaborador.

## Evidencias recomendadas
- Capturas de tablas con registros creados.
- Descarga exitosa desde `/documentos/:id/download`.
