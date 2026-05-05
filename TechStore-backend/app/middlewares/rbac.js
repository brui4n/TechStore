const checkRole = (rolesArray) => {
  return (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Usuario no autenticado' });
      const userRoles = req.user.Rols ? req.user.Rols.map(rol => rol.nombre) : [];
      if (!userRoles.some(rol => rolesArray.includes(rol))) {
        return res.status(403).json({ error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesArray.join(', ')}` });
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error verificando roles', details: error.message });
    }
  };
};

const checkPermission = (permisosArray) => {
  return (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Usuario no autenticado' });

      // Extraer permisos planos
      const userPermisos = new Set();
      if (req.user.Rols) {
        req.user.Rols.forEach(rol => {
          if (rol.Permisos) {
            rol.Permisos.forEach(perm => userPermisos.add(perm.nombre));
          }
        });
      }
      
      const userRoles = req.user.Rols ? req.user.Rols.map(rol => rol.nombre) : [];
      if (userRoles.includes('Admin')) {
        return next(); // Admin incondicional bypass
      }

      const hasPerm = permisosArray.some(perm => userPermisos.has(perm));

      if (!hasPerm) {
        return res.status(403).json({ error: `Acceso denegado. Se requiere el permiso: ${permisosArray.join(', ')}` });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Error verificando permisos', details: error.message });
    }
  };
};

module.exports = { checkRole, checkPermission };
