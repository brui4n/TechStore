const Log = require('../models/Log');

const logAction = async (usuario_id, accion, recurso, recurso_id, detalles) => {
  try {
    await Log.create({
      usuario_id,
      accion,
      recurso,
      recurso_id,
      detalles: JSON.stringify(detalles)
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
  }
};

module.exports = { logAction };
