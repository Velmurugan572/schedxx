// ==========================================
// Operational System Error Definition (AppError)
// ==========================================

export class AppError extends Error {
  /**
   * Constructs custom Application Error
   * @param {string} message - User-facing error message description
   * @param {number} statusCode - Target HTTP Response Status Code (e.g. 400, 404, 500)
   * @param {boolean} isOperational - Indicates whether error is anticipated/handled
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Set response status flag depending on status code range (fail vs error)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Captures location track of error origins inside application
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
