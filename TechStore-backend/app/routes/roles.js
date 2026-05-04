const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/rbac');

router.use(verifyToken);
router.use(checkRole(['Admin']));

router.get('/', rolesController.getAll);
router.post('/', rolesController.create);
router.put('/:id', rolesController.update);
router.delete('/:id', rolesController.delete);

module.exports = router;
