'use strict';

const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/admin/users', require('./adminUser.routes'));

// Próximas fases:
// router.use('/artists',     require('./artists.routes'));      // Fase 3
// router.use('/events',      require('./events.routes'));       // Fase 4
// router.use('/bookings',    require('./bookings.routes'));     // Fase 5

module.exports = router;
