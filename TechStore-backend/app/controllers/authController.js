const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const mfaUtils = require('../utils/mfa.utils');

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const generateToken = (usuario, isMfaVerified = false) => {
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email,
      tienda_id: usuario.tienda_id,
      mfa_verified: isMfaVerified
    },
    process.env.JWT_SECRET || 'techstore_super_secret_key_2026',
    { expiresIn: '8h' }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password, nombre_completo, tienda_id } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.' });
    }

    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Usuario.create({
      email,
      password: hashedPassword,
      nombre_completo,
      tienda_id
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Cuenta inactiva' });
    }

    if (usuario.bloqueado_hasta && usuario.bloqueado_hasta > new Date()) {
      return res.status(403).json({ error: 'Cuenta bloqueada temporalmente por demasiados intentos fallidos' });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      usuario.intentos_fallidos += 1;
      if (usuario.intentos_fallidos >= 5) {
        usuario.bloqueado_hasta = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de bloqueo
      }
      await usuario.save();
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    usuario.intentos_fallidos = 0;
    usuario.bloqueado_hasta = null;
    await usuario.save();

    const preAuthToken = generateToken(usuario, false);

    if (usuario.mfa_habilitado) {
      return res.json({ 
        message: 'MFA requerido', 
        mfaRequired: true,
        token: preAuthToken 
      });
    }

    return res.json({ 
      message: 'MFA no configurado', 
      mfaRequired: false,
      setupRequired: true,
      token: preAuthToken 
    });

  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
};

exports.setupMFA = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techstore_super_secret_key_2026');
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (usuario.mfa_habilitado) {
      return res.status(400).json({ error: 'MFA ya está habilitado' });
    }

    const secret = mfaUtils.generateSecret(usuario.email);
    
    usuario.mfa_secret = secret.base32;
    await usuario.save();

    const qrCode = await mfaUtils.generateQRCode(secret.otpauth_url);

    res.json({
      message: 'Escanea este QR con Google Authenticator',
      qrCode,
      secret: secret.base32
    });

  } catch (error) {
    res.status(500).json({ error: 'Error configurando MFA', details: error.message });
  }
};

exports.verifyMFA = async (req, res) => {
  try {
    const { mfaToken } = req.body;
    if (!mfaToken) return res.status(400).json({ error: 'El código MFA es requerido' });

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techstore_super_secret_key_2026');
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isValid = mfaUtils.verifyToken(usuario.mfa_secret, mfaToken);

    if (!isValid) {
      return res.status(400).json({ error: 'Código MFA inválido' });
    }

    if (!usuario.mfa_habilitado) {
      usuario.mfa_habilitado = true;
      await usuario.save();
    }

    const finalToken = generateToken(usuario, true);

    res.json({
      message: 'MFA verificado exitosamente. Acceso concedido.',
      token: finalToken,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre_completo,
        tienda_id: usuario.tienda_id
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error verificando MFA', details: error.message });
  }
};

const Rol = require('../models/Rol');
exports.getMe = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.userId, {
      attributes: { exclude: ['password', 'mfa_secret'] },
      include: [{ model: Rol, through: { attributes: [] } }]
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};
