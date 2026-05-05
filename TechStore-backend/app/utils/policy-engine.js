/**
 * Motor de Políticas ABAC (Attribute-Based Access Control)
 * 
 * Evalúa dinámicamente si un usuario puede realizar una acción específica
 * sobre un recurso (Producto) basándose en los roles del usuario y los
 * atributos tanto del usuario (ej. tienda_id) como del recurso (ej. tienda_id, es_premium).
 */

const canPerformAction = (user, action, resource) => {
  // Extraer nombres de roles del usuario
  const roles = user.Rols ? user.Rols.map(r => r.nombre) : [];
  
  // 1. Admin: Acceso total incondicional
  if (roles.includes('Admin')) {
    return { allowed: true };
  }

  // 2. Auditor: Acceso exclusivo de Solo Lectura
  if (roles.includes('Auditor')) {
    if (action === 'READ') return { allowed: true };
    return { allowed: false, reason: 'Los Auditores solo tienen permisos de lectura' };
  }

  // 3. Gerente de Tienda
  if (roles.includes('Gerente')) {
    // Solo puede gestionar productos de su propia tienda
    if (resource.tienda_id !== user.tienda_id) {
      return { allowed: false, reason: 'Los Gerentes solo pueden gestionar productos de su propia tienda' };
    }
    
    // Gerente puede crear, leer, actualizar y eliminar en su tienda
    // Nota: El requerimiento dice "no puede eliminar productos de otras tiendas", lo cual ya está cubierto arriba.
    return { allowed: true };
  }

  // 4. Empleado de Ventas
  if (roles.includes('Empleado')) {
    // Solo puede interactuar con productos de su propia tienda
    if (resource.tienda_id !== user.tienda_id) {
      return { allowed: false, reason: 'Los Empleados solo pueden acceder a productos de su propia tienda' };
    }

    if (action === 'READ') return { allowed: true };

    if (action === 'UPDATE') {
      // El empleado puede actualizar stock, pero ABAC también debe impedir que modifique productos premium sin permiso especial?
      // O solo validamos que no puede modificar precios: esto se debe validar en el controlador, o pasando un campo `fields` al motor ABAC.
      return { allowed: true, fieldsRestricted: ['precio'] }; 
    }

    if (action === 'DELETE' || action === 'CREATE') {
      return { allowed: false, reason: 'Los Empleados no pueden crear ni eliminar productos' };
    }
  }

  return { allowed: false, reason: 'No tienes los permisos necesarios' };
};

module.exports = { canPerformAction };
