export const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

export const sendError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    status: 'fail',
    message,
    errors
  });
};
