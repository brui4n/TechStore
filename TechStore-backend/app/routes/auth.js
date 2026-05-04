const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/mfa/setup', authController.setupMFA);
router.post('/mfa/verify', authController.verifyMFA);

const { verifyToken } = require('../middlewares/auth');
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
