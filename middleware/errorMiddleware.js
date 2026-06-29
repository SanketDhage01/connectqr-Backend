import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥:', err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  } else {
    // Production mode logic
    let error = { ...err };
    error.message = err.message;

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate value for field: ${field}. Please use a different value.`;
      return sendError(res, 400, message);
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(el => el.message);
      const message = `Validation failed: ${messages.join(', ')}`;
      return sendError(res, 400, message);
    }

    // Handle invalid MongoDB Object ID
    if (err.name === 'CastError') {
      const message = `Invalid identifier: ${err.value}`;
      return sendError(res, 400, message);
    }

    // Custom operational error handling
    if (err.isOperational) {
      return sendError(res, err.statusCode, err.message);
    }

    // Log unknown/internal errors and return generic message
    console.error('SYSTEM ERROR 💥:', err);
    return sendError(res, 500, 'Something went wrong. Please try again later.');
  }
};
