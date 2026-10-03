'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ISSUER = 'money-stack-api';
const AUDIENCE = 'money-stack-admin';

// Access token: JWT corto, firmado HS256 (algoritmo fijado para evitar "alg confusion")
function signAccessToken(admin) {
  return jwt.sign({ role: admin.role }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    issuer: ISSUER,
    audience: AUDIENCE,
    subject: admin.id,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ['HS256'],
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

// Refresh token: valor aleatorio opaco (384 bits), no un JWT
function generateRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

// En la BD solo se guarda el HMAC del token (con JWT_REFRESH_SECRET como "pepper")
function hashRefreshToken(token) {
  return crypto.createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');
}

module.exports = { signAccessToken, verifyAccessToken, generateRefreshToken, hashRefreshToken };
