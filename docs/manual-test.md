# Manual Test - Invitaciones y Recuperación de Contraseña

## Preparación
- Configurar variables de entorno de correo:
  - `SENDGRID_API_KEY`
  - `SENDGRID_FROM`
- Configurar `FRONTEND_BASE_URL` en backend (ej: `http://localhost:5173`).
- Asegurar `INVITATION_TOKEN_HOURS` y `PASSWORD_RESET_TOKEN_MINUTES` según política.

## Flujo 1: Invitación de usuario por admin
1. Inicia sesión como `ADMIN_RRHH` o `ADMIN_DIRECCION`.
2. Navega a **Admin → Invitaciones**.
3. Completa el formulario con:
   - Correo válido
   - Rol del sistema
   - Cargo clínico
4. Envía la invitación y verifica:
   - Toast de éxito
   - Registro en tabla de invitaciones con estado **PENDIENTE**
   - Email recibido con el enlace `/invite?token=...`
5. Abre el enlace de invitación y completa el formulario de alta con datos requeridos.
6. Verifica que:
   - El usuario se crea con el rol/cargo correctos.
   - Se puede iniciar sesión en `/login`.
   - En auditoría exista evento `INVITATION_CREATE` y `INVITATION_ACCEPT`.
7. Prueba expiración:
   - Ajusta `INVITATION_TOKEN_HOURS` a un valor corto y espera.
   - El enlace debe indicar invitación inválida.

## Flujo 2: Recuperación de contraseña
1. Ir a `/forgot-password` y enviar un correo válido.
2. Verificar:
   - Mensaje genérico de éxito.
   - Email recibido con código OTP.
3. Ir a `/reset-password` e ingresar:
   - Email
   - Código recibido
   - Nueva contraseña (>= 8 caracteres)
4. Verificar:
   - Contraseña actualizada.
   - Login exitoso con nueva contraseña.
   - Evento de auditoría `PASSWORD_RESET_REQUEST` y `PASSWORD_RESET_SUCCESS`.
5. Ingresar código inválido varias veces para validar bloqueo y mensajes genéricos.
