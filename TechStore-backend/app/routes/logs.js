const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/rbac');

router.use(verifyToken);

// Solo usuarios con permiso pueden ver logs
router.get('/', checkPermission(['view_audit_logs']), logsController.getAll);

module.exports = router;
