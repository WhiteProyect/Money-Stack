'use strict';

const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/admin/users', require('./adminUser.routes'));
router.use('/', require('./artist.routes'));
router.use('/', require('./event.routes'));

// Próximas fases:
// router.use('/admin/events', require('./events.routes'));       // Fase 4
// router.use('/bookings',    require('./bookings.routes'));     // Fase 5
// (admin/events ya está registrado dentro de event.routes.js)

module.exports = router;
