export function notFoundHandler(req, res, next) {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  if (statusCode >= 500) {
    console.error('Error del servidor:', err);
  }

  return res.status(statusCode).json({
    status: 'Error',
    message
  });
}
