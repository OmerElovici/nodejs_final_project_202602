const mongoose = require('mongoose');

/*
 * Cost Schema
 * Represents a cost item added by a user.
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
  userid: {
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

// Create the model
const Cost = mongoose.model('Cost', costSchema);

module.exports = Cost;
