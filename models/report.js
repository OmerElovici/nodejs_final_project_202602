const mongoose = require('mongoose');

/*
 * Report Schema
 * Implements the Computed Design Pattern by caching monthly reports.
 */
const reportSchema = new mongoose.Schema({
  userid: {
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

// Create the model
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
