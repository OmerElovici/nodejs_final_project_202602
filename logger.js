const pino = require('pino');
const pinoHttp = require('pino-http');
const Log = require('./models/log');

/**
 * Custom Pino stream that redirects log messages to a MongoDB database.
 * Implements the 'write' method required by Pino streams.
 * @type {Object}
 */
const streamToMongoDB = {
  /**
   * Writes a log message to the database.
   * @param {string} logMessage - The raw string log message from Pino.
   */
  write: (logMessage) => {
    try {
      const logData = JSON.parse(logMessage);
      
      Log.create(logData).catch(persistenceError => {
        console.error('Failed to save log to DB:', persistenceError);
      });
    } catch (parseError) {
      console.error('Failed to parse log message:', parseError);
    }
  }
};

const logger = pino({}, streamToMongoDB);

const loggerMiddleware = pinoHttp({ logger });

module.exports = { logger, loggerMiddleware };
