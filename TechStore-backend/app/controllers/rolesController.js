const Rol = require('../models/Rol');
const UsuarioRol = require('../models/UsuarioRol');

const Permiso = require('../models/Permiso');

exports.getPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.findAll();
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const roles = await Rol.findAll({
      include: [{ model: Permiso, through: { attributes: [] } }]
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, permisosIds } = req.body;
    const newRol = await Rol.create({ nombre, descripcion });
    
    if (permisosIds && permisosIds.length > 0) {
      for (const permId of permisosIds) {
        await UsuarioRol.sequelize.models.RolPermiso.create({ rol_id: newRol.id, permiso_id: permId });
      }
    }
    res.status(201).json(newRol);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear rol', details: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisosIds } = req.body;
    const rol = await Rol.findByPk(id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });

    rol.nombre = nombre;
    rol.descripcion = descripcion;
    await rol.save();
    
    if (permisosIds !== undefined) {
      await UsuarioRol.sequelize.models.RolPermiso.destroy({ where: { rol_id: id } });
      for (const permId of permisosIds) {
        await UsuarioRol.sequelize.models.RolPermiso.create({ rol_id: id, permiso_id: permId });
      }
    }
    
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Rol.findByPk(id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });

    // Validate if users are assigned
    const count = await UsuarioRol.count({ where: { rol_id: id } });
    if (count > 0) {
      return res.status(400).json({ error: 'No se puede eliminar un rol que tiene usuarios asignados' });
    }

    await rol.destroy();
    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
};
