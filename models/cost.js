const mongoose = require('mongoose');

/**
 * Cost Schema
 * Defines the structure for an individual cost transaction record.
 * @type {mongoose.Schema}
 */
const costSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'health', 'housing', 'sports', 'education']
  },
  userId: {
    type: Number,
    required: true
  },
  sum: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Cost Model
 * Mongoose model used to interact with the 'costs' collection.
 * @type {mongoose.Model}
 */
const Cost = mongoose.model('Cost', costSchema);

module.exports = Cost;
