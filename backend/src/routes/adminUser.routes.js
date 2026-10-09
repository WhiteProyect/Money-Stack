'use strict';

const { Router } = require('express');
const controller = require('../controllers/adminUser.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const noStore = require('../middlewares/noStore');
const validate = require('../middlewares/validate');
const {
  idParamSchema,
  listQuerySchema,
  createAdminSchema,
  updateAdminSchema,
  resetPasswordSchema,
} = require('../validators/adminUser.validator');

const router = Router();

router.use(noStore, authenticate, authorize());

router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.post('/', validate(createAdminSchema), controller.create);
router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateAdminSchema), controller.update);
router.post('/:id/reset-password', validate(idParamSchema, 'params'), validate(resetPasswordSchema), controller.resetPassword);
router.post('/:id/unlock', validate(idParamSchema, 'params'), controller.unlock);

module.exports = router;
