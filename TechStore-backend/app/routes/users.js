const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/rbac');

router.use(verifyToken);

router.get('/', checkPermission(['manage_users']), usersController.getAll);
router.post('/:id/roles', checkPermission(['manage_users']), usersController.assignRole);
router.delete('/:id/roles/:rol_id', checkPermission(['manage_users']), usersController.removeRole);

module.exports = router;
