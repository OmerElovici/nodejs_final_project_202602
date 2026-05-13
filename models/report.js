const mongoose = require('mongoose');

/**
 * Report Schema
 * Defines the structure for cached monthly reports (Computed Design Pattern).
 * @type {mongoose.Schema}
 */
const reportSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  costs: {
    type: Array,
    required: true
  }
});

/**
 * Report Model
 * Mongoose model used to interact with the 'reports' collection.
 * @type {mongoose.Model}
 */
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
