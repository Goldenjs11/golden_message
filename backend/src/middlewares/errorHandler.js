import logger from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  logger.warn({ err: error, req: { method: req.method, url: req.originalUrl } }, 'Ruta no encontrada');
  next(error);
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.originalUrl } }, 'Error del servidor');
  } else {
    logger.warn({ err, req: { method: req.method, url: req.originalUrl } }, 'Error de petición');
  }

  return res.status(statusCode).json({
    status: 'Error',
    message
  });
}
