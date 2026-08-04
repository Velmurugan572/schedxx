// =====================================================================
// Winston Structured Logger Implementation (logger.js)
// =====================================================================

import winston from 'winston';
import { env } from '../config/env.js';

// Setup standard levels (0 = error, 1 = warn, 2 = info, 3 = http, 4 = debug)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Console logger color schema mapping
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan'
};

winston.addColors(colors);

// Define structured message string output format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }), // Automatically append error stack trace if present
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`
  )
);

// Instantiate transport channels
const transports = [
  // Always output formatted logs to the stdout terminal console
  new winston.transports.Console({
    level: env.nodeEnv === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    )
  })
];

// Production specific disk file logging transports
if (env.nodeEnv === 'production') {
  transports.push(
    // Write only error level logs (errors and crashes) to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.uncolorize(),
        format
      )
    }),
    // Write all logs (info, HTTP logs, warnings, errors) to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.uncolorize(),
        format
      )
    })
  );
}

// Create central Winston instance
export const logger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'info',
  levels,
  transports
});

export default logger;
