'use strict';

// Las respuestas con tokens o datos de sesión nunca deben quedar en caché
module.exports = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  next();
};
