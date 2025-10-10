import winston from 'winston';
import * as Sentry from '@sentry/nextjs';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }

  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Log stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'loyalty-saas',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    }),
  ],
});

// In production, you can add file transports or external logging services
if (process.env.NODE_ENV === 'production') {
  // Example: Add file transports
  // logger.add(new winston.transports.File({
  //   filename: 'logs/error.log',
  //   level: 'error'
  // }));
  // logger.add(new winston.transports.File({
  //   filename: 'logs/combined.log'
  // }));

  // Or add external logging service (DataDog, Logtail, etc.)
  // logger.add(new DataDogTransport({ apiKey: process.env.DATADOG_API_KEY }));
}

// Helper methods for common logging patterns
export const loggers = {
  // API request logging
  logRequest: (method, path, userId) => {
    logger.info('API Request', { method, path, userId });
  },

  // API response logging
  logResponse: (method, path, statusCode, duration) => {
    logger.info('API Response', { method, path, statusCode, duration });
  },

  // Error logging with context
  logError: (error, context = {}) => {
    logger.error(error.message || 'Unknown error', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    });

    // Also send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  },

  // Database operation logging
  logDbOperation: (operation, collection, query = {}) => {
    logger.debug('Database Operation', { operation, collection, query });
  },

  // Auth logging
  logAuth: (event, userId, email, success = true) => {
    logger.info('Auth Event', { event, userId, email, success });
  },

  // Security logging (failed auth, suspicious activity)
  logSecurity: (event, details = {}) => {
    logger.warn('Security Event', { event, ...details });
  },
};

export default logger;
