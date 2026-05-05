const Tienda = require('../models/Tienda');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');

exports.getAll = async (req, res) => {
  try {
    const tiendas = await Tienda.findAll();
    res.json(tiendas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tiendas' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, ubicacion } = req.body;
    const nuevaTienda = await Tienda.create({ nombre, ubicacion });
    res.status(201).json(nuevaTienda);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tienda' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ubicacion } = req.body;
    const tienda = await Tienda.findByPk(id);
    if (!tienda) return res.status(404).json({ error: 'Tienda no encontrada' });

    tienda.nombre = nombre;
    tienda.ubicacion = ubicacion;
    await tienda.save();
    
    res.json(tienda);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tienda' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const tienda = await Tienda.findByPk(id);
    if (!tienda) return res.status(404).json({ error: 'Tienda no encontrada' });

    const countProds = await Producto.count({ where: { tienda_id: id } });
    const countUsers = await Usuario.count({ where: { tienda_id: id } });
    if (countProds > 0 || countUsers > 0) {
      return res.status(400).json({ error: 'No se puede eliminar una tienda que tiene productos o usuarios asignados' });
    }

    await tienda.destroy();
    res.json({ message: 'Tienda eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tienda' });
  }
};
