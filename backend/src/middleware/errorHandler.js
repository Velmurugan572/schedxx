// =====================================================================
// Centralized Express Error Handling Middleware (errorHandler.js)
// =====================================================================

import { logger } from '../logger/index.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  // Establish baseline parameters
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Systematically log details using Winston
  logger.error(
    `${err.statusCode} - ${err.message} - Path: ${req.originalUrl} - Method: ${req.method} - IP: ${req.ip}`
  );
  
  if (err.stack && env.nodeEnv === 'development') {
    logger.error(err.stack);
  }

  // Construct standardized error response schema
  const isDev = env.nodeEnv === 'development';
  
  // Clean default properties for client response
  const clientMessage = err.isOperational || isDev
    ? err.message
    : 'Something went wrong. Please try again later.';

  const errorPayload = {
    statusCode: err.statusCode,
    status: err.status,
    ...(isDev && { stack: err.stack }), // Attach stack traces strictly during development
    ...(!err.isOperational && !isDev && { code: 'INTERNAL_SERVER_ERROR' }) // Provide generic code in production
  };

  res.status(err.statusCode).json({
    success: false,
    message: clientMessage,
    error: errorPayload
  });
};

export default errorHandler;
