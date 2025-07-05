// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

// Error handler functions
const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      return new ConflictError('A record with this information already exists');
    case 'P2025':
      return new NotFoundError('Record');
    case 'P2003':
      return new ValidationError('Cannot perform this operation due to data relationships');
    case 'P2014':
      return new ValidationError('The provided ID is invalid');
    case 'P2021':
      return new AppError('Database table does not exist', 500, 'DATABASE_ERROR');
    case 'P2022':
      return new AppError('Database column does not exist', 500, 'DATABASE_ERROR');
    case 'P2018':
      return new AppError('Connected records not found', 500, 'DATABASE_ERROR');
    case 'P2019':
      return new AppError('Input error', 400, 'INPUT_ERROR');
    case 'P2020':
      return new AppError('Value out of range', 400, 'RANGE_ERROR');
    default:
      return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
  }
};

const handleJWTError = (error) => {
  switch (error.name) {
    case 'TokenExpiredError':
      return new AuthenticationError('Your authentication token has expired. Please login again.');
    case 'JsonWebTokenError':
      return new AuthenticationError('The provided token is invalid.');
    case 'NotBeforeError':
      return new AuthenticationError('Token not active.');
    default:
      return new AuthenticationError('Token verification failed.');
  }
};

const handleValidationError = (error) => {
  const errors = error.array();
  const messages = errors.map(err => `${err.param}: ${err.msg}`).join(', ');
  return new ValidationError('Validation failed', errors);
};

const handleMulterError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('File size too large');
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new ValidationError('Too many files');
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError('Unexpected file field');
  }
  return new ValidationError('File upload error');
};

// Global error handler middleware
const globalErrorHandler = (error, req, res, next) => {
  let appError = error;

  // Convert Prisma errors
  if (error.code && error.code.startsWith('P')) {
    appError = handlePrismaError(error);
  }

  // Convert JWT errors
  if (error.name && error.name.includes('Token')) {
    appError = handleJWTError(error);
  }

  // Convert validation errors
  if (error.type === 'entity.parse.failed') {
    appError = new ValidationError('Invalid JSON format');
  }

  // Convert Multer errors
  if (error.code && error.code.startsWith('LIMIT')) {
    appError = handleMulterError(error);
  }

  // Log error
  console.error(`❌ Error [${req.id || 'unknown'}]:`, {
    message: appError.message,
    statusCode: appError.statusCode,
    errorCode: appError.errorCode,
    stack: process.env.NODE_ENV === 'development' ? appError.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Send error response
  const response = {
    error: appError.errorCode || 'Application Error',
    message: appError.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: appError.stack,
      details: appError.details
    })
  };

  res.status(appError.statusCode || 500).json(response);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request validation helper
const validateRequest = (req, res, next) => {
  const errors = [];
  
  // Check for required fields
  if (!req.body || Object.keys(req.body).length === 0) {
    errors.push({ param: 'body', msg: 'Request body is required' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Request validation failed', errors);
  }
  
  next();
};

// Rate limit error handler
const rateLimitErrorHandler = (req, res) => {
  res.status(429).json({
    error: 'Rate Limit Exceeded',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(process.env.RATE_LIMIT_WINDOW_MS / 1000)
  });
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  handlePrismaError,
  handleJWTError,
  handleValidationError,
  handleMulterError,
  globalErrorHandler,
  asyncHandler,
  validateRequest,
  rateLimitErrorHandler
}; 