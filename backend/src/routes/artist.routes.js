'use strict';

const { Router } = require('express');
const controller = require('../controllers/artist.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const noStore = require('../middlewares/noStore');
const {
  listArtistsQuerySchema,
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

adminRouter.get('/', controller.list);
adminRouter.post('/', validate(createArtistSchema), controller.create);
adminRouter.get('/:id', validate(artistIdParamSchema, 'params'), controller.getById);
adminRouter.patch(
  '/:id',
  validate(artistIdParamSchema, 'params'),
  validate(updateArtistSchema),
  controller.update
);
adminRouter.delete('/:id', (req, res, next) => {
  const err = new Error('No se permite eliminar artistas. Úsalo desactivando con isActive');
  err.statusCode = 405;
  err.code = 'METHOD_NOT_ALLOWED';
  next(err);
});
adminRouter.delete('/:id', (req, res, next) => {
  const err = new Error('No se permite eliminar artistas. Úsalo desactivando con isActive');
  err.statusCode = 405;
  err.code = 'METHOD_NOT_ALLOWED';
  next(err);
});

router.use('/admin/artists', adminRouter);

module.exports = router;
