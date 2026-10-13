'use strict';

const { Router } = require('express');
const controller = require('../controllers/event.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const noStore = require('../middlewares/noStore');
const methodNotAllowed = require('../utils/methodNotAllowed');
const {
  listEventsQuerySchema,
  listAdminEventsQuerySchema,
  eventSlugParamSchema,
  eventIdParamSchema,
  createEventSchema,
  updateEventSchema,
  lineupRequestSchema,
} = require('../validators/event.validator');

const router = Router();

// ── Público ──────────────────────────────────────────────────────────────────
router.get('/events', validate(listEventsQuerySchema, 'query'), controller.list);
router.get('/events/:slug', validate(eventSlugParamSchema, 'params'), controller.getBySlug);

// ── Admin (EDITOR+) ───────────────────────────────────────────────────────────
const adminRouter = Router();
adminRouter.use(noStore, authenticate, authorize('EDITOR'));

adminRouter.get('/', validate(listAdminEventsQuerySchema, 'query'), controller.listAdmin);
adminRouter.post('/', validate(createEventSchema), controller.create);
adminRouter.get('/:id', validate(eventIdParamSchema, 'params'), controller.getById);
adminRouter.patch(
  '/:id',
  validate(eventIdParamSchema, 'params'),
  validate(updateEventSchema),
  controller.update
);
adminRouter.put(
  '/:id/lineup',
  validate(eventIdParamSchema, 'params'),
  validate(lineupRequestSchema),
  controller.setLineup
);
adminRouter.delete('/:id', methodNotAllowed('No se permite eliminar eventos. Úsalos cancelando con status'));

router.use('/admin/events', adminRouter);

module.exports = router;
