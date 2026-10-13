'use strict';

const { Router } = require('express');
const controller = require('../controllers/artist.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const noStore = require('../middlewares/noStore');
const methodNotAllowed = require('../utils/methodNotAllowed');
const {
  listArtistsQuerySchema,
  listAdminArtistsQuerySchema,
  artistSlugParamSchema,
  artistIdParamSchema,
  createArtistSchema,
  updateArtistSchema,
} = require('../validators/artist.validator');

const router = Router();

// ── Público ──────────────────────────────────────────────────────────────────
router.get(
  '/artists',
  validate(listArtistsQuerySchema, 'query'),
  controller.list
);
router.get(
  '/artists/:slug',
  validate(artistSlugParamSchema, 'params'),
  controller.getBySlug
);

// ── Admin (EDITOR+) ───────────────────────────────────────────────────────────
const adminRouter = Router();
adminRouter.use(noStore, authenticate, authorize('EDITOR'));

adminRouter.get('/', validate(listAdminArtistsQuerySchema, 'query'), controller.listAdmin);
adminRouter.post('/', validate(createArtistSchema), controller.create);
adminRouter.get('/:id', validate(artistIdParamSchema, 'params'), controller.getById);
adminRouter.patch(
  '/:id',
  validate(artistIdParamSchema, 'params'),
  validate(updateArtistSchema),
  controller.update
);
adminRouter.delete('/:id', methodNotAllowed('No se permite eliminar artistas. Úsalo desactivando con isActive'));

router.use('/admin/artists', adminRouter);

module.exports = router;
