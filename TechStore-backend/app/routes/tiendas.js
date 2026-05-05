const express = require('express');
const router = express.Router();
const tiendasController = require('../controllers/tiendasController');

// Ruta pública para que puedan seleccionar tienda al registrarse
router.get('/', tiendasController.getAll);

module.exports = router;
