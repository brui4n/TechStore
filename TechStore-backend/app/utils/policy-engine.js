/**
 * Motor de Políticas ABAC (Attribute-Based Access Control)
 * 
 * Evalúa dinámicamente si un usuario puede realizar una acción específica
 * sobre un recurso (Producto) basándose en los roles del usuario y los
 * atributos tanto del usuario (ej. tienda_id) como del recurso (ej. tienda_id, es_premium).
 */

const canPerformAction = (user, action, resource) => {
  // Extraer permisos del usuario
  const permisos = new Set();
  if (user.Rols) {
    user.Rols.forEach(rol => {
      if (rol.Permisos) {
        rol.Permisos.forEach(perm => permisos.add(perm.nombre));
      }
    });
  }
  
  // Soporte retrocompatible Admin incondicional
  const roles = user.Rols ? user.Rols.map(r => r.nombre) : [];
  if (roles.includes('Admin')) {
    return { allowed: true };
  }

  // Permisos granulares: Evaluando READ
  if (action === 'READ') {
    if (permisos.has('view_inventory_global') || permisos.has('manage_inventory_global')) {
      return { allowed: true };
    }
    if ((permisos.has('view_inventory_local') || permisos.has('manage_inventory_local')) && resource.tienda_id === user.tienda_id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'No tienes permiso para ver este inventario' };
  }

  // Evaluando CREATE
  if (action === 'CREATE') {
    if (permisos.has('manage_inventory_global')) return { allowed: true };
    if (permisos.has('manage_inventory_local') && resource.tienda_id === user.tienda_id) return { allowed: true };
    return { allowed: false, reason: 'No tienes permiso para crear productos en esta tienda' };
  }

  // Evaluando UPDATE
  if (action === 'UPDATE') {
    if (permisos.has('manage_inventory_global')) return { allowed: true };
    if (permisos.has('manage_inventory_local') && resource.tienda_id === user.tienda_id) return { allowed: true };
    
    // Si solo tiene permiso de ver inventario local, le daremos chance de actualizar solo stock/precio como empleado
    if (permisos.has('view_inventory_local') && resource.tienda_id === user.tienda_id) {
      return { allowed: true, fieldsRestricted: ['nombre', 'descripcion', 'es_premium', 'tienda_id'] };
    }
    
    return { allowed: false, reason: 'No tienes permiso para editar este producto' };
  }

  // Evaluando DELETE
  if (action === 'DELETE') {
    if (permisos.has('manage_inventory_global')) return { allowed: true };
    if (permisos.has('manage_inventory_local') && resource.tienda_id === user.tienda_id) return { allowed: true };
    return { allowed: false, reason: 'No tienes permiso para eliminar este producto' };
  }

  return { allowed: false, reason: 'No tienes los permisos necesarios' };
};

module.exports = { canPerformAction };
