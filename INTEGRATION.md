# Integración Angular y Spring

## Ejecución local

Frontend: `npm start`, en http://localhost:4200. Backend: http://localhost:8080.
La URL base está en `src/environments/environment.development.ts` y
`environment.ts`. No cambiarla en cada servicio.

## Autenticación compartida

`core/auth/Auth` sirve a ambos portales. El login obtiene CSRF mediante
GET `/auth/csrf`, envía sus credenciales y el encabezado CSRF a POST
`/auth/login`, y consulta GET `/api/v1/usuarios/me` para conocer el rol.

Solo el access token permanece en memoria. El backend conserva el refresh en
una cookie HttpOnly; no se guarda en localStorage ni sessionStorage. Al recargar,
el guard renueva la sesión con cookies y CSRF y vuelve a obtener el perfil.
El cierre de sesión llama POST `/auth/logout` y solo limpia memoria y navega
al login cuando el servidor confirma el cierre.

## Rutas y responsabilidades

- CLIENTE: `/cliente/inicio`, `/cliente/pedidos`, `/cliente/citas`,
  `/cliente/seguimiento`, `/cliente/seguimiento/:id`, `/cliente/productos`,
  `/cliente/perfil`. Se conserva el layout y el diseño del portal de clientes.
- Roles internos: `/dashboard` es el resumen; cada módulo tiene su propia
  ruta: `/dashboard/pedidos`, `/dashboard/usuarios`, `/dashboard/atenciones`,
  etc. `/dashboard/perfil` usa la misma pantalla de perfil del portal cliente.
- El sidebar y las tarjetas enlazan a esas rutas; no usan `?seccion=`.
- Los parámetros `?q=texto&pagina=2` se reservan para búsqueda y paginación.
  Se restauran al recargar o compartir una dirección.
- `authGuard` protege cada área y sus hijos, recupera la sesión tras F5 y
  verifica los módulos permitidos por rol según `dashboard-data.ts`.

Los guards son controles de navegación; la autorización real la mantiene Spring.
El cliente no entra a gestión y los roles internos no entran al portal cliente.
Los formularios de creación y edición de negocio siguen pendientes; esta
integración conecta las consultas y reorganiza la navegación.

## Servicios

`core/services/api.service.ts` concentra las consultas autenticadas a `/api/v1`
con Bearer. Los servicios de cliente, pedido, seguimiento, productos, cisternas
y atenciones reutilizan ese acceso y los modelos TypeScript de Erick.
No se envía `idCliente` al registrar un pedido: el backend toma la identidad
del usuario autenticado.

El portal cliente usa:

- GET `/api/v1/clientes/me`: datos propios y razón social.
- GET `/api/v1/pedidos/mis-pedidos`: pedidos propios.
- GET `/api/v1/pedidos/mis-pedidos/:id`: detalle propio.
- GET `/api/v1/pedidos/:id/seguimiento`: historial propio.
- GET `/api/v1/atenciones/mis-atenciones`: citas propias. El backend filtra
  por el correo autenticado; no acepta otro cliente por query ni por cuerpo.

## Verificación

En frontend: `npm test -- --watch=false` y `npm run build -- --configuration development`.
En la carpeta without: `npx playwright test`; CP05 usa `/dashboard/usuarios`.
Las pruebas de backend AtencionClienteTest y AtencionClienteSecurityTest cubren
la consulta propia, el aislamiento y la autorización del nuevo endpoint.
No se requieren cambios de esquema de base de datos para esta integración.

## Layout compartido

ClientLayout reutiliza DashboardLayout. Ambos portales usan el mismo header y
sidebar; el menú y el enlace Mi perfil cambian según el rol. Las rutas
/cliente/... y /dashboard/... permanecen separadas y protegidas por los guards.
