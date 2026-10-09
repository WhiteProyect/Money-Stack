'use strict';

const AppError = require('../utils/AppError');

// validate(schema) valida req.body; validate(schema, 'query') valida la query string.
// Reemplaza el input por la versión limpia (trim, lowercase, tipos) y descarta campos extra.
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.') || source,
      message: i.message,
    }));
    return next(new AppError('Datos inválidos', 422, 'VALIDATION_ERROR', details));
  }
  if (source !== 'params') {
    req[source] = result.data;
  }
  return next();
};

module.exports = validate;
