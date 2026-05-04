const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const UsuarioRol = require('../models/UsuarioRol');

exports.getAll = async (req, res) => {
  try {
    const users = await Usuario.findAll({
      attributes: { exclude: ['password', 'mfa_secret'] },
      include: [{ model: Rol, through: { attributes: [] } }]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { id } = req.params; // Usuario ID
    const { rol_id } = req.body;

    const user = await Usuario.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const rol = await Rol.findByPk(rol_id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });

    const existingAssign = await UsuarioRol.findOne({ where: { usuario_id: id, rol_id } });
    if (existingAssign) {
      return res.status(400).json({ error: 'El usuario ya tiene asignado este rol' });
    }

    await UsuarioRol.create({
      usuario_id: id,
      rol_id,
      asignado_por: req.userId
    });

    res.json({ message: 'Rol asignado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar rol' });
  }
};

exports.removeRole = async (req, res) => {
  try {
    const { id, rol_id } = req.params; // Usuario ID and Rol ID

    const assign = await UsuarioRol.findOne({ where: { usuario_id: id, rol_id } });
    if (!assign) {
      return res.status(404).json({ error: 'El usuario no tiene este rol asignado' });
    }

    await assign.destroy();
    res.json({ message: 'Rol removido exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al remover rol' });
  }
};
