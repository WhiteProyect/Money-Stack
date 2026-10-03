'use strict';

const env = require('../config/env');
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const COOKIE_NAME = 'ms_refresh';

// El refresh token viaja SOLO en una cookie httpOnly: JavaScript del navegador (y por lo
// tanto un XSS) no puede leerlo. Path limitado a /auth: no se envía al resto de la API.
const cookieOptions = {
  httpOnly: true,
  secure: env.isProd || env.COOKIE_SAME_SITE === 'none',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/v1/auth',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

const setRefreshCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: env.refreshTtlMs });
const clearRefreshCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions);

const getMeta = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') });

const sessionResponse = (res, { accessToken, refreshToken, user }) => {
  setRefreshCookie(res, refreshToken);
  res.json({ data: { accessToken, expiresIn: env.JWT_ACCESS_EXPIRES_IN, user } });
};

const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body.email, req.body.password, getMeta(req));
  sessionResponse(res, session);
});

const refresh = asyncHandler(async (req, res) => {
  try {
    const session = await authService.refresh(req.cookies[COOKIE_NAME], getMeta(req));
    sessionResponse(res, session);
  } catch (err) {
    clearRefreshCookie(res); // cookie inservible: se limpia en el navegador
    throw err;
  }
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies[COOKIE_NAME]);
  clearRefreshCookie(res);
  res.status(204).end();
});

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);
  clearRefreshCookie(res);
  res.status(204).end();
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ data: { user } });
});

module.exports = { login, refresh, logout, logoutAll, me };
