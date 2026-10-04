# Angular y Spring

Inicio: `npm start` (http://localhost:4200). El backend debe estar en
http://localhost:8080. La URL se configura en `src/app/core/api.ts` mediante
`API_URL`; puede reemplazarse con un provider en `app.config.ts`.

El login llama a POST `/auth/login` con `{correo, contraseña}`. La respuesta
contiene `access_token` y `refresh_token`. Luego GET `/api/v1/usuarios/me`
obtiene `{idUsuario, correo, estado, rol}`. Las llamadas privadas a `/api/v1/`
llevan `Authorization: Bearer <access_token>`. Se usa sessionStorage y el guard
comprueba el perfil con el servidor al entrar al panel. Cerrar sesion elimina
la sesion local; el backend no tiene endpoint de logout/revocacion.

El refresh token se conserva; esta primera version no renueva automaticamente
el acceso. Un 401 en una API privada vuelve al login. El backend permite renovar
mediante POST `/auth/refresh-token` con `{refreshToken}`.

El panel consulta GET `/api/v1/productos/activos` para ADMIN, ANALISTA,
PROGRAMADOR y CLIENTE. CONDUCTOR y TECNICO ven su perfil. Los permisos efectivos
los valida Spring; mostrar u ocultar elementos no concede permisos.

Cuenta de desarrollo: `admin@linde.example` / `Linde1234*`, si se ejecuto el seeder.

Modulos del backend para continuar: usuarios, clientes, trabajadores,
conductores, programadores, tecnicos, productos, pedidos y detalles,
seguimiento, atenciones, alertas, cisternas, fallas e historial.
Facturas y guias tienen entidades, pero no controladores propios actualmente.
Las fechas LocalDate se envian como YYYY-MM-DD; LocalDateTime no incluye zona.
Los errores pueden ser JSON con `message` o `details`, o texto desde el filtro JWT.

Pendiente: pantallas CRUD y flujos por rol; renovacion automatica de tokens.
