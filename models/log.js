const mongoose = require('mongoose');

/*
 * Log Schema
 * Represents a log entry created by Pino.
 */
const logSchema = new mongoose.Schema({
  level: Number,
  time: Date,
  pid: Number,
  hostname: String,
  msg: String
}, { strict: false }); // Allow other fields added by Pino

// Create the model
const Log = mongoose.model('Log', logSchema, 'logs'); // Explicitly use 'logs' collection

module.exports = Log;
