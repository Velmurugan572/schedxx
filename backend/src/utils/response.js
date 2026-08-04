// =====================================================================
// Standardized REST API Response Formatter (response.js)
// =====================================================================

/**
 * Sends unified success response structure
 * @param {Object} res - Express Response object
 * @param {any} data - Core payload data returnable to the client
 * @param {number} statusCode - Target HTTP Status Code (Default 200)
 * @param {string} message - Optional user-facing status message
 */
export const sendSuccess = (res, data = null, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null
  });
};

/**
 * Sends unified error response structure
 * @param {Object} res - Express Response object
 * @param {any} errorDetails - Detailed error parameters (stack, validation issues)
 * @param {number} statusCode - Target HTTP Status Code (Default 500)
 * @param {string} message - User-friendly error summary description
 */
export const sendError = (res, errorDetails = {}, statusCode = 500, message = 'Internal Server Error') => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: errorDetails
  });
};
