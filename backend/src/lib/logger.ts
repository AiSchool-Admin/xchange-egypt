/**
 * Professional Logger Utility
 * Enterprise-grade logging for Xchange Platform
 *
 * Features:
 * - Structured logging with JSON format
 * - Log levels (debug, info, warn, error)
 * - Request context tracking
 * - Performance timing
 * - Environment-aware output
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private serviceName: string;
  private isProduction: boolean;
  private minLevel: LogLevel;

  constructor(serviceName: string = 'xchange-backend') {
    this.serviceName = serviceName;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.minLevel = this.getMinLevel();
  }

  private getMinLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase();
    switch (level) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatEntry(entry: LogEntry): string {
    if (this.isProduction) {
      // JSON format for production (better for log aggregation)
      return JSON.stringify(entry);
    }

    // Human-readable format for development
    const timestamp = entry.timestamp.split('T')[1]?.split('.')[0] || entry.timestamp;
    const levelEmoji = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️ ',
      [LogLevel.WARN]: '⚠️ ',
      [LogLevel.ERROR]: '❌',
    }[entry.level];

    let output = `${timestamp} ${levelEmoji} [${entry.level.toUpperCase()}] ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` | ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack && !this.isProduction) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return output;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const formatted = this.formatEntry(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    const context = this.parseArgs(args);
    this.log(LogLevel.DEBUG, message + context.suffix, context.ctx);
  }

  info(message: string, ...args: unknown[]): void {
    const context = this.parseArgs(args);
    this.log(LogLevel.INFO, message + context.suffix, context.ctx);
  }

  warn(message: string, ...args: unknown[]): void {
    const context = this.parseArgs(args);
    this.log(LogLevel.WARN, message + context.suffix, context.ctx);
  }

  error(message: string, ...args: unknown[]): void {
    const { suffix, ctx, err } = this.parseArgs(args);
    this.log(LogLevel.ERROR, message + suffix, ctx, err);
  }

  private parseArgs(args: unknown[]): { suffix: string; ctx?: LogContext; err?: Error } {
    let suffix = '';
    let ctx: LogContext | undefined;
    let err: Error | undefined;

    for (const arg of args) {
      if (arg instanceof Error) {
        err = arg;
      } else if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        ctx = arg as LogContext;
      } else if (arg !== undefined && arg !== null) {
        suffix += ' ' + String(arg);
      }
    }

    return { suffix, ctx, err };
  }

  // Performance timing helper
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = Math.round(performance.now() - start);
      this.debug(`${label} completed`, { duration, unit: 'ms' });
    };
  }

  // Request logging helper
  request(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, { ...context, type: 'request' });
  }

  // Response logging helper
  response(method: string, path: string, statusCode: number, duration: number): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `${method} ${path} ${statusCode}`, { statusCode, duration, type: 'response' });
  }

  // Database operation logging
  db(operation: string, model: string, context?: LogContext): void {
    this.debug(`DB ${operation} on ${model}`, { ...context, type: 'database' });
  }

  // Create child logger with additional context
  child(additionalContext: LogContext): ChildLogger {
    return new ChildLogger(this, additionalContext);
  }
}

class ChildLogger {
  private parent: Logger;
  private context: LogContext;

  constructor(parent: Logger, context: LogContext) {
    this.parent = parent;
    this.context = context;
  }

  debug(message: string, ...args: unknown[]): void {
    this.parent.debug(message, ...args, this.context);
  }

  info(message: string, ...args: unknown[]): void {
    this.parent.info(message, ...args, this.context);
  }

  warn(message: string, ...args: unknown[]): void {
    this.parent.warn(message, ...args, this.context);
  }

  error(message: string, ...args: unknown[]): void {
    this.parent.error(message, ...args, this.context);
  }
}

// Singleton instance
export const logger = new Logger();

// Factory for creating service-specific loggers
export const createLogger = (serviceName: string): Logger => new Logger(serviceName);

export default logger;
