const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/rbac');

router.use(verifyToken);

router.get('/', checkRole(['Admin', 'Gerente']), usersController.getAll);
router.post('/:id/roles', checkRole(['Admin']), usersController.assignRole);
router.delete('/:id/roles/:rol_id', checkRole(['Admin']), usersController.removeRole);

module.exports = router;
