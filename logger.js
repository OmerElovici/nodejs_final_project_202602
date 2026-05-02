const pino = require('pino');
const pinoHttp = require('pino-http');
const Log = require('./models/log');

/*
 * Custom Pino stream to write logs to MongoDB using Mongoose.
 */
const streamToMongoDB = {
  write: (msg) => {
    try {
      const logEntry = JSON.parse(msg);
      // Save log to MongoDB
      Log.create(logEntry).catch(err => console.error('Failed to save log to DB:', err));
    } catch (err) {
      console.error('Failed to parse log message:', err);
    }
  }
};

// Create Pino logger instance
const logger = pino({}, streamToMongoDB);

// Create Pino HTTP middleware
const loggerMiddleware = pinoHttp({ logger });

module.exports = { logger, loggerMiddleware };
