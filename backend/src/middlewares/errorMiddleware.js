const { sendError } = require('../utils/responseHelper');

const notFound = (req, res, next) => {
  sendError(res, `Endpoint không tồn tại: ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Lỗi hệ thống máy chủ nội bộ';

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Định danh (ID) không đúng định dạng';
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Trường dữ liệu '${field}' đã tồn tại trong hệ thống`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(el => el.message);
    message = errors.join(', ');
  }

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = { notFound, errorHandler };

