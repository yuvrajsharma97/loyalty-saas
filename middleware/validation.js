import { ZodError } from 'zod';
import { sendValidationError } from '../lib/api-response.js';
import logger from '../lib/logger.js';

/**
 * Validates request data against a Zod schema
 * @param {object} schema - Zod schema object
 * @param {string} source - Where to validate: 'body', 'query', or 'params'
 */
export function validateRequest(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];

      // Validate the data
      const validatedData = await schema.parseAsync(dataToValidate);

      // Attach validated data to request
      req.validated = {
        ...req.validated,
        [source]: validatedData,
      };

      return next(req, res);
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a user-friendly format
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Validation error', {
          source,
          errors: formattedErrors,
          path: req.url,
        });

        return sendValidationError(res, formattedErrors);
      }

      // Handle unexpected errors
      logger.error('Unexpected validation error', { error, source, path: req.url });
      return sendValidationError(res, [{ message: 'Validation failed' }]);
    }
  };
}

/**
 * Validates request body
 * @param {object} schema - Zod schema object
 */
export function validateBody(schema) {
  return validateRequest(schema, 'body');
}

/**
 * Validates request query parameters
 * @param {object} schema - Zod schema object
 */
export function validateQuery(schema) {
  return validateRequest(schema, 'query');
}

/**
 * Validates request URL parameters
 * @param {object} schema - Zod schema object
 */
export function validateParams(schema) {
  return validateRequest(schema, 'params');
}

/**
 * Higher-order function to wrap API handlers with validation
 * @param {object} options - Validation options
 * @param {object} options.body - Zod schema for body validation
 * @param {object} options.query - Zod schema for query validation
 * @param {object} options.params - Zod schema for params validation
 * @param {function} handler - API route handler
 */
export function withValidation(options = {}, handler) {
  return async (req, res) => {
    req.validated = {};

    // Validate body
    if (options.body) {
      try {
        req.validated.body = await options.body.parseAsync(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));
          return sendValidationError(res, formattedErrors);
        }
        return sendValidationError(res, [{ message: 'Body validation failed' }]);
      }
    }

    // Validate query
    if (options.query) {
      try {
        req.validated.query = await options.query.parseAsync(req.query);
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));
          return sendValidationError(res, formattedErrors);
        }
        return sendValidationError(res, [{ message: 'Query validation failed' }]);
      }
    }

    // Validate params
    if (options.params) {
      try {
        req.validated.params = await options.params.parseAsync(req.query);
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));
          return sendValidationError(res, formattedErrors);
        }
        return sendValidationError(res, [{ message: 'Params validation failed' }]);
      }
    }

    // Call the handler
    return handler(req, res);
  };
}
