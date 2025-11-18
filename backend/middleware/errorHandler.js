// backend/middleware/errorHandler.js

/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error("❌ Error Stack:", err.stack);
  
  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  
  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  }
  
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Duplicate Entry";
  }
  
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

/**
 * 404 Not Found Handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};