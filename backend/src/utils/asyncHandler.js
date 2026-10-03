'use strict';

// Express 4 no captura rechazos de promesas: este wrapper los envía al errorHandler
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
