const express = require('express');
const router = express.Router();
const tiendasController = require('../controllers/tiendasController');
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/rbac');

router.get('/', tiendasController.getAll);

router.use(verifyToken);
router.post('/', checkPermission(['manage_tiendas']), tiendasController.create);
router.put('/:id', checkPermission(['manage_tiendas']), tiendasController.update);
router.delete('/:id', checkPermission(['manage_tiendas']), tiendasController.delete);

module.exports = router;
