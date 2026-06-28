const { error } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = Number(err?.statusCode || err?.status || 500);
  const msg = err?.message || 'Error';
  return error(res, msg, statusCode);
}

module.exports = { errorHandler };

