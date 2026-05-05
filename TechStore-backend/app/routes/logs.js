const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { verifyToken } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/rbac');

router.use(verifyToken);

// Solo Admin y Auditor pueden ver los logs
router.get('/', checkRole(['Admin', 'Auditor']), logsController.getAll);

module.exports = router;
