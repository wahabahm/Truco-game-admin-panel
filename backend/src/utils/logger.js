/**
 * Simple logger utility for backend
 * In production, you might want to use a proper logging library like Winston or Pino
 */

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        if (isDevelopment) {
          console.debug(prefix, message, ...args);
        }
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        // In production, you could send errors to a logging service
        if (!isDevelopment) {
          // Example: Send to error tracking service (Sentry, etc.)
          // errorTrackingService.captureException(new Error(message), { extra: args });
        }
        break;
    }
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
  }

  info(message, ...args) {
    this.log('info', message, ...args);
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  error(message, ...args) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();


