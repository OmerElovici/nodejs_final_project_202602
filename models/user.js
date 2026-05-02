const mongoose = require('mongoose');

/*
 * User Schema
 * Represents a user in the system.
 */
const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  }
});

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
