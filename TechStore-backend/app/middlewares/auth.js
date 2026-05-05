const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

const Permiso = require('../models/Permiso');

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({ error: 'No se proporcionó un token' });
    }
    
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techstore_super_secret_key_2026');
    req.userId = decoded.id;

    const user = await Usuario.findByPk(req.userId, {
      include: [
        { 
          model: Rol, 
          through: { attributes: [] },
          include: [{ model: Permiso, through: { attributes: [] } }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.activo) {
      return res.status(403).json({ error: 'Cuenta inactiva' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado', details: error.message });
  }
};

module.exports = { verifyToken };
