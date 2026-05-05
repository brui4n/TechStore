const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/rbac');

router.use(verifyToken);
router.use(checkPermission(['manage_roles']));

router.get('/', rolesController.getAll);
router.get('/permisos', rolesController.getPermisos);
router.post('/', rolesController.create);
router.put('/:id', rolesController.update);
router.delete('/:id', rolesController.delete);

module.exports = router;
