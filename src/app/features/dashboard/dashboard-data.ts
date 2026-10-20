export interface DashboardSection {
  key: string;
  title: string;
  path: string;
  columns: { key: string; label: string }[];
}

const columns = (...pairs: string[][]) => pairs.map(([key, label]) => ({ key, label }));
const pedidos: DashboardSection = { key: 'pedidos', title: 'Pedidos', path: 'pedidos', columns: columns(['idPedido', 'Pedido'], ['estado', 'Estado'], ['prioridad', 'Prioridad'], ['fechaEntregaEstimada', 'Entrega estimada']) };
const atenciones: DashboardSection = { key: 'atenciones', title: 'Atenciones', path: 'atenciones', columns: columns(['idAtencion', 'Atención'], ['estado', 'Estado'], ['fechaInicioProgramada', 'Inicio programado'], ['idPedido', 'Pedido']) };
const alertas: DashboardSection = { key: 'alertas', title: 'Alertas', path: 'alertas', columns: columns(['idAlerta', 'Alerta'], ['tipo', 'Tipo'], ['estado', 'Estado'], ['mensaje', 'Mensaje']) };
const fallas: DashboardSection = { key: 'fallas', title: 'Fallas de cisternas', path: 'fallas', columns: columns(['idFalla', 'Falla'], ['idCisterna', 'Cisterna'], ['estado', 'Estado'], ['descripcion', 'Descripción']) };
const productos: DashboardSection = { key: 'productos', title: 'Productos disponibles', path: 'productos/activos', columns: columns(['nombre', 'Producto'], ['tipoGas', 'Gas'], ['unidadMedida', 'Unidad'], ['precioUnitario', 'Precio unitario']) };
const cisternas: DashboardSection = { key: 'cisternas', title: 'Cisternas activas', path: 'cisternas/activas', columns: columns(['idCisterna', 'Cisterna'], ['placa', 'Placa'], ['estado', 'Estado']) };
const conductores: DashboardSection = { key: 'conductores', title: 'Conductores activos', path: 'conductores/activos', columns: columns(['idTrabajador', 'Conductor'], ['nombres', 'Nombres'], ['estado', 'Estado']) };
const historial: DashboardSection = { key: 'historial', title: 'Historial de mantenimiento', path: 'historial', columns: columns(['idHistorial', 'Registro'], ['idCisterna', 'Cisterna'], ['descripcion', 'Descripción']) };
const usuarios: DashboardSection = { key: 'usuarios', title: 'Usuarios', path: 'usuarios', columns: columns(['idUsuario', 'Usuario'], ['correo', 'Correo'], ['rol', 'Rol'], ['estado', 'Estado']) };
const clientes: DashboardSection = { key: 'clientes', title: 'Clientes', path: 'clientes', columns: columns(['idCliente', 'Cliente'], ['razonSocial', 'Razón social'], ['ruc', 'RUC']) };

export const DASHBOARD_ROLES: Record<string, { title: string; description: string; sections: DashboardSection[] }> = {
  ADMIN: { title: 'Administración', description: 'Resumen general de usuarios, clientes y operaciones.', sections: [pedidos, usuarios, clientes, atenciones, alertas, fallas, productos, cisternas, conductores, historial] },
  ANALISTA: { title: 'Análisis de operaciones', description: 'Consulta el estado de los pedidos y los recursos del sistema.', sections: [pedidos, clientes, atenciones, alertas, fallas, productos, cisternas, conductores, usuarios, historial] },
  PROGRAMADOR: { title: 'Programación de operaciones', description: 'Consulta pedidos, atenciones, alertas y recursos disponibles para planificar el servicio.', sections: [pedidos, atenciones, alertas, conductores, cisternas, productos] },
  CONDUCTOR: { title: 'Operaciones de transporte', description: 'Consulta las atenciones y alertas de operación disponibles para tu rol.', sections: [atenciones, alertas] },
  TECNICO: { title: 'Mantenimiento', description: 'Consulta fallas, historial de mantenimiento, cisternas y atenciones.', sections: [fallas, historial, cisternas, atenciones] },
  CLIENTE: { title: 'Mis pedidos', description: 'Consulta tus pedidos y los productos disponibles.', sections: [{ ...pedidos, title: 'Mis pedidos', path: 'pedidos/mis-pedidos' }, productos] },
};
