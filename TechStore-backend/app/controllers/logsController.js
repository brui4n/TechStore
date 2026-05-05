const Log = require('../models/Log');
const Usuario = require('../models/Usuario');

exports.getAll = async (req, res) => {
  try {
    const logs = await Log.findAll({
      include: [{ model: Usuario, attributes: ['nombre_completo', 'email'] }],
      order: [['fecha', 'DESC']],
      limit: 200
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener logs de auditoría' });
  }
};
