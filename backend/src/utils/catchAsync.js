// =====================================================================
// Asynchronous Controller Exception Wrapper (catchAsync.js)
// =====================================================================

/**
 * Wraps async Express handlers to catch Promise rejections and forward to next()
 * @param {Function} fn - Async controller function signature (req, res, next)
 * @returns {Function} Express route middleware callback
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
