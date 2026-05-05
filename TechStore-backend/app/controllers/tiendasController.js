const Tienda = require('../models/Tienda');

exports.getAll = async (req, res) => {
  try {
    const tiendas = await Tienda.findAll();
    res.json(tiendas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tiendas' });
  }
};
