'use strict';

const { Router } = require('express');
const controller = require('../controllers/booking.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const noStore = require('../middlewares/noStore');
const methodNotAllowed = require('../utils/methodNotAllowed');
const { bookingLimiter } = require('../middlewares/rateLimiters');
const {
  bookingCreateSchema,
  bookingListQuerySchema,
  bookingIdParamSchema,
  bookingStatusTransitionSchema,
} = require('../validators/booking.validator');

const router = Router();

// ── Público ──────────────────────────────────────────────────────────────────
router.post('/bookings', bookingLimiter, validate(bookingCreateSchema), controller.create);

// ── Admin (ADMIN+) ────────────────────────────────────────────────────────────
const adminRouter = Router();
adminRouter.use(noStore, authenticate, authorize('ADMIN'));

adminRouter.get('/', validate(bookingListQuerySchema, 'query'), controller.list);
adminRouter.get('/:id', validate(bookingIdParamSchema, 'params'), controller.getById);
adminRouter.patch(
  '/:id',
  validate(bookingIdParamSchema, 'params'),
  validate(bookingStatusTransitionSchema),
  controller.update
);
adminRouter.delete('/:id', methodNotAllowed('No se permite eliminar solicitudes de booking. Úsalas cancelando con status'));

router.use('/admin/bookings', adminRouter);

module.exports = router;
