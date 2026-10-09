'use strict';

const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const noStore = require('../middlewares/noStore');
const requireTrustedOrigin = require('../middlewares/trustedOrigin');
const { authLimiter, refreshLimiter, passwordLimiter } = require('../middlewares/rateLimiters');
const { loginSchema, changePasswordSchema } = require('../validators/auth.validator');

const router = Router();

router.use(noStore);

router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', refreshLimiter, requireTrustedOrigin, controller.refresh);
router.post('/logout', requireTrustedOrigin, controller.logout);
router.post('/logout-all', authenticate, controller.logoutAll);
router.get('/me', authenticate, controller.me);
router.post('/change-password', passwordLimiter, authenticate, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
