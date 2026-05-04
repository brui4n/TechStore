const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateSecret = (email) => {
  return speakeasy.generateSecret({
    name: `TechStore (${email})`
  });
};

const generateQRCode = async (otpauth_url) => {
  return await QRCode.toDataURL(otpauth_url);
};

const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 30 seconds before and after
  });
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken
};
