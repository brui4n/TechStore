const checkRole = (rolesArray) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const userRoles = req.user.Rols ? req.user.Rols.map(rol => rol.nombre) : [];
      const hasRole = userRoles.some(rol => rolesArray.includes(rol));

      if (!hasRole) {
        return res.status(403).json({ error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesArray.join(', ')}` });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Error verificando roles', details: error.message });
    }
  };
};

module.exports = { checkRole };
