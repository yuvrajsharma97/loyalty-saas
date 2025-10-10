/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all API endpoints
 */

/**
 * Success response
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} meta - Additional metadata (pagination, etc.)
 */
export function sendSuccess(res, data = null, statusCode = 200, meta = null) {
  const response = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * Error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {object} errors - Validation errors or additional error details
 */
export function sendError(res, message, statusCode = 500, errors = null) {
  const response = {
    success: false,
    error: message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Validation error response
 * @param {object} res - Express response object
 * @param {array|object} errors - Validation errors
 */
export function sendValidationError(res, errors) {
  return sendError(res, 'Validation failed', 400, errors);
}

/**
 * Not found error response
 * @param {object} res - Express response object
 * @param {string} resource - Resource name (e.g., "User", "Store")
 */
export function sendNotFound(res, resource = 'Resource') {
  return sendError(res, `${resource} not found`, 404);
}

/**
 * Unauthorized error response
 * @param {object} res - Express response object
 * @param {string} message - Custom message (optional)
 */
export function sendUnauthorized(res, message = 'Authentication required') {
  return sendError(res, message, 401);
}

/**
 * Forbidden error response
 * @param {object} res - Express response object
 * @param {string} message - Custom message (optional)
 */
export function sendForbidden(res, message = 'Access denied') {
  return sendError(res, message, 403);
}

/**
 * Method not allowed error response
 * @param {object} res - Express response object
 * @param {array} allowedMethods - Array of allowed methods (e.g., ['GET', 'POST'])
 */
export function sendMethodNotAllowed(res, allowedMethods = []) {
  const message = allowedMethods.length > 0
    ? `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`
    : 'Method not allowed';

  res.setHeader('Allow', allowedMethods.join(', '));
  return sendError(res, message, 405);
}

/**
 * Rate limit exceeded error response
 * @param {object} res - Express response object
 * @param {number} retryAfter - Seconds until rate limit resets (optional)
 */
export function sendRateLimitError(res, retryAfter = null) {
  if (retryAfter) {
    res.setHeader('Retry-After', retryAfter);
  }

  return sendError(res, 'Too many requests. Please try again later.', 429);
}

/**
 * Paginated success response
 * @param {object} res - Express response object
 * @param {array} data - Array of items
 * @param {object} pagination - Pagination metadata
 * @param {number} pagination.page - Current page
 * @param {number} pagination.limit - Items per page
 * @param {number} pagination.total - Total items
 */
export function sendPaginatedSuccess(res, data, pagination) {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(res, data, 200, {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
    },
  });
}

/**
 * Created response (for POST requests)
 * @param {object} res - Express response object
 * @param {any} data - Created resource data
 */
export function sendCreated(res, data) {
  return sendSuccess(res, data, 201);
}

/**
 * No content response (for DELETE requests)
 * @param {object} res - Express response object
 */
export function sendNoContent(res) {
  return res.status(204).send();
}
