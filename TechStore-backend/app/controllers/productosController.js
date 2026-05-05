const Producto = require('../models/Producto');
const { canPerformAction } = require('../utils/policy-engine');
const { logAction } = require('../utils/logger');

exports.getAll = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    // Filtrar con ABAC
    const allowedProducts = productos.filter(p => canPerformAction(req.user, 'READ', p).allowed);
    res.json(allowedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

exports.create = async (req, res) => {
  try {
    const policy = canPerformAction(req.user, 'CREATE', { tienda_id: req.user.tienda_id });
    if (!policy.allowed) {
      return res.status(403).json({ error: policy.reason });
    }

    const { nombre, descripcion, precio, stock, es_premium, tienda_id } = req.body;
    const newProduct = await Producto.create({
      nombre, descripcion, precio, stock, es_premium,
      tienda_id: tienda_id || req.user.tienda_id
    });

    await logAction(req.userId, 'CREATE', 'Producto', newProduct.id, newProduct.toJSON());

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const policy = canPerformAction(req.user, 'UPDATE', producto);
    if (!policy.allowed) {
      return res.status(403).json({ error: policy.reason });
    }

    const updates = req.body;
    
    if (policy.fieldsRestricted && policy.fieldsRestricted.length > 0) {
      for (const field of policy.fieldsRestricted) {
        // En Javascript comparar decimales puede ser tricky, pero a nivel string/int basta para el demo
        if (updates[field] !== undefined && String(updates[field]) !== String(producto[field])) {
          return res.status(403).json({ error: `No tienes permiso para modificar el campo: ${field}` });
        }
      }
    }

    await producto.update(updates);
    await logAction(req.userId, 'UPDATE', 'Producto', producto.id, updates);

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const policy = canPerformAction(req.user, 'DELETE', producto);
    if (!policy.allowed) {
      return res.status(403).json({ error: policy.reason });
    }

    await producto.destroy();
    await logAction(req.userId, 'DELETE', 'Producto', producto.id, { nombre: producto.nombre });

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
